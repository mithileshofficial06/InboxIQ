# 🎯 Phase 1: Core Foundation - Implementation Complete

## Overview

Phase 1 of InboxIQ is fully implemented with all required components for:
1. **Gmail Sync Engine** - Fetch entire inbox with pagination
2. **Email Storage Pipeline** - Chunk, embed, store in pgvector
3. **AI Classification** - 9 categories + sentiment analysis
4. **Real-time Progress Tracking** - Frontend sync indicator

All services are integrated and ready for testing.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Dashboard with Sync Button                               │   │
│  │ SyncIndicator: Shows real-time progress (bottom right)   │   │
│  │ Polls GET /emails/sync/status every 2 seconds            │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬──────────────────────────────────────────┘
                         │ HTTP API
┌────────────────────────▼──────────────────────────────────────────┐
│                   Backend (Express.js)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ POST /emails/sync (triggers BullMQ job)                  │   │
│  │ GET /emails/sync/status (returns progress data)          │   │
│  │ Email Sync Worker: Batches Gmail fetches                 │   │
│  │ Calls AI Service /ai/process/batch                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬─────────────────────────────────┬────────────────────┘
             │ Gmail API                       │ AI API
             ▼                                 ▼
        ┌─────────────┐                ┌──────────────────┐
        │  Gmail API  │                │ AI Service       │
        │  (OAuth)    │                │ (FastAPI/Python) │
        └─────────────┘                │ ┌──────────────┐ │
                                       │ │ Classifier   │ │
                                       │ │ (9 cats)     │ │
                                       │ │ Sentiment    │ │
                                       │ ├──────────────┤ │
                                       │ │ Chunker      │ │
                                       │ │ Splitter     │ │
                                       │ ├──────────────┤ │
                                       │ │ Embedder     │ │
                                       │ │ (Gemini 768) │ │
                                       │ └──────────────┘ │
                                       └────────┬─────────┘
                                                │
                         ┌──────────────────────▼─────────────────┐
                         │   PostgreSQL + pgvector                │
                         │ ┌────────────────────────────────────┐ │
                         │ │ emails         (metadata)          │ │
                         │ │ email_chunks   (segmented content) │ │
                         │ │ embeddings     (768-dim vectors)   │ │
                         │ │ HNSW index     (fast similarity)   │ │
                         │ └────────────────────────────────────┘ │
                         └────────────────────────────────────────┘
```

---

## Components Implemented

### 1. Backend Sync Endpoints ✅

**File:** `backend/src/routes/email.routes.ts`

```typescript
// Trigger sync
POST /emails/sync
{
  "type": "full" | "incremental"
}
→ Returns: { message, jobId }

// Get progress
GET /emails/sync/status
→ Returns: {
  status: "syncing|completed|failed",
  stats: {
    totalEmails: 250,
    processedEmails: 120,
    unprocessedEmails: 130,
    processingPercentage: 48
  },
  categories: {
    "Bills & Invoices": 45,
    "Real People": 32,
    ...
  }
}
```

### 2. Email Sync Worker ✅

**File:** `backend/src/queues/emailSync.worker.ts`

- Fetches emails from Gmail in 100-email batches
- Checks for duplicates before storing
- Handles pagination with nextPageToken
- Rate limiting (500ms delay between pages)
- Calls AI service for classification + embeddings
- Updates `is_processed` flag after completion
- Error handling with exponential backoff

**Key Flow:**
```
1. Get message IDs from Gmail API
2. Check existing in DB (avoid duplicates)
3. Fetch full email details
4. Store to emails table
5. Call /ai/process/batch
6. Update user sync_status
```

### 3. AI Service Batch Processing ✅

**File:** `ai-service/app/routes/process.py`

```typescript
POST /ai/process/batch
{
  "user_id": "uuid",
  "emails": [
    {
      "email_id": "uuid",
      "subject": "...",
      "snippet": "...",
      "sender_email": "...",
      "body_text": "..."
    }
  ]
}
→ Returns: {
  processed: 10,
  failed: 0,
  results: [...]
}
```

**Pipeline:**
1. Classify email (category + sentiment)
2. Update email with classification
3. Chunk email body
4. Generate embedding for each chunk
5. Store chunk + embedding in DB
6. Mark as `is_processed = true`

### 4. AI Services ✅

**Classifier** (`app/services/classifier.py`)
- **Method:** Gemini LLM with fallback to keyword heuristics
- **Categories:** 9 default categories (Bills, Jobs, Orders, OTPs, Newsletters, Real People, Academic, Promotions, Travel)
- **Sentiment:** Positive/Neutral/Negative with scores (-1.0 to 1.0)
- **Fallback:** Keyword-based rules if LLM fails

**Chunker** (`app/services/chunker.py`)
- **Algorithm:** Semantic splitting with reply boundary detection
- **Features:** 
  - Respects email reply chains (strips quoted text)
  - Paragraph-aware splitting
  - Configurable chunk size (512 chars, max 10 chunks)
  - Token counting per chunk

**Embeddings** (`app/services/embeddings.py`)
- **Model:** Gemini models/text-embedding-004
- **Dimensions:** 768-dimensional vectors
- **Types:** 
  - `task_type="retrieval_document"` for email chunks
  - `task_type="retrieval_query"` for search queries
- **Batch Processing:** Sequential with rate limit respect

### 5. Frontend Sync Indicator ✅

**File:** `frontend/src/components/SyncIndicator.tsx`

**Features:**
- Real-time progress bar with percentage
- "Syncing X of Y emails" message
- Status icons (spinning loader, check, error)
- Category breakdown on completion
- Auto-poll every 2 seconds
- Auto-hide after 3 seconds on completion
- Mobile-responsive design

**Display:**
```
┌─────────────────────────────────────┐
│ ⟳ Syncing Emails                    │
│ ━━━━━━━━ 48%                        │
│ Processing 130 remaining emails...  │
└─────────────────────────────────────┘
```

### 6. Database Schema ✅

**File:** `database/schema.sql`

**Tables:**
- `emails` - Base metadata (sender, subject, date, category, sentiment, is_processed)
- `email_chunks` - Text chunks with indices and token counts
- `embeddings` - 768-dim pgvector with HNSW index for similarity search

**Key Fields:**
```sql
emails:
  - id, user_id, gmail_id, thread_id
  - sender_email, sender_name, subject, body_text
  - category (9 types)
  - sentiment (positive/negative/neutral)
  - sentiment_score (0.0 to 1.0)
  - is_processed (false until AI pipeline runs)

