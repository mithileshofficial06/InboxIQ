import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getSupabase } from '../config/db';
import { triggerFullSync, triggerIncrementalSync, getEmailSyncQueue } from '../queues/emailSync.queue';

const router = Router();

// All email routes require authentication
router.use(authMiddleware);

/**
 * GET /emails
 * Paginated email list with filtering
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      category,
      sender,
      search,
      sort = 'date',
      order = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    const supabase = getSupabase();
    let query = supabase
      .from('emails')
      .select('id, gmail_id, thread_id, sender_email, sender_name, subject, snippet, date, category, sentiment, is_read, has_attachments, label_ids', { count: 'exact' })
      .eq('user_id', req.userId!);

    // Filters
    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }
    if (sender && typeof sender === 'string') {
      query = query.ilike('sender_email', `%${sender}%`);
    }
    if (search && typeof search === 'string') {
      query = query.or(`subject.ilike.%${search}%,snippet.ilike.%${search}%`);
    }

    // Sorting
    const sortField = sort as string;
    const sortOrder = order === 'asc' ? true : false;
    query = query.order(sortField, { ascending: sortOrder });

    // Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data: emails, count, error } = await query;

    if (error) {
      console.error('[Emails] Query error:', error);
      res.status(500).json({ error: 'Failed to fetch emails' });
      return;
    }

    res.json({
      emails: emails || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum),
      },
    });
  } catch (error) {
    console.error('[Emails] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /emails/:id
 * Single email detail
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data: email, error } = await supabase
      .from('emails')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .single();

    if (error || !email) {
      res.status(404).json({ error: 'Email not found' });
      return;
    }

    res.json({ email });
  } catch (error) {
    console.error('[Emails] Detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /emails/thread/:threadId
 * Full email thread
 */
router.get('/thread/:threadId', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data: thread, error } = await supabase
      .from('emails')
      .select('*')
      .eq('thread_id', req.params.threadId)
      .eq('user_id', req.userId!)
      .order('date', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch thread' });
      return;
    }

    res.json({ thread: thread || [] });
  } catch (error) {
    console.error('[Emails] Thread error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /emails/sync
 * Trigger email sync
 */
router.post('/sync', async (req: AuthRequest, res: Response) => {
  try {
    const { type = 'incremental' } = req.body;

    let jobId: string;
    if (type === 'full') {
      jobId = await triggerFullSync(req.userId!);
    } else {
      jobId = await triggerIncrementalSync(req.userId!);
    }

    res.json({
      message: `${type} sync started`,
      jobId,
    });
  } catch (error) {
    console.error('[Emails] Sync trigger error:', error);
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

/**
 * GET /emails/sync/status
 * Get current sync status with detailed progress
 */
router.get('/sync/status', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data: user, error } = await supabase
      .from('users')
      .select('sync_status, last_sync_at, total_emails_synced')
      .eq('id', req.userId!)
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get total emails count
    const { count: totalEmails } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.userId!);

    // Get unprocessed (not yet classified/embedded) emails
    const { count: unprocessedCount } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', req.userId!)
      .eq('is_processed', false);

    // Get categorized emails for breakdown
    const { data: categoryBreakdown } = await supabase
      .from('emails')
      .select('category')
      .eq('user_id', req.userId!)
      .is('category', 'NOT NULL');

    const categories: Record<string, number> = {};
    categoryBreakdown?.forEach((email) => {
      categories[email.category] = (categories[email.category] || 0) + 1;
    });

    const processingPercentage = totalEmails && totalEmails > 0
      ? Math.round(((totalEmails - (unprocessedCount || 0)) / totalEmails) * 100)
      : 0;

    res.json({
      status: user.sync_status,
      lastSyncAt: user.last_sync_at,
      totalEmailsSynced: user.total_emails_synced,
      stats: {
        totalEmails: totalEmails || 0,
        processedEmails: (totalEmails || 0) - (unprocessedCount || 0),
        unprocessedEmails: unprocessedCount || 0,
        processingPercentage,
      },
      categories,
    });
  } catch (error) {
    console.error('[Emails] Sync status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
