import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getSupabase } from '../config/db';

const router = Router();
router.use(authMiddleware);

/**
 * GET /analytics/overview
 * High-level email stats
 */
router.get('/overview', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const userId = req.userId!;

    // Total emails
    const { count: totalEmails } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Emails today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayEmails } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('date', today.toISOString());

    // Unread count
    const { count: unreadCount } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    // Date range for average calculation
    const { data: dateRange } = await supabase
      .from('emails')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(1);

    let avgPerDay = 0;
    if (dateRange && dateRange.length > 0 && totalEmails) {
      const firstDate = new Date(dateRange[0].date);
      const days = Math.max(1, Math.ceil((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
      avgPerDay = Math.round((totalEmails / days) * 10) / 10;
    }

    res.json({
      totalEmails: totalEmails || 0,
      todayEmails: todayEmails || 0,
      unreadCount: unreadCount || 0,
      avgPerDay,
    });
  } catch (error) {
    console.error('[Analytics] Overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /analytics/categories
 * Email distribution across AI categories
 */
router.get('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('emails')
      .select('category')
      .eq('user_id', req.userId!)
      .not('category', 'is', null);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch categories' });
      return;
    }

    // Count by category
    const categoryCounts: Record<string, number> = {};
    (data || []).forEach((e) => {
      const cat = e.category || 'Uncategorized';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    res.json({ categories });
  } catch (error) {
    console.error('[Analytics] Categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /analytics/volume
 * Email volume over time
 */
router.get('/volume', async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'daily' } = req.query;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('emails')
      .select('date')
      .eq('user_id', req.userId!)
      .order('date', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch volume data' });
      return;
    }

    // Group by period
    const volumeMap: Record<string, number> = {};
    (data || []).forEach((e) => {
      const date = new Date(e.date);
      let key: string;

      if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      } else {
        key = date.toISOString().split('T')[0];
      }

      volumeMap[key] = (volumeMap[key] || 0) + 1;
    });

    const volume = Object.entries(volumeMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ volume, period });
  } catch (error) {
    console.error('[Analytics] Volume error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /analytics/sentiment
 * Sentiment distribution
 */
router.get('/sentiment', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('emails')
      .select('sentiment, date')
      .eq('user_id', req.userId!)
      .not('sentiment', 'is', null)
      .order('date', { ascending: true });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch sentiment data' });
      return;
    }

    // Overall distribution
    const distribution: Record<string, number> = { positive: 0, negative: 0, neutral: 0 };
    (data || []).forEach((e) => {
      if (e.sentiment && distribution.hasOwnProperty(e.sentiment)) {
        distribution[e.sentiment]++;
      }
    });

    res.json({ distribution });
  } catch (error) {
    console.error('[Analytics] Sentiment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /analytics/top-senders
 * Most frequent senders
 */
router.get('/top-senders', async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('emails')
      .select('sender_email, sender_name')
      .eq('user_id', req.userId!);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch senders' });
      return;
    }

    // Count by sender
    const senderCounts: Record<string, { email: string; name: string; count: number }> = {};
    (data || []).forEach((e) => {
      const key = e.sender_email || 'unknown';
      if (!senderCounts[key]) {
        senderCounts[key] = { email: key, name: e.sender_name || key, count: 0 };
      }
      senderCounts[key].count++;
    });

    const topSenders = Object.values(senderCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, parseInt(limit as string));

    res.json({ topSenders });
  } catch (error) {
    console.error('[Analytics] Top senders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /analytics/heatmap
 * Hour x Day-of-week email frequency matrix
 */
router.get('/heatmap', async (req: AuthRequest, res: Response) => {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('emails')
      .select('date')
      .eq('user_id', req.userId!);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch heatmap data' });
      return;
    }

    // Build 7x24 matrix (days x hours)
    const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

    (data || []).forEach((e) => {
      const date = new Date(e.date);
      const day = date.getDay(); // 0 = Sunday
      const hour = date.getHours();
      heatmap[day][hour]++;
    });

    res.json({
      heatmap,
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      hours: Array.from({ length: 24 }, (_, i) => i),
    });
  } catch (error) {
    console.error('[Analytics] Heatmap error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