email_chunks:
  - email_id, user_id
  - chunk_text, chunk_index, token_count

embeddings:
  - chunk_id, user_id
  - embedding (768-dim pgvector)
  - HNSW index for fast similarity search
```

---

## Data Flow

### First Sync (Full Inbox)
```
User clicks "Sync"
    ↓
POST /emails/sync?type=full
    ↓
Backend creates BullMQ job
    ↓
Worker: Fetch Gmail message IDs (paginated, 100/page)
    ↓
Worker: Check DB for existing IDs
    ↓
Worker: Batch fetch full email details
    ↓
Worker: Insert into emails table (is_processed=false)
    ↓
Worker: Extract unprocessed emails
    ↓
Worker: Call AI /process/batch
    ↓
AI: Classify → Generate embeddings → Store vectors
    ↓
AI: Mark is_processed=true
    ↓
Worker: Update user sync_status to "completed"
    ↓
Frontend polls GET /sync/status
    ↓
SyncIndicator shows progress (updated every 2 seconds)
```

### Incremental Sync (New Emails Only)
```
Same as full, but:
- Gmail API query: "after:TIMESTAMP" (from last_sync_at)
- Only fetches emails since last sync
- Much faster (typically seconds)
```

---

## API Integration

### Frontend Calling Backend

**api.ts:**
```typescript
// Get current sync status
analytics.syncStatus() 
→ GET /emails/sync/status
→ Returns: { status, stats, categories }

// Trigger new sync
emails.triggerSync('full' | 'incremental')
→ POST /emails/sync
→ Returns: { message, jobId }
```

### Backend Calling AI Service

**emailSync.worker.ts:**
```typescript
// Send unprocessed emails for classification + embeddings
fetch(`${config.aiServiceUrl}/ai/process/batch`, {
  method: 'POST',
  body: {
    user_id: userId,
    emails: unprocessedEmails
  }
})
```

---

## Configuration Required

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
REDIS_URL=redis://:password@host:port
JWT_SECRET=...
GEMINI_API_KEY=...
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### AI Service (.env)
```
DATABASE_URL=postgresql://user:pass@...
GEMINI_API_KEY=...
```

---

## Testing

See **PHASE1-TEST.md** for complete testing guide including:
- Service health checks
- OAuth login verification
- Sync trigger and monitoring
- Database verification
- Sentiment analysis validation
- Embedding storage confirmation
- Troubleshooting guide

---

## Performance Characteristics

| Item | Value |
|------|-------|
| Emails per page | 100 |
| Rate limit delay | 500ms between pages |
| Chunk size | 512 characters |
| Max chunks per email | 10 |
| Vector dimension | 768 |
| HNSW index | For similarity search |
| Concurrent syncs | 2 |
| Jobs per minute | 5 max |
| Est. time per 100 emails | 2-5 minutes |
| Est. time per 1000 emails | 30+ minutes |

---

## Error Handling

**Backend:**
- Database connection retries
- Gmail API rate limit backoff
- AI service fallback (fails gracefully)
- BullMQ exponential backoff (3 attempts)

**AI Service:**
- Gemini API failures → keyword fallback
- Connection errors → logged, don't fail sync
- Invalid classifications → default to "Real People"

**Frontend:**
- API call failures → logged, retry on next poll
- Stale data → refreshes every 2 seconds
- Network issues → graceful degradation

---

## Security & Privacy

✅ **OAuth 2.0** - Read-only Gmail API scope  
✅ **JWT Tokens** - Secure auth in backend  
✅ **DB Isolation** - All queries filtered by `user_id`  
✅ **Encrypted Secrets** - Stored in environment variables  
✅ **No PII Storage** - Only email metadata + text  
✅ **Supabase RLS** - Prepared for row-level security  

---

## What's Next

After Phase 1 testing passes:

1. **Incremental Sync Scheduler** - Auto-sync every 30 minutes
2. **Analytics Dashboard** - Category charts, sentiment trends
3. **People Intelligence** - Track frequent senders, interaction patterns
4. **RAG Search** - Natural language semantic search
5. **Job Application Tracker** - Track pipeline status
6. **Subscription Manager** - Identify newsletters
7. **Production Deployment** - Docker, scaling, monitoring

---

## Quick Reference

**Start Commands:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd ai-service && python -m uvicorn app.main:app --reload

# Terminal 3
cd frontend && npm run dev
```

**Test URLs:**
```
Frontend:     http://localhost:3000
Backend API:  http://localhost:3001
AI Service:   http://localhost:8000/docs
```

**Key Endpoints:**
```
POST   /emails/sync              - Start sync
GET    /emails/sync/status       - Get progress
POST   /ai/process/batch         - Process emails
GET    /ai/health                - Service health
```

---

**Status:** ✅ Phase 1 READY FOR TESTING

All components implemented and integrated. Follow PHASE1-TEST.md for verification.
