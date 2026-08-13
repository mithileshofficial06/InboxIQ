import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AiServiceError, ragQuery, semanticSearch } from '../services/aiService.client';

const router = Router();

// Every route here reaches the AI service, which trusts the userId it is given.
// Authentication is therefore mandatory, and userId always comes from the JWT.
router.use(authMiddleware);

function handleAiError(error: unknown, res: Response, label: string): void {
  if (error instanceof AiServiceError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  console.error(`[${label}] Unexpected error:`, error);
  res.status(500).json({ error: 'Internal server error' });
}

/**
 * POST /search/semantic
 * Semantic search across the authenticated user's emails.
 */
router.post('/semantic', async (req: AuthRequest, res: Response) => {
  try {
    const { query, category, dateFrom, dateTo, limit } = req.body ?? {};

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const parsedLimit = Number.parseInt(String(limit ?? 20), 10);
    const topK = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 20;

    const data = await semanticSearch({
      // Identity comes from the verified token, never from the request body.
      userId: req.userId!,
      query: query.trim().slice(0, 1000),
      topK,
      category: typeof category === 'string' ? category : null,
      dateFrom: typeof dateFrom === 'string' ? dateFrom : null,
      dateTo: typeof dateTo === 'string' ? dateTo : null,
    });

    res.json({
      query: query.trim(),
      results: (data.results ?? []).map((r) => ({
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
      totalFound: data.total_found ?? 0,
    });
  } catch (error) {
    handleAiError(error, res, 'Search');
  }
});

/**
 * POST /search/chat
 * RAG question-answering over the authenticated user's emails.
 *
 * Replaces the previous flow where the browser called the AI service directly
 * with a client-supplied user_id — which let any user read any other inbox.
 */
router.post('/chat', async (req: AuthRequest, res: Response) => {
  try {
    const { query, topK } = req.body ?? {};

    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Query is required' });
      return;
    }

    const parsedTopK = Number.parseInt(String(topK ?? 20), 10);
    const boundedTopK = Number.isFinite(parsedTopK) ? Math.min(Math.max(parsedTopK, 1), 50) : 20;

    const data = await ragQuery({
      userId: req.userId!,
      query: query.trim().slice(0, 2000),
      topK: boundedTopK,
    });

    res.json({
      answer: data.answer,
      query: data.query,
      sources: (data.sources ?? []).map((s) => ({
        emailId: s.email_id,
        chunkText: s.chunk_text,
        similarity: s.similarity_score,
        subject: s.subject,
        senderEmail: s.sender_email,
        date: s.date,
      })),
    });
  } catch (error) {
    handleAiError(error, res, 'Chat');
  }
});

/**
 * GET /search/suggestions
 * Suggested queries. Static for now.
 */
router.get('/suggestions', (_req: AuthRequest, res: Response) => {
  res.json({
    suggestions: [
      'Show me job rejection emails from last month',
      'Find emails about Amazon orders',
      'What bills do I need to pay?',
      'Show me all emails from recruiters',
      'Find travel booking confirmations',
      'Show me academic emails from this semester',
      'Find OTP codes from yesterday',
      'What newsletters did I receive this week?',
    ],
  });
});

export default router;
