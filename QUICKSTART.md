# 🚀 InboxIQ Quick Start Guide

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** with pgvector (via Supabase)
- **Redis** (via Upstash or local)
- **Google Cloud Console** account
- **Gemini API** key

---

## 📦 Installation Steps

### 1. Clone and Setup Environment

```bash
# Navigate to project
cd InboxIQ

# Copy environment template
copy .env.example .env

# Edit .env with your credentials
# (See .env.example for detailed instructions)
```

### 2. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → Enable Gmail API
3. Create OAuth 2.0 credentials (Web Application)
4. Add redirect URI: `http://localhost:3001/auth/google/callback`
5. Copy Client ID and Secret to `.env`

### 3. Setup Supabase (PostgreSQL + pgvector)

1. Sign up at [Supabase](https://supabase.com/)
2. Create new project
3. Go to SQL Editor → Run `database/schema.sql`
4. Get connection details from Project Settings > API
5. Copy URL, keys, and DATABASE_URL to `.env`

### 4. Setup Redis (Upstash)

1. Sign up at [Upstash](https://upstash.com/)
2. Create Redis database
3. Copy host, port, password to `.env`

### 5. Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create API key
3. Copy to `.env` (both backend and ai-service)

---

## 🏃 Running the Application

### Terminal 1: Backend (Node.js)

```bash
cd backend
npm install
npm run dev

# Should see:
# ╔══════════════════════════════════════════╗
# ║        InboxIQ Backend API               ║
# ║        Port: 3001                        ║
# ╚══════════════════════════════════════════╝
```

### Terminal 2: AI Service (Python)

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env in ai-service folder
copy ..\\.env .env

# Run service
uvicorn app.main:app --reload --port 8000

# Should see:
# 🚀 InboxIQ AI Service starting...
```

### Terminal 3: Frontend (Next.js)

```bash
cd frontend
npm install

# Create .env.local
echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
echo NEXT_PUBLIC_AI_URL=http://localhost:8000 >> .env.local

npm run dev

# Should see:
# ▲ Next.js 15.x.x
# - Local:   http://localhost:3000
```

---

## ✅ Verify Installation

### Run Test Suite (Windows)

```cmd
test-phase1.bat
```

### Run Test Suite (Mac/Linux)

```bash
chmod +x test-phase1.sh
./test-phase1.sh
```

### Manual Health Checks

```bash
# Backend
curl http://localhost:3001/health

# AI Service
curl http://localhost:8000/health

# Frontend
open http://localhost:3000
```

---

## 🎯 Testing Phase 1 Features

### 1. Gmail Sync

1. Open http://localhost:3000
2. Click "Get Started" → Sign in with Google
3. Grant Gmail permissions
4. System will start syncing emails
5. Monitor progress in UI: "Syncing 150 of 5,000 emails..."

### 2. View Classified Emails

```bash
# After sync completes, query database
psql $DATABASE_URL -c "
  SELECT category, COUNT(*) as count
  FROM emails
  WHERE user_id = 'YOUR_USER_ID'
  GROUP BY category;
"
```

### 3. Test AI Classification

```bash
curl -X POST http://localhost:8000/ai/classify \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Your package is on the way!",
    "snippet": "Track your order...",
    "sender_email": "shipping@amazon.com"
  }'

# Response:
{
  "category": "Orders & Deliveries",
  "sentiment": "positive",
  "sentiment_score": 0.8
}
```

### 4. Test Embeddings & Search

```bash
# Process an email
curl -X POST http://localhost:8000/ai/process/batch \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "your-user-id",
    "emails": [{
      "email_id": "test-123",
      "subject": "Meeting Notes",
      "snippet": "Discussion about Q1 goals",
      "sender_email": "team@company.com",
      "body_text": "Full meeting notes here..."
    }]
  }'

# Search similar emails
curl -X POST http://localhost:8000/ai/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What were the Q1 goals discussed?",
    "user_id": "your-user-id",
    "top_k": 5
  }'
```

---

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check environment variables
node -e "require('dotenv').config(); console.log(process.env.GOOGLE_CLIENT_ID)"

# Check Redis connection
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

### AI Service errors

```bash
# Check Python version
python --version  # Should be 3.10+

# Check Gemini API
python -c "
import google.generativeai as genai
genai.configure(api_key='YOUR_KEY')
print('✅ API key valid')
"

# Check database connection
python -c "
import psycopg
conn = psycopg.connect('YOUR_DATABASE_URL')
print('✅ Database connected')
"
```

### Gmail Sync not working

1. Check OAuth credentials match redirect URI exactly
2. Verify Gmail API is enabled in Google Cloud Console
3. Check user has granted permissions (see Supabase `users` table)
4. Look at BullMQ queue in Redis: `redis-cli LLEN bull:email-sync-queue:wait`

### Database issues

```sql
-- Check if pgvector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if schema.sql ran successfully
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check HNSW index exists
SELECT indexname FROM pg_indexes 
WHERE tablename = 'embeddings';
```

---

## 📊 Monitoring

### View Sync Progress

```sql
-- Check sync status
SELECT email, sync_status, last_sync_at, total_emails_synced
FROM users
ORDER BY last_sync_at DESC;

-- Check email counts by category
SELECT category, COUNT(*) as count
FROM emails
WHERE user_id = 'YOUR_USER_ID'
GROUP BY category
ORDER BY count DESC;
```

### View AI Processing Status

```sql
-- Check processing status
SELECT 
  COUNT(*) FILTER (WHERE is_processed = true) as processed,
  COUNT(*) FILTER (WHERE is_processed = false) as pending,
  COUNT(*) as total
FROM emails
WHERE user_id = 'YOUR_USER_ID';

-- Check embeddings count
SELECT COUNT(*) as embedding_count
FROM embeddings
WHERE user_id = 'YOUR_USER_ID';
```

### Monitor BullMQ Jobs

```bash
# Check queue status
redis-cli --url redis://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT \
  LLEN bull:email-sync-queue:wait

# Check active jobs
redis-cli --url redis://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT \
  LLEN bull:email-sync-queue:active

# Check failed jobs
redis-cli --url redis://:$REDIS_PASSWORD@$REDIS_HOST:$REDIS_PORT \
  LLEN bull:email-sync-queue:failed
```

---

## 🎓 Learn More

- **[PHASE1_COMPLETION.md](./PHASE1_COMPLETION.md)** - Detailed Phase 1 documentation
- **[Database Schema](./database/schema.sql)** - Full database structure
- **[API Documentation](http://localhost:8000/docs)** - FastAPI interactive docs
- **[Architecture Overview](./ARCHITECTURE.md)** - System design (if exists)

---

## 🆘 Getting Help

1. Check logs in each terminal window
2. Review error messages in browser console
3. Check Supabase logs in dashboard
4. Review test results from `test-phase1.bat/sh`
5. See [GitHub Issues](https://github.com/yourusername/inboxiq/issues)

---

## ✅ Success Checklist

- [ ] All 3 services running (backend, AI, frontend)
- [ ] Health checks passing
- [ ] OAuth login works
- [ ] First Gmail sync completes
- [ ] Emails appear in database
- [ ] Classifications are accurate
- [ ] Embeddings are generated
- [ ] Test suite passes

**If all checked, Phase 1 is complete! 🎉**

---

## 🚀 Next: Phase 2

Once Phase 1 is working:

1. RAG-based email search
2. Subscription tracking
3. Job application tracker
4. Analytics dashboard
5. Smart filters and folders

See Phase 2 planning docs for details.
