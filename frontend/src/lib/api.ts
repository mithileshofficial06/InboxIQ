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
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
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

  return response.json();
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
  getMe: () => fetchAPI('/auth/me'),
  logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
  deleteAccount: () => fetchAPI('/auth/account', { method: 'DELETE' }),
};

// ============ Emails ============
export const emails = {
  list: (params?: { page?: number; limit?: number; category?: string; sender?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sender) searchParams.set('sender', params.sender);
    if (params?.search) searchParams.set('search', params.search);
    return fetchAPI(`/emails?${searchParams.toString()}`);
  },
  getById: (id: string) => fetchAPI(`/emails/${id}`),
  getThread: (threadId: string) => fetchAPI(`/emails/thread/${threadId}`),
  timeline: () => fetchAPI('/emails/timeline'),
  triggerSync: (type: 'full' | 'incremental' = 'incremental') =>
    fetchAPI('/emails/sync', { method: 'POST', body: JSON.stringify({ type }) }),
  getSyncStatus: () => fetchAPI('/emails/sync/status'),
};

// ============ Analytics ============
export const analytics = {
  overview: () => fetchAPI('/analytics/overview'),
  categories: () => fetchAPI('/analytics/categories'),
  volume: (period: 'daily' | 'weekly' | 'monthly' = 'daily') =>
    fetchAPI(`/analytics/volume?period=${period}`),
  sentiment: () => fetchAPI('/analytics/sentiment'),
  topSenders: (limit: number = 10) => fetchAPI(`/analytics/top-senders?limit=${limit}`),
  heatmap: () => fetchAPI('/analytics/heatmap'),
  syncStatus: () => fetchAPI('/emails/sync/status'),
};

// ============ People ============
export const people = {
  list: (sort: 'frequency' | 'recency' = 'frequency', limit: number = 20) =>
    fetchAPI(`/people?sort=${sort}&limit=${limit}`),
  getDetail: (email: string) => fetchAPI(`/people/${encodeURIComponent(email)}`),
};

// ============ Jobs ============
export const jobs = {
  list: (status?: string) => fetchAPI(`/jobs${status ? `?status=${status}` : ''}`),
  getStats: () => fetchAPI('/jobs/stats'),
  updateStatus: (id: string, status: string, notes?: string) =>
    fetchAPI(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
};

// ============ Subscriptions ============
export const subs = {
  list: (category?: string) => fetchAPI(`/subs${category ? `?category=${category}` : ''}`),
  getDead: () => fetchAPI('/subs/dead'),
};

// ============ Search ============
export const search = {
  semantic: (query: string, opts?: { category?: string; dateFrom?: string; dateTo?: string; limit?: number }) =>
    fetchAPI('/search/semantic', {
      method: 'POST',
      body: JSON.stringify({ query, ...opts }),
    }),
  suggestions: () => fetchAPI('/search/suggestions'),
};

// ============ RAG Chat ============
export const chat = {
  // No userId parameter by design — the backend derives it from the session.
  query: (query: string) =>
    fetchAPI('/search/chat', {
      method: 'POST',
      body: JSON.stringify({ query, topK: 20 }),
    }),
};
