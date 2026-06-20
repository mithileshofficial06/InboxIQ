# How to Start InboxIQ (All Services)

## Quick Start Guide

You need to run **THREE** services. Open **THREE separate terminals**:

### Terminal 1: Backend
```bash
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\backend
npm run dev
```

**Wait for**: 
```
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: 3001                        ║
╚══════════════════════════════════════════╝
```

### Terminal 2: AI Service
```bash
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\ai-service
uvicorn app.main:app --reload
```

**Wait for**: 
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 3: Frontend
```bash
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\frontend
npm run dev
```

**Wait for**: 
```
✓ Ready in XXXXms
Local:   http://localhost:3000
```

---

## Then Open Browser

1. Open browser
2. Go to: **http://localhost:3000**
3. Click "Sign in with Google"
4. After login, click "Sync Emails" on dashboard

---

## Troubleshooting

### Backend won't start (port in use)
```bash
cd backend
fix-and-start.bat
```

### Can't connect to services
- Hard refresh browser: **Ctrl + Shift + R**
- Or go to: http://localhost:3000/api-test

### Still not working?
Read: `TROUBLESHOOTING.md`

---

## Service Status Check

### Check Backend
```bash
curl -UseBasicParsing http://localhost:3001/health
```
Should return: `{"status":"ok"...}`

### Check AI Service  
```bash
curl -UseBasicParsing http://localhost:8000/health
```
Should return health status

### Check Frontend
Just open: http://localhost:3000

---

## Stop All Services

In each terminal, press: **Ctrl + C**
