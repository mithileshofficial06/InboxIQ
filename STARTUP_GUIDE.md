# 🚀 InboxIQ - Startup Guide

## Quick Start (3 Terminals)

### ⚠️ IMPORTANT: Start services in this order!

```bash
# Terminal 1: Backend (MUST START FIRST)
cd backend
npm run dev
# Wait for: "InboxIQ Backend API - Port: 3001"

# Terminal 2: AI Service
cd ai-service
uvicorn app.main:app --reload
# Wait for: "Application startup complete"

# Terminal 3: Frontend (START LAST)
cd frontend
npm run dev
# Open: http://localhost:3000
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Can't login - localhost refused to connect"

**Cause**: Backend server not running when you click "Get Started"

**Fix**:
1. Make sure Terminal 1 (backend) shows: `InboxIQ Backend API`
2. Test backend health: Open `http://localhost:3001/health` in browser
3. Should see: `{"status":"ok","service":"inboxiq-backend",...}`
4. Now try logging in again

---

### Issue 2: "Logged out after refresh"

**Cause**: Backend server not responding or authentication API call failing

**Fixes**:

**Option A - Backend Not Running**:
1. Check Terminal 1 - is backend still running?
2. If not, restart: `cd backend && npm run dev`
3. Refresh browser

**Option B - Database Connection Issue**:
1. Check if Supabase is accessible
2. Test: `psql YOUR_DATABASE_URL -c "SELECT 1"`
3. If fails, check your `.env` file's `DATABASE_URL`

**Option C - Token Expired (After 7 Days)**:
1. This is normal - JWT tokens expire after 7 days
2. Just login again with Google OAuth
3. Your data is still safe in the database

---

### Issue 3: "Gmail OAuth Error - Redirect URI Mismatch"

**Cause**: Google Cloud Console redirect URI doesn't match your app's URI

**Fix**:
1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: APIs & Services → Credentials
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", ensure you have:
   ```
   http://localhost:3001/auth/google/callback
   ```
6. Save and try logging in again (may take 5 mins to propagate)

---

### Issue 4: "AI Service Connection Error"

**Cause**: Python AI service not running or wrong port

**Fix**:
1. Check Terminal 2 - should see Uvicorn logs
2. Test AI health: `http://localhost:8000/health`
3. Should see: `{"status":"ok","service":"InboxIQ AI Service"}`
4. If port 8000 busy:
   ```bash
   # Find process using port 8000
   netstat -ano | findstr :8000
   # Kill it or use different port
   uvicorn app.main:app --reload --port 8001
   # Then update BACKEND .env: AI_SERVICE_URL=http://localhost:8001
   ```

---

### Issue 5: "Redis Connection Failed"

**Cause**: Upstash Redis not accessible or wrong credentials

**Fix**:
1. Check `.env` file has correct:
   ```
   REDIS_HOST=https://popular-flea-130495.upstash.io
   REDIS_PASSWORD=your-password
   ```
2. Test Redis (optional):
   ```bash
   redis-cli -u redis://default:PASSWORD@popular-flea-130495.upstash.io:6379
   ```
3. Email sync will fail if Redis is down (BullMQ needs it)

---

## 🔐 First-Time Setup Checklist

### 1. Environment Variables

**Backend** (`backend/.env`):
- ✅ `GOOGLE_CLIENT_ID` - Get from Google Cloud Console
- ✅ `GOOGLE_CLIENT_SECRET` - Get from Google Cloud Console
- ✅ `GOOGLE_REDIRECT_URI` - Must be `http://localhost:3001/auth/google/callback`
- ✅ `SUPABASE_URL` - Get from Supabase project settings
- ✅ `SUPABASE_ANON_KEY` - Get from Supabase project settings
- ✅ `DATABASE_URL` - PostgreSQL connection string from Supabase
- ✅ `REDIS_HOST` - Upstash Redis endpoint
- ✅ `REDIS_PASSWORD` - Upstash Redis password
- ✅ `JWT_SECRET` - Generate with: `openssl rand -hex 32`

**AI Service** (`ai-service/.env`):
- ✅ `GEMINI_API_KEY` - Get from Google AI Studio
- ✅ `DATABASE_URL` - Same as backend's DATABASE_URL

**Frontend** (`frontend/.env.local`):
- ✅ `NEXT_PUBLIC_API_URL=http://localhost:3001`
- ✅ `NEXT_PUBLIC_AI_URL=http://localhost:8000`

---

