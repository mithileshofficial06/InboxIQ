/**
 * Email Sync Routes
 * Handles triggering syncs and monitoring progress
 */
import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getSupabase } from '../config/db';
import {
  triggerFullSync,
  triggerIncrementalSync,
  getEmailSyncQueue,
} from '../queues/emailSync.queue';

const router = Router();
router.use(authMiddleware);

/**
 * POST /sync/start
 * Start a full inbox sync (all emails)
 */
router.post('/start', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const supabase = getSupabase();

    // Check if already syncing
    const { data: user } = await supabase
      .from('users')
      .select('sync_status')
      .eq('id', userId)
      .single();

    if (user?.sync_status === 'syncing') {
      res.status(400).json({ error: 'Sync already in progress' });
      return;
    }

    // Trigger sync
    const jobId = await triggerFullSync(userId);

    res.json({
      success: true,
      jobId,
      message: 'Full inbox sync started',
      status: 'Preparing to fetch emails...',
    });
  } catch (error) {
    console.error('[Sync Start] Error:', error);
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

/**
 * POST /sync/incremental
 * Sync only new emails since last sync
 */
router.post('/incremental', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const supabase = getSupabase();

    // Check if already syncing
    const { data: user } = await supabase
      .from('users')
      .select('sync_status, last_sync_at')
      .eq('id', userId)
      .single();

    if (user?.sync_status === 'syncing') {
      res.status(400).json({ error: 'Sync already in progress' });
      return;
    }

    // Trigger incremental sync
    const jobId = await triggerIncrementalSync(userId);

    const lastSync = user?.last_sync_at
      ? new Date(user.last_sync_at).toLocaleString()
      : 'Never';

    res.json({
      success: true,
      jobId,
      message: 'Incremental sync started',
      lastSync,
    });
  } catch (error) {
    console.error('[Sync Incremental] Error:', error);
    res.status(500).json({ error: 'Failed to start incremental sync' });
  }
});

/**
 * GET /sync/status
 * Get current sync status for the user
 */
router.get('/status', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select(
        'sync_status, last_sync_at, total_emails_synced'
      )
      .eq('id', userId)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get total emails count
    const { count: totalEmails } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get unprocessed emails count
    const { count: unprocessedCount } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_processed', false);

    res.json({
      status: user.sync_status,
      lastSync: user.last_sync_at,
      totalEmailsSynced: user.total_emails_synced,
      totalEmails: totalEmails || 0,
      unprocessedEmails: unprocessedCount || 0,
      percentComplete:
        totalEmails && totalEmails > 0
          ? Math.round(
              ((totalEmails - unprocessedCount!) / totalEmails) * 100
            )
          : 0,
    });
  } catch (error) {
    console.error('[Sync Status] Error:', error);
    res.status(500).json({ error: 'Failed to get sync status' });
  }
});

/**
 * GET /sync/job/:jobId
 * Get progress of a specific sync job
 */
router.get('/job/:jobId', async (req: AuthRequest, res: Response) => {
  try {
    const { jobId } = req.params;
    const queue = getEmailSyncQueue();

    const job = await queue.getJob(jobId);

    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    const progress = job.progress() || 0;
    const state = await job.getState();
    const attempts = job.attemptsMade;
    const failedReason = job.failedReason;

    res.json({
      jobId,
      state,
      progress: Math.round(progress as number),
      attempts,
      failedReason,
      isCompleted: state === 'completed',
      isFailed: state === 'failed',
    });
  } catch (error) {
    console.error('[Sync Job] Error:', error);
    res.status(500).json({ error: 'Failed to get job status' });
  }
});

export default router;
