import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getSupabase } from '../config/db';

const router = Router();
router.use(authMiddleware);

/**
 * GET /people
 * Contact list with relationship scores
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { sort = 'frequency', limit = '20' } = req.query;
    const supabase = getSupabase();

    // Fetch all emails to compute contact stats
    const { data: emails, error } = await supabase
      .from('emails')
      .select('sender_email, sender_name, date, is_read')
      .eq('user_id', req.userId!);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch people data' });
      return;
    }

    // Compute per-contact stats
    const contactMap: Record<string, {
      email: string;
      name: string;
      emailCount: number;
      lastEmailDate: string;
      firstEmailDate: string;
    }> = {};

    (emails || []).forEach((e) => {
      const key = e.sender_email || 'unknown';
      if (!contactMap[key]) {
        contactMap[key] = {
          email: key,
          name: e.sender_name || key,
          emailCount: 0,
          lastEmailDate: e.date,
          firstEmailDate: e.date,
        };
      }
      contactMap[key].emailCount++;
      if (e.date > contactMap[key].lastEmailDate) contactMap[key].lastEmailDate = e.date;
      if (e.date < contactMap[key].firstEmailDate) contactMap[key].firstEmailDate = e.date;
    });

    let contacts = Object.values(contactMap);

    // Sort
    if (sort === 'recency') {
      contacts.sort((a, b) => b.lastEmailDate.localeCompare(a.lastEmailDate));
    } else {
      contacts.sort((a, b) => b.emailCount - a.emailCount);
    }

    contacts = contacts.slice(0, parseInt(limit as string));

    res.json({ contacts });
  } catch (error) {
    console.error('[People] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /people/:email
 * Detailed contact stats
 */
router.get('/:email', async (req: AuthRequest, res: Response) => {
  try {
    const contactEmail = decodeURIComponent(req.params.email);
    const supabase = getSupabase();

    const { data: emails, error } = await supabase
      .from('emails')
      .select('id, subject, snippet, date, category, sentiment')
      .eq('user_id', req.userId!)
      .eq('sender_email', contactEmail)
      .order('date', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch contact data' });
      return;
    }

    const totalEmails = emails?.length || 0;
    const categories: Record<string, number> = {};
    (emails || []).forEach((e) => {
      const cat = e.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    res.json({
      email: contactEmail,
      totalEmails,
      categories,
      recentEmails: (emails || []).slice(0, 10),
    });
  } catch (error) {
    console.error('[People] Detail error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
