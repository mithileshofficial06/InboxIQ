# 🔴 Setup Redis for Email Sync - REQUIRED

You're absolutely right! **Email sync is the core feature** - without it, the app is useless. Let's fix Redis NOW.

---

## 🚀 Quick Setup (3 Steps - Takes 5 minutes)

### **Step 1: Create New Upstash Redis Database**

1. **Go to Upstash**:
   ```
   https://console.upstash.com/
   ```

2. **Login/Signup** (Free account)

3. **Click "Create Database"**:
   - **Name**: `inboxiq-redis-prod`
   - **Type**: Choose **Regional** (not Global)
   - **Region**: Choose closest to you (e.g., `us-east-1`, `eu-west-1`)
   - **TLS**: ✅ Enabled (default)
   - **Eviction**: No eviction
   - **Price**: **FREE tier** (10,000 commands/day)

4. **Click "Create"**

---

### **Step 2: Copy Connection Details**

After creating, you'll see the database dashboard. Look for **"Redis Connect"** section:

#### **You'll see TWO sections:**

**1. REST API (Recommended):**
```
UPSTASH_REDIS_REST_URL: https://your-new-db.upstash.io
UPSTASH_REDIS_REST_TOKEN: AYzjSN...
```

**2. Connect with redis-cli:**
```
Endpoint: your-new-db.upstash.io
Port: 6379
Password: AYzjSN...
```

#### **Copy THESE THREE values:**
- ✅ **Endpoint** (hostname without https://)
- ✅ **Port** (usually 6379)
- ✅ **Password** (long string)

---

### **Step 3: Update Your .env Files**

#### **Update: `C:\Users\mithi\OneDrive\Desktop\InboxIQ\.env`**

```bash
# --- Upstash Redis ---
REDIS_HOST=your-new-db.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_actual_password_here
```

**IMPORTANT:**
- ❌ NO `https://` in REDIS_HOST
- ❌ NO quotes around password
- ❌ NO spaces

Example:
```bash
REDIS_HOST=sunny-dragon-12345.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=AYzjSNDkO...abc123
```

#### **Update: `C:\Users\mithi\OneDrive\Desktop\InboxIQ\backend\.env`**

Copy the **EXACT SAME** values:
```bash
REDIS_HOST=your-new-db.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_actual_password_here
```

---

### **Step 4: Restart Backend**

```bash
# Stop backend (Ctrl+C)
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\backend
npm run dev
```

**You should see:**
```
✅ All required environment variables are set
[Sync Worker] ✅ Started successfully
[Redis] ✅ Connected successfully
```

**NO MORE ERRORS!** ✅

---

## 🧪 Test Email Sync

### **1. Start All Services:**

```bash
# Run the startup script
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ
start-all.bat
```

Or manually:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: AI Service
cd ai-service && venv\Scripts\activate && uvicorn app.main:app --reload

# Terminal 3: Frontend
cd frontend && npm run dev
```

### **2. Login and Trigger Sync:**

1. Open: http://localhost:3000
2. Click "Get Started"
3. Sign in with Google
4. Grant Gmail permissions
5. **Email sync should start automatically!**

### **3. Watch Backend Logs:**

You should see:
```
[Sync Worker] Starting full-sync for user abc-123
[Sync Worker] Fetched 100 message IDs
[Sync Worker] Processing batch 1 of 5...
[Sync Worker] Job completed
```

---

## 📊 Verify It's Working

### **Check Redis Connection:**

In backend logs, look for:
```
✅ [Redis] Connected successfully
✅ [Sync Worker] Started successfully
```

### **Check Database:**

After sync completes, check Supabase:
```sql
SELECT COUNT(*) FROM emails WHERE user_id = 'your-user-id';
```

Should show > 0 emails!

### **Check Dashboard:**

- Dashboard should show total email count
- Categories chart should have data
- Top senders should be listed

---

## 🔍 Troubleshooting

### **Issue 1: "ENOTFOUND" Error**

```
[Redis] Connection error: getaddrinfo ENOTFOUND xyz.upstash.io
```

**Solution:**
- Check if you copied the hostname correctly
- Remove any `https://` prefix
- Make sure database is in "Active" status on Upstash

### **Issue 2: "WRONGPASS" Error**

```
[Redis] Connection error: WRONGPASS invalid username-password pair
```

**Solution:**
- Copy password again from Upstash dashboard
- Make sure there are NO spaces before/after
- Password is case-sensitive!

### **Issue 3: "Connection Timeout"**

```
[Redis] Connection error: connect ETIMEDOUT
```

**Solution:**
- Check your internet connection
- Try a different region when creating database
- Check if firewall is blocking port 6379

---

## 🎯 Alternative: Local Redis (If Upstash Doesn't Work)

If Upstash keeps failing, you can run Redis locally:

### **Option 1: Docker (Recommended)**

```bash
# Install Docker Desktop for Windows
# Then run:
docker run -d --name inboxiq-redis -p 6379:6379 redis

# Update .env:
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### **Option 2: Windows Redis**

1. Download: https://github.com/microsoftarchive/redis/releases
2. Install and run Redis server
3. Update .env:
   ```bash
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=
   ```

---

## 📋 Checklist

Before moving forward, verify:

- [ ] Created new Upstash Redis database
- [ ] Copied endpoint, port, password
- [ ] Updated root `.env` file
- [ ] Updated `backend/.env` file
- [ ] Restarted backend
- [ ] Logs show `[Redis] Connected successfully`
- [ ] Logs show `[Sync Worker] Started successfully`
- [ ] Can login to app
- [ ] Email sync starts after login
- [ ] Emails appear in database

---

## 💡 Quick Tips

### **Copy-Paste Template:**

When you create the database, fill this in:

```bash
# From Upstash dashboard, copy these:
REDIS_HOST=____________________.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=_________________________________
```

Then paste into BOTH:
1. Root `.env`
2. `backend/.env`

### **Restart Checklist:**

After updating `.env`:
```bash
1. Stop backend (Ctrl+C)
2. Close terminal
3. Open NEW terminal
4. cd backend
5. npm run dev
```

---

## 🎉 Expected Result

Once working:

```
✅ Backend running on port 3001
✅ Redis connected
✅ Sync worker active
✅ Can login with Google
✅ Emails syncing automatically
✅ Dashboard shows data
✅ Categories populated
✅ Search works
```

**Then your app is FULLY FUNCTIONAL!** 🚀

---

## 🆘 Need Help?

If you're stuck:
1. Share screenshot of Upstash dashboard
2. Share backend logs (first 20 lines)
3. Share your `.env` file (hide passwords!)

I'll help you get it working immediately!

---

**Let's get Redis working NOW so your app is fully functional!** 💪
