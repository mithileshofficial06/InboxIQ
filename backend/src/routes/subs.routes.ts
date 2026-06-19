import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getSupabase } from '../config/db';

const router = Router();
router.use(authMiddleware);

/**
 * GET /subs
 * All detected subscriptions
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query;
    const supabase = getSupabase();

    let query = supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.userId!)
      .order('email_count', { ascending: false });

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch subscriptions' });
      return;
    }

    res.json({ subscriptions: data || [] });
  } catch (error) {
    console.error('[Subs] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /subs/dead
 * Dead subscriptions (no emails in 90+ days)
 */
router.get('/dead', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.userId!)
      .eq('is_dead', true)
      .order('last_email_date', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch dead subscriptions' });
      return;
    }

    res.json({ deadSubscriptions: data || [] });
  } catch (error) {
    console.error('[Subs] Dead error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
