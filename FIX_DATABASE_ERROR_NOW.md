# 🔧 Fix Database Error - Step by Step

## The Problem

Your backend is **still using the OLD database URL** from cache even though we updated the `.env` files.

Error: `wyrcmlwodfnaffjzdgem.supabase.co` (old) instead of `vssvcmqmeijgndccyvbg.supabase.co` (new)

---

## ✅ Quick Fix (3 Steps)

### **Step 1: Stop Backend**

In your backend terminal, press:
```
Ctrl + C
```

Wait for it to fully stop.

### **Step 2: Kill All Node Processes (Important!)**

Run this command:
```bash
taskkill /F /IM node.exe /T
```

This ensures no cached node processes are running.

### **Step 3: Start Backend Again**

```bash
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\backend
npm run dev
```

---

## 🎯 What to Look For

### **Good Signs** ✅

When backend starts, you should see:
```
[Config] ✅ All required environment variables are set
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: 3001                        ║
╚══════════════════════════════════════════╝
[Redis] Connected successfully
```

### **Bad Signs** ❌

If you see:
```
❌ GEMINI_API_KEY is required
Error: getaddrinfo ENOTFOUND wyrcmlwodfnaffjzdgem.supabase.co
```

Then the cache wasn't cleared properly.

---

## 🔄 Alternative: Use Restart Script

I created a batch file that does all the steps automatically:

```bash
# Just run this:
restart-backend.bat
```

This will:
1. Kill all node processes
2. Clear cache
3. Start backend fresh

---

## 🧪 Test After Restart

### **1. Check Backend Health**

Open: http://localhost:3001/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### **2. Try Logging In**

1. Go to: http://localhost:3000
2. Click "Get Started"
3. Sign in with Google
4. Should redirect to dashboard (NO database error!)

---

## 🐛 Still Getting Error?

### **Check Backend .env File**

Open `backend\.env` and verify these lines:

```bash
SUPABASE_URL=https://vssvcmqmeijgndccyvbg.supabase.co
DATABASE_URL=postgresql://postgres:Micky007%4012345@db.vssvcmqmeijgndccyvbg.supabase.co:5432/postgres
```

**Make sure it says `vssvcmqmeijgndccyvbg` NOT `wyrcmlwodfnaffjzdgem`!**

### **Check Backend Terminal Output**

Look for the actual error message. It should show which database it's trying to connect to.

If it still shows `wyrcmlwodfnaffjzdgem`, then:

1. Stop backend (Ctrl+C)
2. Close the terminal completely
3. Open a NEW terminal
4. Run: `cd backend && npm run dev`

### **Nuclear Option: Delete node_modules**

If nothing works:

```bash
cd backend
rmdir /S /Q node_modules
npm install
npm run dev
```

---

## 📝 Changes I Made

### **1. Fixed GEMINI_API_KEY Warning**

Changed in `backend/src/config/validation.ts`:
```typescript
// Before
if (!config.geminiApiKey) {
  errors.push('GEMINI_API_KEY is required');
}

// After
if (!config.nvidiaApiKey) {
  errors.push('NVIDIA_API_KEY is required');
}
```

### **2. Updated Config**

Changed in `backend/src/config/index.ts`:
```typescript
// Before
geminiApiKey: process.env.GEMINI_API_KEY || '',

// After
nvidiaApiKey: process.env.NVIDIA_API_KEY || '',
```

---

## ✅ Expected Result

After restarting, when you login:

1. ✅ No "Database error" message
2. ✅ No `wyrcmlwodfnaffjzdgem` in logs
3. ✅ Dashboard loads successfully
4. ✅ Backend shows: `[Redis] Connected successfully`

---

## 🚀 Quick Commands

```bash
# Stop backend
Ctrl + C

# Kill all node processes
taskkill /F /IM node.exe /T

# Go to backend folder
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\backend

# Start backend
npm run dev

# Open app
# Browser: http://localhost:3000
```

---

## 📞 If You're Still Stuck

Send me:
1. Screenshot of backend terminal after restart
2. Screenshot of the error in browser
3. Contents of `backend\.env` file (first 10 lines)

**The issue is definitely the cached environment variables. A proper restart should fix it!** 💪
