# 🚀 Getting Started with InboxIQ

**5-Minute Setup Guide**

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd InboxIQ

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your credentials
# (see Configuration section below)

# 4. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ai-service && pip install -r requirements.txt && cd ..

# 5. Setup database
# Go to Supabase → SQL Editor
# Run the SQL from: database/schema.sql

# 6. Start all services
start-all.bat  # Windows
# OR
./start-all.sh  # macOS/Linux
```

---

## 🔑 Required Credentials

### 1. Google OAuth (5 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable Gmail API
3. Create OAuth 2.0 Client ID
4. Add redirect: `http://localhost:3001/auth/google/callback`
5. Copy Client ID & Secret

### 2. Supabase (3 minutes)
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL, Anon Key, Service Role Key
4. Copy database connection string
5. Run `database/schema.sql` in SQL Editor

### 3. Upstash Redis (2 minutes)
1. Sign up at [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy Host, Port, Password

### 4. NVIDIA NIM (2 minutes)
1. Sign up at [build.nvidia.com](https://build.nvidia.com)
2. Generate API key
3. Copy key

---

## 📝 Configuration

Edit `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres

# Redis (Upstash)
REDIS_HOST=xxxxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# JWT Secret (generate random string)
JWT_SECRET=your-random-secret-here

# NVIDIA NIM
NVIDIA_API_KEY=nvapi-xxxxx

# URLs
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
NODE_ENV=development
PORT=3001
```

**Important**: 
- If database password contains `@`, encode it as `%40`
- Don't include `https://` in `REDIS_HOST`

---

## 🏃 Running the App

### Option 1: All Services at Once (Recommended)
```bash
start-all.bat  # Windows
```

### Option 2: Individual Services
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - AI Service
cd ai-service
python -m app.main
```

---

## ✅ Verify It's Working

### 1. Check Services
- Frontend: http://localhost:3000 ✅
- Backend: http://localhost:3001/health ✅
- AI Service: http://localhost:8000/docs ✅

### 2. Check Backend Logs
Should see:
```
[Config] ✅ All required environment variables are set
[Redis] ✅ Connected successfully
[Sync Worker] ✅ Started successfully
```

### 3. Test Login
1. Go to http://localhost:3000
2. Click "Sign in with Google"
3. Authorize the app
4. Should redirect to dashboard

### 4. Check Email Sync
Backend logs should show:
```
[Sync] Starting email sync for user: <id>
[Sync Worker] Fetched X message IDs
[Sync Worker] Stored X emails
```

---

## 🐛 Common Issues

### "Database error" after login
- **Cause**: Database schema not created
- **Fix**: Run `database/schema.sql` in Supabase SQL Editor

### Redis connection fails
- **Cause**: Wrong credentials or format
- **Fix**: Verify `REDIS_HOST` doesn't have `https://`, check password

### Backend won't start
- **Cause**: Missing environment variables
- **Fix**: Check all required vars in `.env` match `.env.example`

### AI Service errors
- **Cause**: Invalid NVIDIA API key
- **Fix**: Generate new key at build.nvidia.com

---

## 📚 Next Steps

1. **Explore Dashboard**: View analytics and insights
2. **Browse Inbox**: Try different view modes (Grid/List/Timeline)
3. **Test Search**: Use filters and search functionality
4. **Increase Sync Limit**: Edit `backend/src/queues/emailSync.worker.ts`
5. **Customize UI**: Adjust colors in `frontend/src/app/globals.css`

---

## 📖 Documentation

- **Full Guide**: [README.md](./README.md)
- **Development Progress**: [PROGRESS.md](./PROGRESS.md)
- **Project Overview**: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## 🆘 Need Help?

1. Check [README.md](./README.md) troubleshooting section
2. Review [PROGRESS.md](./PROGRESS.md) known issues
3. Verify all services are running
4. Check backend logs for errors
5. Ensure database schema is deployed

---

**Ready to analyze your inbox! 🎉**
