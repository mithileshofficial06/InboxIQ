# Fix "Failed to Fetch" Error

## Problem
Frontend shows "Failed to fetch" errors when trying to connect to backend API.

## Root Cause
The browser is trying to make API calls but cannot reach the backend. This can happen due to:
1. Backend not running when page was loaded
2. Browser caching old connection attempts
3. CORS issues
4. Network configuration

## Solution Steps

### Step 1: Verify Backend is Running
Open a new terminal and test:
```bash
curl -UseBasicParsing http://localhost:3001/health
```

Expected: Should return `{"status":"ok",...}`

If this fails, backend is not running. Start it:
```bash
cd backend
npm run dev
```

### Step 2: Hard Refresh Browser
Once backend is confirmed running:

1. Open browser Developer Tools (F12)
2. Go to the "Network" tab
3. Right-click and select "Clear browser cache" or use Ctrl+Shift+Delete
4. Do a hard refresh: **Ctrl + Shift + R** (or Ctrl + F5)

### Step 3: Test API Connection
Navigate to: http://localhost:3000/api-test

This diagnostic page will show:
- What API URL the frontend is using
- Whether health endpoint is reachable
- Whether auth endpoint responds (even with 401)
- Connection test results

### Step 4: Check Browser Console
Open Developer Tools > Console tab and look for:
- CORS errors (red text mentioning "CORS" or "Access-Control-Allow-Origin")
- Network errors (check the Network tab for failed requests)
- The actual error messages from failed fetch calls

## Common Issues

### Issue 1: Backend Started After Frontend
**Symptom**: Frontend loads but shows "Failed to fetch"
**Solution**: Hard refresh browser (Ctrl+Shift+R) after backend is running

### Issue 2: Wrong API URL
**Symptom**: Requests go to wrong address
**Solution**: Check `frontend/.env.local` has:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Issue 3: CORS Blocking Requests
**Symptom**: Console shows CORS policy errors
**Solution**: Verify `backend/.env` has:
```
FRONTEND_URL=http://localhost:3000
```

### Issue 4: Port Already in Use
**Symptom**: Backend won't start, shows EADDRINUSE
**Solution**: Use the fix script:
```bash
cd backend
fix-and-start.bat
```

## Quick Test Commands

Test backend health:
```bash
curl -UseBasicParsing http://localhost:3001/health
```

Test frontend is serving:
```bash
curl -UseBasicParsing http://localhost:3000
```

## Startup Order

For best results, start services in this order:
1. Backend: `cd backend && npm run dev`
2. Wait for "InboxIQ Backend API" message
3. Frontend: `cd frontend && npm run dev`
4. Wait for "Ready in" message
5. Open browser to http://localhost:3000

## Still Not Working?

1. Stop all services (Ctrl+C in all terminals)
2. Clear browser cache completely
3. Start backend first, wait for it to be ready
4. Start frontend second
5. Open browser in incognito/private mode
6. Navigate to http://localhost:3000

If still failing, check:
- Windows Firewall isn't blocking localhost connections
- No antivirus blocking the connections
- Try accessing from http://127.0.0.1:3000 instead
