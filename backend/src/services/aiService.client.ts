import { config } from '../config';

/**
 * The single place the backend talks to the AI microservice.
 *
 * The AI service trusts whatever `user_id` it is given, so it is a private
 * component: every call must originate here, carry the shared service token,
 * and pass a userId that came from a verified JWT — never from a request body.
 */

export class AiServiceError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

const DEFAULT_TIMEOUT_MS = 120_000;

async function callAiService<T>(
  path: string,
  body: unknown,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  if (!config.aiService.token) {
    throw new AiServiceError('AI_SERVICE_TOKEN is not configured on the backend.', 503);
  }

  let response: Response;
  try {
    response = await fetch(`${config.aiService.url}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': config.aiService.token,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    const reason = (err as Error).name === 'TimeoutError' ? 'timed out' : 'is unreachable';
    throw new AiServiceError(`AI service ${reason}.`, 503);
  }

  if (!response.ok) {
    // Log the upstream detail, but never forward it to the client — it can
    // contain SQL fragments, file paths and other internals.
    const detail = await response.text().catch(() => '');
    console.error(`[AI] ${path} failed (${response.status}):`, detail.slice(0, 500));
    throw new AiServiceError('AI service request failed.', 502);
  }

  return (await response.json()) as T;
}

export interface SemanticSearchHit {
  email_id: string;
  chunk_text: string;
  similarity_score: number;
  subject: string | null;
  sender_name: string | null;
  sender_email: string | null;
  received_at: string | null;
  category: string | null;
  sentiment: string | null;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticSearchHit[];
  total_found: number;
}

export function semanticSearch(params: {
  userId: string;
  query: string;
  topK: number;
  category?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}): Promise<SemanticSearchResponse> {
  return callAiService<SemanticSearchResponse>('/ai/search/semantic', {
    query: params.query,
    user_id: params.userId,
    top_k: params.topK,
    category: params.category ?? null,
    date_from: params.dateFrom ?? null,
    date_to: params.dateTo ?? null,
  });
}

export interface RagSource {
  email_id: string;
  chunk_text: string;
  similarity_score: number;
  subject: string | null;
  sender_email: string | null;
  date: string | null;
}

export interface RagResponse {
  answer: string;
  sources: RagSource[];
  query: string;
}

export function ragQuery(params: {
  userId: string;
  query: string;
  topK: number;
}): Promise<RagResponse> {
  return callAiService<RagResponse>('/ai/rag/query', {
    query: params.query,
    user_id: params.userId,
    top_k: params.topK,
  });
}

export interface ProcessBatchResponse {
  processed: number;
  failed: number;
  results: Array<{ email_id: string; status: string; error?: string }>;
}

export function processBatch(params: {
  userId: string;
  emails: Array<{
    email_id: string;
    subject: string;
    snippet: string;
    sender_email: string;
    body_text: string;
  }>;
}): Promise<ProcessBatchResponse> {
  return callAiService<ProcessBatchResponse>('/ai/process/batch', {
    user_id: params.userId,
    emails: params.emails,
  });
}
