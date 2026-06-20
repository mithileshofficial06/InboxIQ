# 🚨 Quick Fix Guide

## Error: "Cannot find module 'axios'" and "EADDRINUSE port 3001"

### Solution (Choose One):

---

## ✅ Option 1: Use the Fix Script (Recommended)

**Just run this in your backend folder**:
```bash
cd backend
fix-and-start.bat
```

This will:
1. Kill any process using port 3001
2. Install all dependencies (including axios)
3. Start the backend server

---

## ✅ Option 2: Manual Steps

### Step 1: Kill process on port 3001
```bash
# Find the process
netstat -ano | findstr :3001

# Kill it (replace PID with the number you see)
taskkill /F /PID <PID>
```

### Step 2: Reinstall dependencies
```bash
cd backend
npm install
```

### Step 3: Start backend
```bash
npm run dev
```

---

## ✅ Option 3: Complete Fresh Install

If still having issues:

```bash
cd backend

# Delete node_modules and package-lock
rmdir /s /q node_modules
del package-lock.json

# Reinstall everything
npm install

# Start backend
npm run dev
```

---

## Expected Output

When backend starts successfully, you should see:

```
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: 3001                        ║
║        Env: development                  ║
╚══════════════════════════════════════════╝

[Sync Worker] Worker started - Concurrency: 2
```

---

## Test Backend is Running

Open in browser or run:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","service":"inboxiq-backend","timestamp":"..."}
```

---

## Still Having Issues?

### 1. Check Node.js version
```bash
node --version
# Should be v18+ or v20+
```

### 2. Check if port is really free
```bash
netstat -ano | findstr :3001
# Should return nothing
```

### 3. Try a different port temporarily
```bash
# Edit backend/.env
PORT=3002

# Edit frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3002

# Restart both services
```

---

## What Causes These Errors?

### "Cannot find module 'axios'"
- **Cause**: node_modules not synced with package.json
- **Fix**: `npm install`

### "EADDRINUSE port 3001"
- **Cause**: Another process is using port 3001 (usually a previous instance that didn't close)
- **Fix**: Kill the process or use different port

---

## Quick Commands Cheat Sheet

```bash
# Install dependencies
npm install

# Start backend (development)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check what's using port 3001
netstat -ano | findstr :3001

# Kill process by PID
taskkill /F /PID <PID>
```

---

**After fixing, proceed to login at http://localhost:3000** 🚀
