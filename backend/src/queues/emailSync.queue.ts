import { Queue } from 'bullmq';
import { getRedis, isRedisAvailable } from '../config/redis';

export const EMAIL_SYNC_QUEUE = 'email-sync';

let emailSyncQueue: Queue | null = null;

export function getEmailSyncQueue(): Queue | null {
  if (!isRedisAvailable()) {
    console.warn('[Email Sync Queue] Redis not available - queue disabled');
    return null;
  }
  
  if (!emailSyncQueue) {
    const redis = getRedis();
    if (!redis) {
      console.warn('[Email Sync Queue] Redis connection failed - queue disabled');
      return null;
    }
    
    try {
      emailSyncQueue = new Queue(EMAIL_SYNC_QUEUE, {
        connection: redis,
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
    } catch (error: any) {
      console.error('[Email Sync Queue] Failed to create queue:', error.message);
      return null;
    }
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
  if (!queue) {
    console.warn('[Email Sync] Redis unavailable - sync job not queued');
    return '';
  }
  
  try {
    const job = await queue.add('full-sync', {
      userId,
      type: 'full-sync',
    } as SyncJobData);
    return job.id || '';
  } catch (error: any) {
    console.error('[Email Sync] Failed to queue job:', error.message);
    return '';
  }
}

/**
 * Add an incremental sync job (only new emails since last sync)
 */
export async function triggerIncrementalSync(userId: string): Promise<string> {
  const queue = getEmailSyncQueue();
  if (!queue) {
    console.warn('[Email Sync] Redis unavailable - sync job not queued');
    return '';
  }
  
  try {
    const job = await queue.add('incremental-sync', {
      userId,
      type: 'incremental-sync',
    } as SyncJobData);
    return job.id || '';
  } catch (error: any) {
    console.error('[Email Sync] Failed to queue job:', error.message);
    return '';
  }
}