### 2. Google Cloud Setup

1. **Create Project**: https://console.cloud.google.com/
2. **Enable Gmail API**:
   - Go to: APIs & Services → Library
   - Search "Gmail API" → Enable
3. **Create OAuth Credentials**:
   - Go to: APIs & Services → Credentials
   - Click "Create Credentials" → OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3001/auth/google/callback`
4. **Copy Client ID and Secret** to backend `.env`

---

### 3. Supabase Setup

1. **Create Project**: https://supabase.com/
2. **Get Connection Details**:
   - Project Settings → API
   - Copy: `URL`, `anon key`, `service_role key`
   - Project Settings → Database → Connection String (URI mode)
3. **Run Database Migration**:
   ```bash
   # Open Supabase SQL Editor
   # Copy-paste contents of database/schema.sql
   # Execute
   ```
4. **Enable pgvector**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

---

### 4. Upstash Redis Setup

1. **Create Database**: https://console.upstash.com/
2. **Choose Region**: Closest to your location
3. **Copy Credentials**:
   - Endpoint URL (REDIS_HOST)
   - Password (REDIS_PASSWORD)

---

### 5. Gemini API Setup

1. **Get API Key**: https://aistudio.google.com/app/apikey
2. **Copy to** `ai-service/.env`
3. **Test it**:
   ```python
   import google.generativeai as genai
   genai.configure(api_key="YOUR_KEY")
   model = genai.GenerativeModel('gemini-2.0-flash-exp')
   response = model.generate_content("Hello")
   print(response.text)
   ```

---

## 📊 Health Check Commands

### Check All Services

```bash
# Backend
curl http://localhost:3001/health

# AI Service
curl http://localhost:8000/health

# Frontend (open in browser)
http://localhost:3000

# Database (from backend dir)
cd backend
npx ts-node -e "
const { getSupabase } = require('./src/config/db');
getSupabase().from('users').select('count', { count: 'exact', head: true }).then(console.log);
"
```

---

## 🔥 Nuclear Option (Full Reset)

If everything is broken:

```bash
# 1. Stop all services (Ctrl+C in all terminals)

# 2. Clear node_modules
cd backend && rm -rf node_modules package-lock.json && npm install
cd ../frontend && rm -rf node_modules package-lock.json .next && npm install

# 3. Clear Python cache
cd ../ai-service && rm -rf __pycache__ app/__pycache__

# 4. Clear browser cache
# - Open DevTools (F12)
# - Application tab → Clear storage → Clear site data
# - Or use Incognito mode

# 5. Restart everything
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd ai-service && uvicorn app.main:app --reload
# Terminal 3: cd frontend && npm run dev
```

---

## 💡 Pro Tips

1. **Use 3 Terminal Windows** - Don't try to background processes
2. **Backend First** - Always start backend before frontend
3. **Check Logs** - If something fails, read the terminal logs
4. **Test Endpoints** - Use `curl` or browser to test APIs
5. **Keep .env Files Safe** - Never commit them to Git
6. **Use Different Ports** - If ports are busy, change in `.env` files

---

## 📞 Still Having Issues?

1. **Check Phase Completion Docs**:
   - `PHASE1_COMPLETION.md` - Gmail sync, classification
   - `PHASE2_COMPLETION.md` - Dashboard, inbox explorer
   - `PHASE3_PROGRESS.md` - Semantic search (new!)

2. **Common Error Messages**:
   - `ECONNREFUSED` → Backend not running
   - `401 Unauthorized` → Invalid/expired token → Re-login
   - `500 Internal Server Error` → Check backend logs
   - `CORS Error` → Check frontend `NEXT_PUBLIC_API_URL`

3. **Debug Mode**:
   ```bash
   # Backend with more logs
   cd backend && NODE_ENV=development npm run dev
   
   # AI Service with debug logs
   cd ai-service && FASTMCP_LOG_LEVEL=DEBUG uvicorn app.main:app --reload --log-level debug
   ```

---

## ✅ Success Indicators

You know everything is working when:
- ✅ Backend logs show: `InboxIQ Backend API - Port: 3001`
- ✅ AI Service logs show: `Application startup complete`
- ✅ Frontend opens at `http://localhost:3000`
- ✅ Clicking "Get Started" redirects to Google OAuth
- ✅ After login, you see the dashboard
- ✅ Refreshing dashboard doesn't log you out
- ✅ Email sync works (you can trigger sync)

---

**Built with ❤️ for seamless email intelligence**
