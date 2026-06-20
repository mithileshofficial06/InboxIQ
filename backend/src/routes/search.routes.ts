import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import axios from 'axios';

const router = Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * POST /search/semantic
 * Perform semantic search across user's emails
 */
router.post('/semantic', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { query, category, dateFrom, dateTo, limit = 20 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Call AI service for semantic search
    const response = await axios.post(`${AI_SERVICE_URL}/ai/search/semantic`, {
      query: query.trim(),
      user_id: userId,
      top_k: Math.min(limit, 50), // Max 50 results
      category: category || null,
      date_from: dateFrom || null,
      date_to: dateTo || null,
    });

    const { results, total_found } = response.data;

    // Format response
    return res.json({
      query,
      results: results.map((r: any) => ({
        emailId: r.email_id,
        chunkText: r.chunk_text,
        similarity: r.similarity_score,
        subject: r.subject,
        senderName: r.sender_name,
        senderEmail: r.sender_email,
        receivedAt: r.received_at,
        category: r.category,
        sentiment: r.sentiment,
      })),
      totalFound: total_found,
    });
  } catch (error: any) {
    console.error('Semantic search error:', error.message);
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: 'AI service error',
        details: error.response.data,
      });
    }
    
    return res.status(500).json({ error: 'Failed to perform search' });
  }
});

/**
 * GET /search/suggestions
 * Get suggested search queries based on user's email patterns
 */
router.get('/suggestions', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Static suggestions for now - can be made dynamic later
    const suggestions = [
      "Show me job rejection emails from last month",
      "Find emails about Amazon orders",
      "What bills do I need to pay?",
      "Show me all emails from recruiters",
      "Find travel booking confirmations",
      "Show me academic emails from this semester",
      "Find OTP codes from yesterday",
      "What newsletters did I receive this week?",
    ];

    return res.json({ suggestions });
  } catch (error: any) {
    console.error('Error fetching suggestions:', error.message);
    return res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
