import { Worker, Job } from 'bullmq';
import { getRedis, isRedisAvailable } from '../config/redis';
import { EMAIL_SYNC_QUEUE, SyncJobData } from './emailSync.queue';
import { fetchEmailIds, batchFetchEmails } from '../services/gmail.service';
import { getSupabase } from '../config/db';
import { config } from '../config';

let worker: Worker | null = null;

/**
 * Process a sync job: fetch emails from Gmail, store in DB, trigger AI processing
 */
async function processSync(job: Job<SyncJobData>): Promise<void> {
  const { userId, type } = job.data;
  const supabase = getSupabase();

  console.log(`[Sync Worker] Starting ${type} for user ${userId}`);

  // Get current last_sync_at before updating
  const { data: currentUser } = await supabase
    .from('users')
    .select('last_sync_at')
    .eq('id', userId)
    .single();
  const previousSyncAt = currentUser?.last_sync_at;

  // Update user sync status
  await supabase
    .from('users')
    .update({ 
      sync_status: 'syncing',
      last_sync_at: new Date().toISOString()
    })
    .eq('id', userId);

  try {
    let pageToken: string | undefined;
    let totalProcessed = 0;
    let totalFetched = 0;
    let query: string | undefined;
    const startTime = Date.now();

    // For incremental sync, only fetch emails after last sync
    if (type === 'incremental-sync' && previousSyncAt) {
      const afterDate = new Date(previousSyncAt);
      // Gmail API expects Unix timestamp in seconds
      query = `after:${Math.floor(afterDate.getTime() / 1000)}`;
      console.log(`[Sync Worker] Incremental sync query: ${query}`);
    }

    // Paginate through all emails in batches of 100
    // LIMIT: Only sync first 200 emails for testing
    const MAX_EMAILS_TO_SYNC = 200;
    
    do {
      // Stop if we've reached the limit
      if (totalFetched >= MAX_EMAILS_TO_SYNC) {
        console.log(`[Sync Worker] Reached limit of ${MAX_EMAILS_TO_SYNC} emails, stopping sync`);
        break;
      }
      
      // Fetch batch of message IDs
      const { messageIds, nextPageToken } = await fetchEmailIds(
        userId,
        pageToken,
        100, // Gmail API max
        query
      );

      if (messageIds.length === 0) {
        console.log('[Sync Worker] No more messages to fetch');
        break;
      }

      totalFetched += messageIds.length;
      console.log(`[Sync Worker] Fetched ${messageIds.length} message IDs (total: ${totalFetched})`);

      // Check which emails we already have
      const { data: existing } = await supabase
        .from('emails')
        .select('gmail_id')
        .eq('user_id', userId)
        .in('gmail_id', messageIds);

      const existingIds = new Set((existing || []).map((e) => e.gmail_id));
      const newMessageIds = messageIds.filter((id) => !existingIds.has(id));

      console.log(`[Sync Worker] Found ${newMessageIds.length} new emails (${existingIds.size} already exist)`);

      if (newMessageIds.length > 0) {
        // Fetch full details for new emails with exponential backoff
        const emails = await batchFetchEmailsWithRetry(userId, newMessageIds);

        // Insert into database
        const emailRows = emails.map((email) => ({
          user_id: userId,
          gmail_id: email.gmail_id,
          thread_id: email.thread_id,
          sender_email: email.sender_email,
          sender_name: email.sender_name,
          recipient_emails: email.recipient_emails,
          subject: email.subject,
          snippet: email.snippet,
          body_text: email.body_text,
          date: email.date,
          is_read: email.is_read,
          has_attachments: email.has_attachments,
          label_ids: email.label_ids,
          raw_size_bytes: email.raw_size_bytes,
          is_processed: false,
        }));

        const { error: insertError } = await supabase
          .from('emails')
          .upsert(emailRows, { onConflict: 'user_id,gmail_id' });

        if (insertError) {
          console.error('[Sync Worker] Insert error:', insertError);
          throw insertError;
        }

        totalProcessed += emails.length;
        console.log(`[Sync Worker] Stored ${emails.length} emails (total processed: ${totalProcessed})`);
      }

      // Update progress for frontend tracking
      await job.updateProgress({
        processed: totalProcessed,
        fetched: totalFetched,
        percentage: Math.min(Math.round((totalProcessed / Math.max(totalFetched, 1)) * 100), 100),
      });

      pageToken = nextPageToken;

      // Rate limit: small delay between pages (500ms)
      if (pageToken) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } while (pageToken);

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[Sync Worker] Email fetch complete: ${totalProcessed} new emails in ${elapsedSec}s`);

    // Trigger AI processing for unprocessed emails (batched)
    await triggerAIProcessing(userId, supabase);

    // Update user status
    await supabase
      .from('users')
      .update({
        sync_status: 'completed',
        last_sync_at: new Date().toISOString(),
        total_emails_synced: totalProcessed,
      })
      .eq('id', userId);

    console.log(`[Sync Worker] ✅ Completed ${type} for user ${userId}: ${totalProcessed} emails processed`);
  } catch (error) {
    console.error('[Sync Worker] ❌ Sync failed:', error);

    await supabase
      .from('users')
      .update({ sync_status: 'failed' })
      .eq('id', userId);

    throw error; // Re-throw to trigger BullMQ retry with exponential backoff
  }
}

/**
 * Fetch emails with exponential backoff on rate limit errors
 */
async function batchFetchEmailsWithRetry(
  userId: string,
  messageIds: string[],
  maxRetries = 3
): Promise<any[]> {
  let attempt = 0;
  let delay = 1000; // Start with 1 second

  while (attempt < maxRetries) {
    try {
      return await batchFetchEmails(userId, messageIds);
    } catch (error: any) {
      attempt++;
      
      if (error.code === 429 || error.message?.includes('rate limit')) {
        console.warn(`[Sync Worker] Rate limit hit, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw new Error('Max retries exceeded due to rate limiting');
        }
      } else {
        throw error; // Re-throw non-rate-limit errors
      }
    }
  }

  return [];
}

