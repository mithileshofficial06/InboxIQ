# Phase 1 Testing Guide

## Infrastructure Overview

**Phase 1: Core Foundation** includes:
1. ✅ **Gmail Sync Engine** - Fetch inbox in batches, pagination, incremental sync
2. ✅ **Email Storage Pipeline** - Strip HTML, chunk, generate embeddings, store in pgvector
3. ✅ **AI Classification** - Classify into 9 categories
4. ✅ **Sentiment Analysis** - Positive/Neutral/Negative scores

All components are implemented and integrated.

---

## Prerequisites

Before testing, ensure all credentials are properly configured:

```
✅ Backend (.env in root directory):
- DATABASE_URL=postgresql://user:pass@...
- SUPABASE_URL=https://...supabase.co
- SUPABASE_ANON_KEY=...
- SUPABASE_SERVICE_ROLE_KEY=...
- GOOGLE_CLIENT_ID=...
- GOOGLE_CLIENT_SECRET=...
- REDIS_URL=redis://:password@host:port
- JWT_SECRET=any-secret-key
- GEMINI_API_KEY=...

✅ Frontend (.env.local):
- NEXT_PUBLIC_API_URL=http://localhost:3001
- NEXT_PUBLIC_AI_URL=http://localhost:8000

✅ AI Service (ai-service/.env):
- DATABASE_URL=postgresql://user:pass@...
- GEMINI_API_KEY=...
```

---

## Quick Start (3 Terminals)

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Should show: "Server running on port 3001"
```

### Terminal 2: AI Service
```bash
cd ai-service
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
# Should show: "Uvicorn running on http://127.0.0.1:8000"
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev
# Should show: "started server on 0.0.0.0:3000"
```

---

## Test Sequence

### 1. Verify Service Health (Pre-Login)

**Backend Health:**
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","service":"inboxiq-backend","timestamp":"..."}
```

**AI Service Health:**
```bash
curl http://localhost:8000/ai/health
# Expected: {"status":"ok","service":"inboxiq-ai-service"}
```

**Frontend:**
```
Open http://localhost:3000
# Should see login screen with Google button
```

---

### 2. Google OAuth Login

1. Click **"Sign in with Google"** on login page
2. Use test account: `m40245638@gmail.com` (or your configured OAuth test user)
3. Authorize InboxIQ app to access Gmail
4. Should redirect to `/dashboard/inbox`

**Expected Result:**
- User authenticated (JWT token in localStorage)
- Dashboard loads with sidebar
- Top bar shows: "Syncing in progress..." or "0 indexed records"

---

### 3. Trigger Full Sync

**Option A: Via UI**
1. In dashboard, click **"Sync"** button (top right)
2. Should show: `"Sync Started"` toast notification
3. Look for SyncIndicator in bottom right corner

**Option B: Via API**
```bash
curl -X POST http://localhost:3001/emails/sync \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"type":"full"}'
# Expected: {"message":"full sync started","jobId":"..."}
```

---

### 4. Monitor Sync Progress

**Via UI:**
- SyncIndicator should appear in bottom right
- Shows: "0% → 10% → 25% → ..." as emails process
- Displays: "Syncing 25 of 100 emails..."

**Via API (poll every 2 seconds):**
```bash
curl http://localhost:3001/emails/sync/status \
  -H "Authorization: Bearer {JWT_TOKEN}"

# Expected response:
{
  "status": "syncing",
  "lastSyncAt": "2024-...",
  "totalEmailsSynced": 245,
  "stats": {
    "totalEmails": 250,
    "processedEmails": 120,
    "unprocessedEmails": 130,
    "processingPercentage": 48
  },
  "categories": {
    "Bills & Invoices": 45,
    "Real People": 32,
    "Newsletters": 28,
    "Promotions": 15
  }
}
```

---

### 5. Verify Data Storage

**Check emails stored:**
```bash
# Via Supabase SQL Editor
SELECT COUNT(*), 
       COUNT(CASE WHEN is_processed=true THEN 1 END) as processed,
       COUNT(CASE WHEN is_processed=false THEN 1 END) as unprocessed
FROM emails 
WHERE user_id = 'YOUR_USER_ID';

# Expected: Some rows with processed + unprocessed split
```

**Check classifications:**
```bash
SELECT category, sentiment, COUNT(*) 
FROM emails 
WHERE is_processed=true 
GROUP BY category, sentiment;

# Expected output:
# Bills & Invoices | positive | 12
# Bills & Invoices | neutral  | 33
# Real People      | positive | 28
# ...
```

