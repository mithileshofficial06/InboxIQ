import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
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

  // Update user sync status
  await supabase
    .from('users')
    .update({ sync_status: 'syncing' })
    .eq('id', userId);

  try {
    let pageToken: string | undefined;
    let totalProcessed = 0;
    let query: string | undefined;

    // For incremental sync, only fetch emails after last sync
    if (type === 'incremental-sync') {
      const { data: user } = await supabase
        .from('users')
        .select('last_sync_at')
        .eq('id', userId)
        .single();

      if (user?.last_sync_at) {
        const afterDate = new Date(user.last_sync_at);
        query = `after:${Math.floor(afterDate.getTime() / 1000)}`;
      }
    }

    // Paginate through all emails
    do {
      // Fetch batch of message IDs
      const { messageIds, nextPageToken } = await fetchEmailIds(
        userId,
        pageToken,
        100,
        query
      );

      if (messageIds.length === 0) break;

      // Check which emails we already have
      const { data: existing } = await supabase
        .from('emails')
        .select('gmail_id')
        .eq('user_id', userId)
        .in('gmail_id', messageIds);

      const existingIds = new Set((existing || []).map((e) => e.gmail_id));
      const newMessageIds = messageIds.filter((id) => !existingIds.has(id));

      if (newMessageIds.length > 0) {
        // Fetch full details for new emails
        const emails = await batchFetchEmails(userId, newMessageIds);

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
        }

        totalProcessed += emails.length;
      }

      // Update progress
      await job.updateProgress(totalProcessed);
      console.log(`[Sync Worker] Processed ${totalProcessed} emails so far...`);

      pageToken = nextPageToken;

      // Rate limit: small delay between pages
      await new Promise((resolve) => setTimeout(resolve, 500));
    } while (pageToken);

    // Trigger AI processing for unprocessed emails
    try {
      const { data: unprocessed } = await supabase
        .from('emails')
        .select('id, subject, snippet, sender_email, body_text')
        .eq('user_id', userId)
        .eq('is_processed', false)
        .limit(100);

      if (unprocessed && unprocessed.length > 0) {
        // Send to AI microservice for classification + embedding
        const response = await fetch(`${config.aiServiceUrl}/ai/process/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            emails: unprocessed.map((e) => ({
              email_id: e.id,
              subject: e.subject,
              snippet: e.snippet,
              sender_email: e.sender_email,
              body_text: e.body_text,
            })),
          }),
        });

        if (!response.ok) {
          console.error('[Sync Worker] AI processing failed:', await response.text());
        }
      }
    } catch (aiError) {
      console.error('[Sync Worker] AI service call failed:', aiError);
      // Don't fail the whole sync if AI is down
    }

    // Update user status
    await supabase
      .from('users')
      .update({
        sync_status: 'completed',
        last_sync_at: new Date().toISOString(),
        total_emails_synced: totalProcessed,
      })
      .eq('id', userId);

    console.log(`[Sync Worker] Completed ${type} for user ${userId}: ${totalProcessed} emails`);
  } catch (error) {
    console.error('[Sync Worker] Sync failed:', error);

    await supabase
      .from('users')
      .update({ sync_status: 'failed' })
      .eq('id', userId);

    throw error; // Re-throw to trigger BullMQ retry
  }
}

/**
 * Start the email sync worker
 */
export function startSyncWorker(): Worker {
  if (worker) return worker;

  worker = new Worker(EMAIL_SYNC_QUEUE, processSync, {
    connection: getRedis(),
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

  console.log('[Sync Worker] Started successfully');
  return worker;
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
