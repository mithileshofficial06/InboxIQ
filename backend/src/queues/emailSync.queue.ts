import { Queue } from 'bullmq';
import { getRedis } from '../config/redis';

export const EMAIL_SYNC_QUEUE = 'email-sync';

let emailSyncQueue: Queue | null = null;

export function getEmailSyncQueue(): Queue {
  if (!emailSyncQueue) {
    emailSyncQueue = new Queue(EMAIL_SYNC_QUEUE, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return emailSyncQueue;
}

export interface SyncJobData {
  userId: string;
  type: 'full-sync' | 'incremental-sync';
  pageToken?: string;
}

/**
 * Add a full sync job to the queue
 */
export async function triggerFullSync(userId: string): Promise<string> {
  const queue = getEmailSyncQueue();
  const job = await queue.add('full-sync', {
    userId,
    type: 'full-sync',
  } as SyncJobData);
  return job.id || '';
}

/**
 * Add an incremental sync job (only new emails since last sync)
 */
export async function triggerIncrementalSync(userId: string): Promise<string> {
  const queue = getEmailSyncQueue();
  const job = await queue.add('incremental-sync', {
    userId,
    type: 'incremental-sync',
  } as SyncJobData);
  return job.id || '';
}
