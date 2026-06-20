# QUICK FIX - "Failed to Fetch" Error

## The Problem
Frontend shows: `TypeError: Failed to fetch`

## The Solution (90% of cases)

### Option 1: Hard Refresh Browser ⚡
1. Press **Ctrl + Shift + R**
2. Wait 5 seconds
3. Try again

### Option 2: Clear Cache & Restart 🔄
1. Press **Ctrl + Shift + Delete**
2. Select "All time" 
3. Clear all data
4. Close browser completely
5. Reopen and go to http://localhost:3000

### Option 3: Verify Backend is Running ✅
```bash
curl -UseBasicParsing http://localhost:3001/health
```

If this fails, backend is not running:
```bash
cd backend
npm run dev
```

---

## Root Causes Fixed

✅ **CORS Updated**: Backend now accepts requests from:
- http://localhost:3000
- http://127.0.0.1:3000
- http://192.168.x.x:3000 (local network)

✅ **Session Persistence**: Token no longer cleared on network errors

✅ **Rate Limiting**: Increased to 1000 requests/minute

✅ **Email Sync Limit**: Set to 200 emails for testing

---

## If Still Not Working

1. **Test API Connection**: http://localhost:3000/api-test
2. **Read Full Guide**: `TROUBLESHOOTING.md`
3. **Restart All Services**: Follow `START_ALL.md`

---

## Services Required

| Service | Status | Command |
|---------|--------|---------|
| Backend | ✅ RUNNING | `cd backend && npm run dev` |
| AI Service | ❌ NEEDS START | `cd ai-service && uvicorn app.main:app --reload` |
| Frontend | ✅ RUNNING | Already running |

**YOU NEED TO START AI SERVICE** for email sync to work!

---

## Expected Behavior After Fix

1. Login works ✅
2. Dashboard loads ✅
3. Session persists on refresh ✅
4. Can click "Sync Emails" (starts 200 email sync)
5. Sync completes in 5-10 minutes

---

## Next Steps

1. Hard refresh browser (**Ctrl + Shift + R**)
2. If works → Start AI service → Click "Sync Emails"
3. If not → Read `TROUBLESHOOTING.md`
