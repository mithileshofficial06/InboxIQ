import type {
  AnalyticsOverview,
  CategoriesResponse,
  ChatResponse,
  ContactDetailResponse,
  ContactsResponse,
  DeadSubscriptionsResponse,
  DeleteAccountResponse,
  EmailListParams,
  EmailListResponse,
  EmailResponse,
  HeatmapResponse,
  JobStatsResponse,
  JobUpdateResponse,
  JobsResponse,
  LogoutResponse,
  MeResponse,
  SearchOptions,
  SemanticSearchResponse,
  SentimentResponse,
  SubscriptionsResponse,
  SuggestionsResponse,
  SyncStatusResponse,
  SyncTriggerResponse,
  ThreadResponse,
  TimelineResponse,
  TopSendersResponse,
  VolumeResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// There is deliberately no AI service base URL here.
//
// The AI service trusts the user_id it is given, so calling it from the browser
// let any signed-in user read any other user's inbox by changing one field.
// All AI features now go through the backend, which supplies the user id from
// the verified session.

/**
 * The session is an httpOnly cookie set by the backend — it is intentionally
 * unreadable from JavaScript, so there is no token to attach here. Every request
 * just needs `credentials: 'include'`.
 *
 * The caller names the response type; the shapes live in ./types and mirror what
 * the Express routes return.
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // Session expired or revoked — the cookie is cleared server-side.
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      window.location.href = '/';
    }
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return (await response.json()) as T;
}

// ============ Health Check ============
export const health = {
  checkBackend: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return response.ok;
    } catch {
      return false;
    }
  },
};

// ============ Auth ============
export const auth = {
  getLoginUrl: () => `${API_BASE}/auth/google`,
  getMe: () => fetchAPI<MeResponse>('/auth/me'),
  logout: () => fetchAPI<LogoutResponse>('/auth/logout', { method: 'POST' }),
  deleteAccount: () => fetchAPI<DeleteAccountResponse>('/auth/account', { method: 'DELETE' }),
};

// ============ Emails ============
export const emails = {
  list: (params?: EmailListParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sender) searchParams.set('sender', params.sender);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sentiment) searchParams.set('sentiment', params.sentiment);
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo);
    return fetchAPI<EmailListResponse>(`/emails?${searchParams.toString()}`);
  },
  getById: (id: string) => fetchAPI<EmailResponse>(`/emails/${id}`),
  getThread: (threadId: string) => fetchAPI<ThreadResponse>(`/emails/thread/${threadId}`),
  timeline: () => fetchAPI<TimelineResponse>('/emails/timeline'),
  triggerSync: (type: 'full' | 'incremental' = 'incremental') =>
    fetchAPI<SyncTriggerResponse>('/emails/sync', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
  getSyncStatus: () => fetchAPI<SyncStatusResponse>('/emails/sync/status'),
};

// ============ Analytics ============
export const analytics = {
  overview: () => fetchAPI<AnalyticsOverview>('/analytics/overview'),
  categories: () => fetchAPI<CategoriesResponse>('/analytics/categories'),
  volume: (period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
    fetchAPI<VolumeResponse>(`/analytics/volume?period=${period}`),
  sentiment: () => fetchAPI<SentimentResponse>('/analytics/sentiment'),
  topSenders: (limit: number = 10) =>
    fetchAPI<TopSendersResponse>(`/analytics/top-senders?limit=${limit}`),
  heatmap: () => fetchAPI<HeatmapResponse>('/analytics/heatmap'),
  syncStatus: () => fetchAPI<SyncStatusResponse>('/emails/sync/status'),
};

// ============ People ============
export const people = {
  list: (sort: 'frequency' | 'recency' = 'frequency', limit: number = 20) =>
    fetchAPI<ContactsResponse>(`/people?sort=${sort}&limit=${limit}`),
  getDetail: (email: string) =>
    fetchAPI<ContactDetailResponse>(`/people/${encodeURIComponent(email)}`),
};

// ============ Jobs ============
export const jobs = {
  list: (status?: string) => fetchAPI<JobsResponse>(`/jobs${status ? `?status=${status}` : ''}`),
  getStats: () => fetchAPI<JobStatsResponse>('/jobs/stats'),
  updateStatus: (id: string, status: string, notes?: string) =>
    fetchAPI<JobUpdateResponse>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),
};

// ============ Subscriptions ============
export const subs = {
  list: (category?: string) =>
    fetchAPI<SubscriptionsResponse>(`/subs${category ? `?category=${category}` : ''}`),
  getDead: () => fetchAPI<DeadSubscriptionsResponse>('/subs/dead'),
};

// ============ Search ============
export const search = {
  semantic: (query: string, opts?: SearchOptions) =>
    fetchAPI<SemanticSearchResponse>('/search/semantic', {
      method: 'POST',
      body: JSON.stringify({ query, ...opts }),
    }),
  suggestions: () => fetchAPI<SuggestionsResponse>('/search/suggestions'),
};

// ============ RAG Chat ============
export const chat = {
  // No userId parameter by design — the backend derives it from the session.
  query: (query: string) =>
    fetchAPI<ChatResponse>('/search/chat', {
      method: 'POST',
      body: JSON.stringify({ query, topK: 20 }),
    }),
};