/**
 * Trigger AI processing for unprocessed emails in batches
 */
async function triggerAIProcessing(userId: string, supabase: any): Promise<void> {
  try {
    let offset = 0;
    const batchSize = 50; // Process 50 emails at a time
    let hasMore = true;

    while (hasMore) {
      const { data: unprocessed, error } = await supabase
        .from('emails')
        .select('id, subject, snippet, sender_email, body_text')
        .eq('user_id', userId)
        .eq('is_processed', false)
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('[Sync Worker] Error fetching unprocessed emails:', error);
        break;
      }

      if (!unprocessed || unprocessed.length === 0) {
        hasMore = false;
        break;
      }

      console.log(`[Sync Worker] Sending batch of ${unprocessed.length} emails to AI service...`);

      // Send to AI microservice for classification + embedding
      const response = await fetch(`${config.aiServiceUrl}/ai/process/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          emails: unprocessed.map((e) => ({
            email_id: e.id,
            subject: e.subject || '',
            snippet: e.snippet || '',
            sender_email: e.sender_email || '',
            body_text: e.body_text || '',
          })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Sync Worker] AI processing failed:', errorText);
        // Continue to next batch even if this one fails
      } else {
        const result = await response.json();
        console.log(`[Sync Worker] AI processing result: ${result.processed} processed, ${result.failed} failed`);
      }

      offset += batchSize;

      // Small delay between AI batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('[Sync Worker] ✅ AI processing triggered for all unprocessed emails');
  } catch (aiError) {
    console.error('[Sync Worker] ⚠️ AI service call failed:', aiError);
    // Don't fail the whole sync if AI is down
  }
}

/**
 * Start the email sync worker
 */
export function startSyncWorker(): Worker | null {
  if (worker) return worker;

  if (!isRedisAvailable()) {
    console.warn('[Sync Worker] ⚠️  Redis unavailable - worker NOT started');
    console.warn('[Sync Worker] Email sync functionality will be disabled');
    return null;
  }

  const redis = getRedis();
  if (!redis) {
    console.warn('[Sync Worker] ⚠️  Redis connection failed - worker NOT started');
    return null;
  }

  try {
    worker = new Worker(EMAIL_SYNC_QUEUE, processSync, {
      connection: redis,
      concurrency: 2, // Process 2 sync jobs at a time
      limiter: {
        max: 5,
        duration: 60000, // Max 5 jobs per minute
      },
    });

    worker.on('completed', (job) => {
      console.log(`[Sync Worker] Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Sync Worker] Job ${job?.id} failed:`, err.message);
    });

    worker.on('error', (err) => {
      console.error('[Sync Worker] Worker error:', err);
    });

    console.log('[Sync Worker] ✅ Started successfully');
    return worker;
  } catch (error: any) {
    console.error('[Sync Worker] ❌ Failed to start:', error.message);
    console.warn('[Sync Worker] ⚠️  Email sync disabled');
    return null;
  }
}

/**
 * Stop the sync worker gracefully
 */
export async function stopSyncWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
    console.log('[Sync Worker] Stopped');
  }
}
