# 🔐 InboxIQ — Credentials & Environment Setup Guide

## Overview

InboxIQ uses a three-service architecture, each requiring specific environment variables:

```
Frontend (Next.js) → Backend (Express) → AI Service (FastAPI)
     ↓                    ↓                      ↓
.env.local          .env (root)            .env
```

---

## ⚡ Quick Setup (Windows)

```powershell
# 1. Run setup script
.\setup-env.bat

# 2. Edit root .env with your rotated credentials
code .env

# 3. Copy DATABASE_URL & GEMINI_API_KEY to ai-service/.env
# (Open ai-service/.env and paste the values)

# 4. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

## ⚡ Quick Setup (macOS/Linux)

```bash
# 1. Run setup script
chmod +x setup-env.sh
./setup-env.sh

# 2. Edit root .env with your rotated credentials
code .env

# 3. Copy DATABASE_URL & GEMINI_API_KEY to ai-service/.env

# 4. Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

---

## 📋 Environment Variable Reference

### Root `.env` (Backend API)

**Required:**
```env
# General
NODE_ENV=development              # development or production
PORT=3001
FRONTEND_URL=http://localhost:3000

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Supabase (from project settings)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Redis (from Upstash dashboard)
REDIS_HOST=https://xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=xxxxx

# JWT Secret (generate: `openssl rand -hex 32`)
JWT_SECRET=xxxxx

# Gemini API
GEMINI_API_KEY=xxxxx
```

---

### Frontend `frontend/.env.local`

**Required:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

---

### AI Service `ai-service/.env`

**Required (copy from root .env):**
```env
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=xxxxx
```

---

## 🔑 Getting Your Credentials

### 1. Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create or select your project
3. Enable Gmail API
4. Go to **Credentials** → **Create OAuth 2.0 Client ID**
5. Select **Web application**
6. Add authorized redirect URIs: `http://localhost:3001/auth/google/callback`
7. Copy **Client ID** and **Client Secret**

### 2. Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create or select your project
3. Go to **Project Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`
5. For **DATABASE_URL**, go to **Database** → **Connection Pooling**
   - Use the connection string provided

### 3. Redis/Upstash Credentials
1. Go to [Upstash Console](https://console.upstash.com)
2. Create or select your Redis database
3. Copy:
   - **Endpoint** → `REDIS_HOST`
   - **Port** → `REDIS_PORT` (usually 6379)
   - **Password** → `REDIS_PASSWORD`

### 4. Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key → `GEMINI_API_KEY`

---

## 🔄 Production Deployment

### Before deploying:

1. **Generate strong JWT secret:**
   ```bash
   # macOS/Linux
   openssl rand -hex 32
   
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 })) | Out-String
   ```

2. **Update environment variables:**
   - Set `NODE_ENV=production`
   - Update `FRONTEND_URL` to your production domain
   - Update `GOOGLE_REDIRECT_URI` to production domain

3. **Verify all services:**
   ```bash
   npm run build
   ```

---

## ✅ Validation

The backend automatically validates required environment variables on startup:

```
✅ All required environment variables are set
```

If you see errors like:
```
❌ Missing required environment variables:
   - GOOGLE_CLIENT_ID
```

→ Edit your `.env` file and add the missing values.

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` to git** (it's in `.gitignore`)
2. ✅ **Rotate credentials regularly** (especially if ever exposed)
3. ✅ **Use different credentials per environment** (dev, staging, production)
4. ✅ **Keep JWT_SECRET strong** and change it regularly
5. ✅ **Use read-only scopes** in OAuth (we use Gmail read-only)

---

## 🚀 Verify Everything Works

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev
# → Running on http://localhost:3000

# Terminal 2 — Backend
cd backend && npm run dev
# → Running on http://localhost:3001

# Terminal 3 — AI Service
cd ai-service && uvicorn app.main:app --reload --port 8000
# → Running on http://localhost:8000

# Terminal 4 — Check health
curl http://localhost:3001/health
# → {"status":"ok","service":"inboxiq-backend","timestamp":"..."}
```

---

## 📞 Troubleshooting

**Backend won't start:**
```
✅ Check .env file exists and has all required variables
✅ Check REDIS_HOST is accessible from your network
✅ Check SUPABASE credentials are correct
✅ Run: npm install (dependencies may be missing)
```

**Frontend can't connect to backend:**
```
✅ Check NEXT_PUBLIC_API_URL in frontend/.env.local
✅ Check backend is running on http://localhost:3001
✅ Check CORS configuration in backend
```

**AI Service won't start:**
```
✅ Check ai-service/.env has DATABASE_URL and GEMINI_API_KEY
✅ Check Python 3.11+ installed: python --version
✅ Check dependencies: pip install -r requirements.txt
```

---

Happy hacking! 🚀
