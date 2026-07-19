# 🚀 How to Start All InboxIQ Servers

## Quick Start (Easiest Method)

### **Option 1: Use the Batch File** (Recommended for Windows)

Simply double-click this file:
```
start-all.bat
```

This will open 3 separate command windows:
- ✅ Backend (port 3001)
- ✅ AI Service (port 8000)
- ✅ Frontend (port 3000)

**That's it!** All services will start automatically.

---

## Manual Start (3 Separate Terminals)

If you prefer to start each service manually or the batch file doesn't work:

### **Terminal 1: Backend**
```bash
cd backend
npm run dev
```
✅ Backend running on: http://localhost:3001

### **Terminal 2: AI Service**
```bash
cd ai-service
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```
✅ AI Service running on: http://localhost:8000

### **Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```
✅ Frontend running on: http://localhost:3000

---

## First Time Setup

### **Before First Run:**

1. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # AI Service
   cd ai-service
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install
   ```

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env` in root
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `ai-service/.env.example` to `ai-service/.env`
   - Copy `frontend/.env.local.example` to `frontend/.env.local`
   - Fill in your API keys and credentials

3. **Database Setup**
   - Create Supabase project
   - Run `database/schema.sql` in Supabase SQL Editor
   - ⚠️ **Run `database/migrate_to_nvidia_embeddings.sql`** (important!)

---

## Verify Everything is Running

### **1. Check Backend**
Open: http://localhost:3001/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### **2. Check AI Service**
Open: http://localhost:8000/health

Should return:
```json
{
  "status": "healthy",
  "service": "InboxIQ AI Service"
}
```

### **3. Check Frontend**
Open: http://localhost:3000

Should show the InboxIQ landing page.

---

## Troubleshooting

### **Port Already in Use**

If you get "port already in use" errors:

**Backend (port 3001):**
```bash
# Find and kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

**AI Service (port 8000):**
```bash
# Find and kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Frontend (port 3000):**
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **AI Service Won't Start**

Make sure Python virtual environment is activated:
```bash
cd ai-service
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### **Backend Crashes**

Check that Redis is running (Upstash or local):
```bash
# Test Redis connection
redis-cli -h your-redis-host -p your-redis-port -a your-password ping
```

Should return: `PONG`

### **Frontend Shows Errors**

Make sure `.env.local` exists with:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

---

## Stopping Services

### **If using batch file:**
- Close each command window (Backend, AI Service, Frontend)
- Or press `Ctrl+C` in each window

### **If using manual terminals:**
- Press `Ctrl+C` in each terminal

---

## Development Tips

### **Hot Reload**
All services support hot reload:
- ✅ Backend: Changes auto-restart (tsx watch)
- ✅ AI Service: Changes auto-restart (uvicorn --reload)
- ✅ Frontend: Changes auto-refresh (Next.js Fast Refresh)

### **Logs**
Watch the terminal windows for logs:
- Backend: Express logs, sync progress
- AI Service: Classification logs, embedding logs
- Frontend: Next.js compilation logs

### **API Documentation**
- Backend: No swagger (use API routes directly)
- AI Service: http://localhost:8000/docs (FastAPI Swagger UI)

---

## Quick Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 3000 | http://localhost:3000 | User interface |
| Backend | 3001 | http://localhost:3001 | API & email sync |
| AI Service | 8000 | http://localhost:8000 | Classification & embeddings |

### **Key Endpoints**

**Backend:**
- `GET /health` - Health check
- `POST /auth/google` - OAuth login
- `POST /emails/sync` - Trigger sync
- `GET /emails` - List emails
- `GET /analytics/overview` - Dashboard stats

**AI Service:**
- `GET /health` - Health check
- `POST /ai/classify` - Classify email
- `POST /ai/embed` - Generate embedding
- `POST /ai/process/batch` - Process emails
- `POST /ai/rag/query` - Semantic search

**Frontend:**
- `/` - Landing page
- `/dashboard` - Dashboard overview
- `/dashboard/inbox` - Inbox explorer

---

## 🎉 Ready to Go!

Once all three services are running:

1. Open http://localhost:3000
2. Click "Get Started"
3. Sign in with Google
4. Grant Gmail permissions
5. Watch your emails sync!

**Enjoy InboxIQ!** 📧✨