**Check embeddings:**
```bash
SELECT COUNT(*) FROM email_chunks WHERE user_id = 'YOUR_USER_ID';
SELECT COUNT(*) FROM embeddings WHERE user_id = 'YOUR_USER_ID';

# Both should have data
# embeddings count = email_chunks count (1:1 relationship)
```

---

### 6. Check Backend Logs

**Look for patterns:**
```
[Sync Worker] Processed X emails so far...
[Process] Processing email batch of Y emails
[Sync Worker] Completed full sync for user ...: Z emails
```

**Look for errors:**
- Database connection issues
- Rate limit errors (429)
- Invalid embeddings
- Missing classifications

---

### 7. Verify Sentiment Scores

```bash
# Via Supabase SQL Editor
SELECT 
  subject,
  category,
  sentiment,
  sentiment_score
FROM emails 
WHERE is_processed=true
LIMIT 10;

# Expected: sentiment_score between 0.0 and 1.0
# 0.0 = negative, 0.5 = neutral, 1.0 = positive
```

---

### 8. Check pgvector Embeddings

```bash
# Via Supabase SQL Editor
SELECT 
  ec.chunk_text,
  e.embedding <-> '[0, 0, ..., 0]'::vector as dummy_distance
FROM embeddings e
JOIN email_chunks ec ON e.chunk_id = ec.id
LIMIT 5;

# Expected: 768-dimensional vectors in pgvector
# Should not error (pgvector extension working)
```

---

## Success Criteria

All items must be ✅ for Phase 1 completion:

- [ ] Backend runs on port 3001 without errors
- [ ] AI service runs on port 8000 without errors
- [ ] Frontend loads on port 3000
- [ ] Google OAuth login works
- [ ] Sync button triggers job without errors
- [ ] SyncIndicator appears and shows progress
- [ ] Progress percentage increases from 0% → 100%
- [ ] Emails table populates with records
- [ ] Classifications (categories) populate correctly
- [ ] Sentiment scores populate (0.0 to 1.0 range)
- [ ] Email chunks created for each email
- [ ] Embeddings vectors stored (768-dim)
- [ ] Sync completes without hanging
- [ ] SyncIndicator hides after 3 seconds on completion

---

## Troubleshooting

### Backend won't connect to database
```
✗ Error: "connect ECONNREFUSED 127.0.0.1:5432"
✓ Fix: Ensure DATABASE_URL points to correct Supabase instance
✓ Check: Run `echo $DATABASE_URL` to verify
```

### AI service returns 500 on /ai/process/batch
```
✗ Error: "Internal server error" or "connect ECONNREFUSED"
✓ Fix: Ensure DATABASE_URL in ai-service/.env is set
✓ Check: Verify GEMINI_API_KEY is valid
✓ Test: curl http://localhost:8000/ai/health
```

### SyncIndicator doesn't appear
```
✗ Issue: Component mounts but not visible
✓ Fix: Check browser console for errors
✓ Verify: status !== "syncing" or other state conditions
✓ Check: Frontend .env.local has correct API_URL
```

### Sync hangs at 50%
```
✗ Issue: Progress stops increasing
✓ Check: Backend logs for "AI service call failed"
✓ Fix: Restart AI service if crashed
✓ Check: Gemini API rate limits (429 errors)
```

### Categories not populating
```
✗ Issue: categories object empty in sync/status
✓ Check: SELECT * FROM emails WHERE category IS NOT NULL;
✓ Fix: Classifier may be failing - check AI service logs
✓ Test: curl -X POST http://localhost:8000/ai/classify ...
```

---

## Performance Notes

**Expected Timeline for First Sync:**
- 100 emails: ~2-5 minutes
- 250 emails: ~5-15 minutes
- 1000+ emails: 30+ minutes (depends on email sizes)

**Rate Limits:**
- Gmail API: 15M queries/day per user
- Gemini API: Embeddings ~1000/min, 100 requests/min for LLM calls
- Backend: Max 2 concurrent sync jobs, 5 jobs/minute

**Memory:**
- Keep max 100 unprocessed emails in single batch to prevent OOM
- Email chunks limited to 10 per email
- Vector dimension: 768 (optimized for Gemini)

---

## Next Phase After Testing

Once Phase 1 is verified:

1. **Incremental Sync Scheduler** - Every 30 minutes auto-sync new emails
2. **First Login Optimization** - Prompt user to sync, show progress
3. **Analytics Dashboard** - Category pie charts, sentiment trends
4. **People Intelligence** - Track senders, frequency analysis
5. **RAG Search** - Natural language search over emails via semantic search

