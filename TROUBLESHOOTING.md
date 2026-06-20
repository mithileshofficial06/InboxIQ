# InboxIQ Troubleshooting Guide

## Current Issue: "Failed to Fetch" Error

### Quick Fix (Try This First)

**The problem is likely browser caching or the page was loaded before backend started.**

1. **Hard Refresh the Browser**
   - Press **Ctrl + Shift + R** (or Ctrl + F5)
   - Or right-click refresh button and select "Empty Cache and Hard Reload"

2. **If that doesn't work, clear ALL browser data:**
   - Press **Ctrl + Shift + Delete**
   - Select "All time"
   - Check all boxes
   - Click "Clear data"
   - Close and reopen browser
   - Go to http://localhost:3000

### Diagnostic Page

Visit http://localhost:3000/api-test to see detailed connection test results.

---

## Complete Restart Procedure

If the quick fix doesn't work, follow these steps:

### Step 1: Stop All Services
- Go to each terminal running a service
- Press **Ctrl + C** to stop it
- Close all browser tabs for localhost:3000

### Step 2: Start Backend First
```bash
cd backend
npm run dev
```

Wait until you see:
```
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: 3001                        ║
╚══════════════════════════════════════════╝
```

**Test it works:**
```bash
curl -UseBasicParsing http://localhost:3001/health
```

Should return: `{"status":"ok","service":"inboxiq-backend",...}`

### Step 3: Start AI Service (Required for Email Sync)
Open a **NEW terminal**:
```bash
cd ai-service
uvicorn app.main:app --reload
```

Wait for: `Uvicorn running on http://127.0.0.1:8000`

**Test it works:**
```bash
curl -UseBasicParsing http://localhost:8000/health
```

### Step 4: Start Frontend Last
Open a **NEW terminal**:
```bash
cd frontend
npm run dev
```

Wait for: `✓ Ready in XXXXms`

### Step 5: Open Browser
- Open browser in **Incognito/Private mode** (to avoid cache issues)
- Navigate to http://localhost:3000
- Try logging in

---

## Common Errors and Solutions

### Error: "Failed to fetch"

**Cause**: Browser cannot connect to backend API

**Solutions**:
1. Backend not running → Start backend first
2. Browser cache → Hard refresh (Ctrl+Shift+R)
3. Wrong port → Verify backend is on port 3001
4. CORS blocking → Backend now auto-configured to allow local network IPs
5. Page loaded before backend → Refresh after backend starts

**Test Backend**:
```bash
curl -UseBasicParsing http://localhost:3001/health
```

### Error: "429 Too Many Requests"

**Cause**: Rate limiter being hit (already fixed)

**Solution**: Backend is now configured with 1000 requests/minute limit

### Error: "ECONNRESET" or Redis Errors

**Cause**: Redis connection issues

**Verification**: Check `backend/.env` has:
```
REDIS_HOST=popular-flea-130495.upstash.io
```

**NOT** `https://popular-flea-130495.upstash.io` (no https prefix!)

### Error: "EADDRINUSE" (Port in use)

**Cause**: Port 3001 or 3000 already in use

**Solution**:
```bash
# For backend (port 3001)
cd backend
fix-and-start.bat

# For frontend, just stop the existing process
```

### Error: Emails Not Syncing

**Cause**: AI Service not running

**Solution**:
1. Start AI service: `cd ai-service && uvicorn app.main:app --reload`
2. Wait for it to start
3. Click "Sync Emails" in dashboard

**Verify AI Service**:
```bash
curl -UseBasicParsing http://localhost:8000/health
```

### Error: Session Lost on Refresh

**Cause**: Was clearing token on network errors (already fixed)

**Current Behavior**: Token is only cleared on 401 errors, kept on network errors

---

## Environment Files Checklist

### `backend/.env`
```env
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
REDIS_HOST=popular-flea-130495.upstash.io  # NO https://
NVIDIA_API_KEY=nvapi-...  # Your NVIDIA NIM key
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### `ai-service/.env`
```env
NVIDIA_API_KEY=nvapi-...  # Same as backend
DATABASE_URL=postgresql://...  # Your Supabase connection
```

---

## Database Migration Required

**IMPORTANT**: You need to run this SQL in Supabase before AI service will work:

1. Open Supabase Dashboard → SQL Editor
2. Paste contents of `database/migrate_to_nvidia_embeddings.sql`
3. Click "Run"

This changes embedding dimensions from 768 to 1024 for NVIDIA NV-Embed-v5.

**Verify Migration**:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'embeddings' AND column_name = 'embedding';
```

Should show: `vector(1024)`

---

## Service URLs Reference

| Service | URL | Health Check |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | Load homepage |
| Backend API | http://localhost:3001 | http://localhost:3001/health |
| AI Service | http://localhost:8000 | http://localhost:8000/health |
| Supabase | https://wyrcmlwodfnaffjzdgem.supabase.co | Via backend |
| Redis | Upstash (remote) | Via backend |

---

## Sync Status

- **Current Limit**: 200 emails (for testing)
- **Expected Time**: 5-10 minutes for 200 emails
- **To Increase**: Edit `backend/src/queues/emailSync.worker.ts` and change `MAX_EMAILS_TO_SYNC`

---

## Still Having Issues?

1. **Check all three services are running** (backend, frontend, AI service)
2. **Use diagnostic page**: http://localhost:3000/api-test
3. **Check browser console** (F12 → Console tab) for detailed errors
4. **Check backend terminal** for error messages
5. **Try incognito mode** to rule out browser extensions

---

## Network Access

The backend now supports:
- ✅ http://localhost:3000
- ✅ http://127.0.0.1:3000  
- ✅ http://192.168.x.x:3000 (local network)
- ✅ http://10.x.x.x:3000 (local network)

If accessing from network IP (like http://192.168.92.1:3000), the backend will automatically allow it in development mode.

---

## Quick Commands Reference

### Health Checks
```bash
# Backend
curl -UseBasicParsing http://localhost:3001/health

# AI Service
curl -UseBasicParsing http://localhost:8000/health

# Frontend (should return HTML)
curl -UseBasicParsing http://localhost:3000
```

### Start Services
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# AI Service
cd ai-service && uvicorn app.main:app --reload
```

### Fix Scripts
```bash
# Backend port conflict
cd backend && fix-and-start.bat
```
