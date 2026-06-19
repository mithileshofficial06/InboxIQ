# 🚀 InboxIQ — Credentials Quick Reference

## File Structure

```
InboxIQ/
├── .env                      ← Backend credentials (NEVER commit)
├── .env.example              ← Template with placeholders ✓ COMMIT THIS
├── frontend/
│   ├── .env.local           ← Frontend config (NEVER commit)
│   └── .env.local.example   ← Template ✓ COMMIT THIS
├── ai-service/
│   ├── .env                 ← AI service config (NEVER commit)
│   └── .env.example         ← Template ✓ COMMIT THIS
└── SETUP.md                 ← Full setup guide
```

---

## Service → Environment Variables Mapping

| Service | File | Variables |
|---------|------|-----------|
| **Backend** | `.env` | GOOGLE_*, SUPABASE_*, REDIS_*, JWT_*, GEMINI_API_KEY |
| **Frontend** | `frontend/.env.local` | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_AI_URL |
| **AI Service** | `ai-service/.env` | DATABASE_URL, GEMINI_API_KEY |

---

## Setup Checklist

- [ ] Run `setup-env.bat` (Windows) or `setup-env.sh` (macOS/Linux)
- [ ] Fill `.env` with your rotated credentials
- [ ] Copy `DATABASE_URL` & `GEMINI_API_KEY` to `ai-service/.env`
- [ ] Verify `frontend/.env.local` is created
- [ ] Run `npm install` in root, backend, and frontend
- [ ] Start services: `npm run dev` (all), or individual terminals
- [ ] Check health: `curl http://localhost:3001/health`

---

## Environment Variables by Service

### Backend (.env) — **REQUIRED**
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<your-rotated-client-id>
GOOGLE_CLIENT_SECRET=<your-rotated-client-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DATABASE_URL=<your-database-url>
REDIS_HOST=<your-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password>
JWT_SECRET=<your-jwt-secret>
GEMINI_API_KEY=<your-gemini-key>
```

### Frontend (.env.local) — **REQUIRED**
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_AI_URL=http://localhost:8000
```

### AI Service (.env) — **REQUIRED**
```
DATABASE_URL=<copy-from-backend>
GEMINI_API_KEY=<copy-from-backend>
```

---

## Where to Get Credentials

| Credential | Source | URL |
|-----------|--------|-----|
| Google OAuth | Google Cloud Console | https://console.cloud.google.com/apis/credentials |
| Supabase | Supabase Dashboard | https://supabase.com/dashboard/projects |
| Redis/Upstash | Upstash Console | https://console.upstash.com |
| Gemini API | Google AI Studio | https://aistudio.google.com/app/apikey |

---

## Common Commands

```bash
# Setup
./setup-env.bat                    # Windows
./setup-env.sh                     # macOS/Linux

# Development
npm run dev                        # Run all services
cd backend && npm run dev          # Backend only
cd frontend && npm run dev         # Frontend only
cd ai-service && uvicorn ...      # AI Service

# Health checks
curl http://localhost:3001/health  # Backend
curl http://localhost:3000         # Frontend
curl http://localhost:8000/docs    # AI Service docs
```

---

## Security Checklist

✅ `.env` is in `.gitignore` — never committed
✅ `.env.example` has placeholders — safe to commit
✅ Credentials rotated after exposure
✅ Different credentials per environment (dev/staging/prod)
✅ JWT_SECRET is strong and random
✅ OAuth uses read-only Gmail scope

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing required environment variables" | Run setup script and edit .env |
| Backend won't connect to Redis | Check REDIS_HOST and REDIS_PASSWORD |
| Frontend can't reach backend | Check NEXT_PUBLIC_API_URL in .env.local |
| AI Service fails to start | Check DATABASE_URL and GEMINI_API_KEY in ai-service/.env |

---

See **SETUP.md** for detailed guide.
