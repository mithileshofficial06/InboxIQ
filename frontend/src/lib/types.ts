/**
 * Response shapes returned by the backend API.
 *
 * These mirror what the Express routes actually select and return — see
 * backend/src/routes/*.ts. Keeping them here means pages consume typed data
 * instead of `any`, so a field renamed on the server surfaces as a type error
 * rather than `undefined` at runtime.
 */

// ============ Auth ============

export interface User {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  sync_status: string;
  last_sync_at: string | null;
  total_emails_synced: number;
  created_at: string;
}

export interface MeResponse {
  user: User;
}

export interface LogoutResponse {
  message: string;
  serverSideRevocation: boolean;
}

export interface DeleteAccountResponse {
  message: string;
}

// ============ Emails ============

/** The column subset returned by the list endpoint. */
export interface Email {
  id: string;
  gmail_id: string;
  thread_id: string;
  sender_email: string | null;
  sender_name: string | null;
  subject: string | null;
  snippet: string | null;
  date: string;
  category: string | null;
  sentiment: string | null;
  sentiment_score: number | null;
  is_read: boolean;
  has_attachments: boolean;
  label_ids: string[] | null;
}

/**
 * A single email or thread member (`select('*')`). The extra columns are
 * optional so a list result can be handed to anything expecting a detail.
 */
export interface EmailDetail extends Email {
  user_id?: string;
  recipient_emails?: string[] | null;
  body_text?: string | null;
  raw_size_bytes?: number | null;
  is_processed?: boolean;
  created_at?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EmailListResponse {
  emails: Email[];
  pagination: Pagination;
}

export interface EmailResponse {
  email: EmailDetail;
}

export interface ThreadResponse {
  thread: EmailDetail[];
}

export interface TimelineMonth {
  month: string;
  count: number;
  categories: Record<string, number>;
  sentiments: Record<string, number>;
}

export interface TimelineResponse {
  timeline: TimelineMonth[];
}

export interface SyncTriggerResponse {
  message: string;
  jobId: string;
}

export interface SyncStats {
  totalEmails: number;
  processedEmails: number;
  unprocessedEmails: number;
  processingPercentage: number;
}

export interface SyncStatusResponse {
  status: string;
  lastSyncAt: string | null;
  totalEmailsSynced: number;
  stats: SyncStats;
  categories: Record<string, number>;
}

export interface EmailListParams {
  page?: number;
  limit?: number;
  category?: string;
  sender?: string;
  search?: string;
  sentiment?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============ Analytics ============

export interface AnalyticsOverview {
  totalEmails: number;
  thisWeekEmails: number;
  lastWeekEmails: number;
  weekOverWeekChange: number;
  unreadCount: number;
  lastSyncedAt: string | null;
  syncStatus: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface CategoriesResponse {
  categories: CategoryCount[];
}

export interface VolumePoint {
  date: string;
  count: number;
}

export interface VolumeResponse {
  volume: VolumePoint[];
  period: string;
}

/** Only these three keys are ever populated by the backend. */
export interface SentimentDistribution {
  positive: number;
  neutral: number;
  negative: number;
}

export interface SentimentResponse {
  distribution: SentimentDistribution;
}

export interface TopSender {
  email: string;
  name: string;
  count: number;
}

export interface TopSendersResponse {
  topSenders: TopSender[];
}

export interface HeatmapResponse {
  heatmap: number[][];
  days: string[];
  hours: number[];
}

// ============ People ============

export interface Contact {
  email: string;
  name: string;
  emailCount: number;
  lastEmailDate: string;
  firstEmailDate: string;
}

export interface ContactsResponse {
  contacts: Contact[];
}

export interface ContactDetailResponse {
  email: string;
  totalEmails: number;
  categories: Record<string, number>;
  recentEmails: Email[];
}

// ============ Jobs ============

export interface JobApplication {
  id: string;
  user_id: string;
  company_name: string;
  role: string | null;
  status: string;
  applied_date: string | null;
  last_update_date: string | null;
  email_ids: string[] | null;
  notes: string | null;
}

export interface JobsResponse {
  jobs: JobApplication[];
}

export interface JobStatsResponse {
  total: number;
  statusCounts: Record<string, number>;
  responseRate: number;
}

export interface JobUpdateResponse {
  job: JobApplication;
}

// ============ Subscriptions ============

export interface Subscription {
  id: string;
  user_id: string;
  sender_domain: string;
  sender_email: string | null;
  service_name: string | null;
  category: string | null;
  last_email_date: string | null;
  first_email_date: string | null;
  email_count: number;
  frequency: string | null;
  is_dead: boolean;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
}

export interface DeadSubscriptionsResponse {
  deadSubscriptions: Subscription[];
}

// ============ Search ============

export interface SemanticSearchResult {
  emailId: string;
  chunkText: string;
  similarity: number;
  subject: string | null;
  senderName: string | null;
  senderEmail: string | null;
  receivedAt: string | null;
  category: string | null;
  sentiment: string | null;
}

export interface SemanticSearchResponse {
  query: string;
  results: SemanticSearchResult[];
  totalFound: number;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

export interface SearchOptions {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

// ============ RAG Chat ============

export interface ChatSource {
  emailId: string;
  chunkText: string;
  similarity: number;
  subject: string | null;
  senderEmail: string | null;
  date: string | null;
}

export interface ChatResponse {
  answer: string;
  query: string;
  sources: ChatSource[];
}
