import { google, gmail_v1 } from 'googleapis';
import { getOAuth2Client } from '../config/google';
import { getSupabase } from '../config/db';

interface EmailMetadata {
  gmail_id: string;
  thread_id: string;
  sender_email: string;
  sender_name: string;
  recipient_emails: string[];
  subject: string;
  snippet: string;
  body_text: string;
  date: string;
  is_read: boolean;
  has_attachments: boolean;
  label_ids: string[];
  raw_size_bytes: number;
}

/**
 * Refreshes the access token if it's expired
 */
async function getAuthenticatedClient(userId: string) {
  const supabase = getSupabase();
  const { data: user, error } = await supabase
    .from('users')
    .select('access_token, refresh_token, token_expiry')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
  });

  // Check if token is expired or about to expire (5 min buffer)
  const now = Date.now();
  const expiry = user.token_expiry ? new Date(user.token_expiry).getTime() : 0;

  if (now >= expiry - 5 * 60 * 1000) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      oauth2Client.setCredentials(credentials);

      // Update tokens in database
      await supabase
        .from('users')
        .update({
          access_token: credentials.access_token,
          token_expiry: credentials.expiry_date
            ? new Date(credentials.expiry_date).toISOString()
            : null,
        })
        .eq('id', userId);
    } catch (refreshError) {
      console.error('[Gmail] Token refresh failed:', refreshError);
      throw new Error('Token refresh failed. User needs to re-authenticate.');
    }
  }

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Extracts plain text body from Gmail message parts
 */
function extractBody(payload: gmail_v1.Schema$MessagePart): string {
  // Direct body
  if (payload.mimeType === 'text/plain' && payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8');
  }

  // Multipart — recurse through parts
  if (payload.parts) {
    for (const part of payload.parts) {
      // Prefer text/plain
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    // Fallback to text/html if no plain text
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        const html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        // Strip HTML tags for embedding purposes
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    }

    // Recurse into nested multipart
    for (const part of payload.parts) {
      if (part.parts) {
        const result = extractBody(part);
        if (result) return result;
      }
    }
  }

  return '';
}

/**
 * Parses sender string "Name <email>" into parts
 */
function parseSender(from: string): { name: string; email: string } {
  const match = from.match(/^"?([^"<]*)"?\s*<?([^>]*)>?$/);
  if (match) {
    return {
      name: match[1].trim(),
      email: match[2].trim() || match[1].trim(),
    };
  }
  return { name: from, email: from };
}

/**
 * Fetches a list of message IDs with pagination
 */
export async function fetchEmailIds(
  userId: string,
  pageToken?: string,
  maxResults: number = 100,
  query?: string
): Promise<{ messageIds: string[]; nextPageToken?: string }> {
  const gmail = await getAuthenticatedClient(userId);

  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    pageToken: pageToken || undefined,
    q: query || undefined,
  });

  const messageIds = (response.data.messages || []).map((m) => m.id!);
  return {
    messageIds,
    nextPageToken: response.data.nextPageToken || undefined,
  };
}

/**
 * Fetches full email details by ID
 */
export async function fetchEmailDetail(
  userId: string,
  messageId: string
): Promise<EmailMetadata> {
  const gmail = await getAuthenticatedClient(userId);

  const response = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const message = response.data;
  const headers = message.payload?.headers || [];

  const getHeader = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

  const sender = parseSender(getHeader('From'));
  const toHeader = getHeader('To');
  const recipients = toHeader
    ? toHeader.split(',').map((r) => {
        const parsed = parseSender(r.trim());
        return parsed.email;
      })
    : [];

  const body = message.payload ? extractBody(message.payload) : '';

  return {
    gmail_id: message.id || '',
    thread_id: message.threadId || '',
    sender_email: sender.email,
    sender_name: sender.name,
    recipient_emails: recipients,
    subject: getHeader('Subject'),
    snippet: message.snippet || '',
    body_text: body.substring(0, 10000), // Cap at 10k chars
    date: getHeader('Date')
      ? new Date(getHeader('Date')).toISOString()
      : new Date().toISOString(),
    is_read: !(message.labelIds || []).includes('UNREAD'),
    has_attachments: (message.payload?.parts || []).some(
      (p) => p.filename && p.filename.length > 0
    ),
    label_ids: message.labelIds || [],
    raw_size_bytes: message.sizeEstimate || 0,
  };
}

/**
 * Batch fetch email details (max 50 at a time to respect rate limits)
 */
export async function batchFetchEmails(
  userId: string,
  messageIds: string[]
): Promise<EmailMetadata[]> {
  const results: EmailMetadata[] = [];
  const batchSize = 10; // Conservative to avoid rate limits

  for (let i = 0; i < messageIds.length; i += batchSize) {
    const batch = messageIds.slice(i, i + batchSize);
    const promises = batch.map((id) =>
      fetchEmailDetail(userId, id).catch((err) => {
        console.error(`[Gmail] Failed to fetch email ${id}:`, err.message);
        return null;
      })
    );

    const batchResults = await Promise.all(promises);
    results.push(...batchResults.filter((r): r is EmailMetadata => r !== null));

    // Small delay between batches to avoid rate limits
    if (i + batchSize < messageIds.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}
