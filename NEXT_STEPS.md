# 🎯 What to Do Next - Quick Guide

## ✅ Current Status

- ✅ Backend: Running on port 3001
- ✅ Frontend: Running on port 3000  
- ✅ Redis: Connected
- ✅ Code: Refactored for NVIDIA NIM (Llama 3.3 70B)
- ⏳ AI Service: Need to start
- ⏳ Database: Need to run migration

---

## 🚀 3 Steps to Start Syncing

### Step 1: Run Database Migration (5 minutes)

**Why**: Change embedding dimension from 768 (Gemini) to 1024 (NVIDIA)

1. Go to Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/wyrcmlwodfnaffjzdgem/sql
   ```

2. Copy and paste this SQL:
   ```sql
   -- Change embedding dimension for NVIDIA NV-Embed-v5
   TRUNCATE TABLE embeddings CASCADE;
   ALTER TABLE embeddings DROP COLUMN IF EXISTS embedding;
   ALTER TABLE embeddings ADD COLUMN embedding vector(1024);
   
   -- Recreate HNSW index
   DROP INDEX IF EXISTS idx_embeddings_hnsw;
   CREATE INDEX idx_embeddings_hnsw ON embeddings 
   USING hnsw (embedding vector_cosine_ops)
   WITH (m = 16, ef_construction = 64);
   ```

3. Click "Run" → Should see "Success"

---

### Step 2: Start AI Service (2 minutes)

Open a **NEW terminal** (3rd terminal):

```bash
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\ai-service

# Start AI service
uvicorn app.main:app --reload
```

**Wait for**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Test it**:
```bash
# Open in browser:
http://localhost:8000/health

# Should see:
{"status":"ok","service":"InboxIQ AI Service"}
```

---

### Step 3: Trigger Email Sync (30 seconds)

1. Open dashboard: http://localhost:3000/dashboard
2. Click the **"Sync"** button (top-right corner)
3. Watch the progress: "Syncing X of Y emails..."
4. Wait for completion!

**First sync time**:
- 100 emails: ~2-3 minutes
- 500 emails: ~10 minutes
- 1,000 emails: ~20 minutes

---

## 📊 What's Running

| Terminal | Service | Status | Port |
|----------|---------|--------|------|
| Terminal 1 | Backend | ✅ Running | 3001 |
| Terminal 2 | Frontend | ✅ Running | 3000 |
| Terminal 3 | AI Service | ⏳ Start it | 8000 |

---

## 🐛 If AI Service Won't Start

**Error: "Module not found"**
```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Error: "Invalid API key"**
Check `ai-service/.env` has:
```
NVIDIA_API_KEY=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
```

**Error: "Port 8000 already in use"**
```bash
# Find process
netstat -ano | findstr :8000

# Kill it
taskkill /F /PID <PID_NUMBER>

# Try again
uvicorn app.main:app --reload
```

---

## 🎉 After Sync Completes

You'll be able to:

1. **View Emails**: Go to "Inbox" → See all your emails with categories
2. **Search Semantically**: Go to "Search" → Try "Show me job applications"
3. **View Analytics**: Dashboard shows category breakdown, sentiment, etc.
4. **Ask Questions**: Go to "Assistant" → Ask about your emails

---

## 📚 Documentation

- **NVIDIA Setup**: `NVIDIA_NIM_SETUP.md` - Detailed integration guide
- **Auth Fixes**: `AUTH_FIXES.md` - Login and session fixes
- **Phase 3**: `PHASE3_PROGRESS.md` - Semantic search feature
- **Startup Guide**: `STARTUP_GUIDE.md` - Troubleshooting

---

## ⚡ Quick Commands

```bash
# Start Backend
cd backend && npm run dev

# Start Frontend
cd frontend && npm run dev

# Start AI Service
cd ai-service && uvicorn app.main:app --reload

# Check Backend Health
curl http://localhost:3001/health

# Check AI Service Health
curl http://localhost:8000/health

# Check Frontend
# Open: http://localhost:3000
```

---

## ✅ Success Indicators

You'll know everything works when:

1. **AI Service**: Shows "Application startup complete"
2. **Dashboard**: Shows "X indexed records" (not 0)
3. **Inbox**: Shows actual email cards
4. **Search**: Returns relevant results
5. **Categories**: Charts populate with data

---

## 🚀 CURRENT NEXT STEP

**→ Run the database migration in Supabase SQL Editor!**

Then start the AI service and trigger sync. You're almost there! 🎉
