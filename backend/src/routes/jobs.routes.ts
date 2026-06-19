import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getSupabase } from '../config/db';

const router = Router();
router.use(authMiddleware);

/**
 * GET /jobs
 * All tracked job applications
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', req.userId!)
      .order('last_update_date', { ascending: false });

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
      return;
    }

    res.json({ jobs: data || [] });
  } catch (error) {
    console.error('[Jobs] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /jobs/stats
 * Aggregate job application stats
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('job_applications')
      .select('status, applied_date, last_update_date')
      .eq('user_id', req.userId!);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch job stats' });
      return;
    }

    const jobs = data || [];
    const statusCounts: Record<string, number> = {};
    jobs.forEach((j) => {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
    });

    const replied = jobs.filter((j) => j.status !== 'applied').length;
    const responseRate = jobs.length > 0 ? Math.round((replied / jobs.length) * 100) : 0;

    res.json({
      total: jobs.length,
      statusCounts,
      responseRate,
    });
  } catch (error) {
    console.error('[Jobs] Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /jobs/:id
 * Update job application status manually
 */
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, notes } = req.body;
    const supabase = getSupabase();

    const updates: Record<string, any> = { last_update_date: new Date().toISOString() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('job_applications')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Job application not found' });
      return;
    }

    res.json({ job: data });
  } catch (error) {
    console.error('[Jobs] Update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
