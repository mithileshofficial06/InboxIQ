# 🔴 Fix Redis Password Error

## The Problem

```
[Redis] Connection error: WRONGPASS invalid username-password pair or user is disabled
```

Your Redis password in `.env` is **incorrect or expired**.

---

## ✅ How to Fix (2 Options)

### **Option 1: Get Correct Password from Upstash** (Recommended)

1. **Go to Upstash Console**:
   - Open: https://console.upstash.com/
   - Login with your account

2. **Select Your Database**:
   - Click on: `popular-flea-130495`

3. **Copy the REST API Token** (this is your password):
   - Look for section: **REST API**
   - Copy the `UPSTASH_REDIS_REST_TOKEN`
   - This is your password!

4. **Update your `.env` files**:
   ```bash
   # In both root .env AND backend/.env
   REDIS_PASSWORD=your_actual_token_here
   ```

5. **Restart backend**

---

### **Option 2: Use Upstash REST URL** (Alternative)

Upstash has TWO connection methods:
1. **Redis Protocol** (traditional - what you're using now)
2. **REST API** (HTTP-based - more reliable)

Let me help you switch to REST API which is more reliable with Upstash.

---

## 🔍 How to Get Your Correct Redis Credentials

### **Step-by-Step**:

1. Go to: https://console.upstash.com/redis/`popular-flea-130495`

2. You'll see two sections:

#### **Traditional Redis Connection**:
```
Endpoint: popular-flea-130495.upstash.io
Port: 6379  
Password: <YOUR_PASSWORD_HERE>
```

#### **REST API** (Recommended):
```
UPSTASH_REDIS_REST_URL: https://popular-flea-130495.upstash.io
UPSTASH_REDIS_REST_TOKEN: <YOUR_TOKEN_HERE>
```

3. **Copy EITHER**:
   - The **Password** from Redis connection, OR
   - The **REST TOKEN** from REST API

4. **Update `.env` files**:

#### **Root `.env`**:
```bash
REDIS_HOST=popular-flea-130495.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=<PASTE_YOUR_PASSWORD_OR_TOKEN_HERE>
```

#### **Backend `.env`**:
```bash
REDIS_HOST=popular-flea-130495.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=<PASTE_YOUR_PASSWORD_OR_TOKEN_HERE>
```

**IMPORTANT**: Make sure there are NO spaces before or after the password!

---

## 🔄 After Updating

1. **Stop backend** (Ctrl+C)
2. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Look for**:
   ```
   [Redis] Connected successfully
   ```

4. **NO more errors**:
   ```
   ✅ No more "WRONGPASS" errors
   ✅ No more "Worker error"
   ```

---

## 🐛 Still Getting Error?

### **Check 1: Password Format**

Make sure password has NO:
- ❌ Spaces before/after
- ❌ Quotes around it
- ❌ Line breaks

```bash
# WRONG
REDIS_PASSWORD= gQAAAAAAAf2_AAIgcDE0YzFiNzkwYzg0ZjE0N2Y2ODg5N2IwYTJhZTY2MTI3ZQ

# WRONG
REDIS_PASSWORD="gQAAAAAAAf2_AAIgcDE0YzFiNzkwYzg0ZjE0N2Y2ODg5N2IwYTJhZTY2MTI3ZQ"

# CORRECT
REDIS_PASSWORD=gQAAAAAAAf2_AAIgcDE0YzFiNzkwYzg0ZjE0N2Y2ODg5N2IwYTJhZTY2MTI3ZQ
```

### **Check 2: Database Still Active**

Go to Upstash dashboard and verify:
- ✅ Database status is "Active"
- ✅ Not paused or deleted

### **Check 3: Create New Database**

If password keeps failing:
1. Create a NEW Redis database in Upstash (it's free!)
2. Copy the NEW password
3. Update `.env` files
4. Restart backend

---

## 🎯 Quick Fix Command

Once you have the correct password:

```bash
# 1. Stop backend (Ctrl+C in terminal)

# 2. Update password in .env file
# (Use notepad or VS Code)

# 3. Restart backend
cd C:\Users\mithi\OneDrive\Desktop\InboxIQ\backend
npm run dev

# 4. Check for success:
# Should see: [Redis] Connected successfully
```

---

## 📸 Screenshot Guide

When you open Upstash dashboard, look for:

```
┌──────────────────────────────────────┐
│  Database: popular-flea-130495       │
├──────────────────────────────────────┤
│  REST API                            │
│  UPSTASH_REDIS_REST_URL:             │
│  https://popular-flea-130...         │
│                                      │
│  UPSTASH_REDIS_REST_TOKEN: ← COPY!  │
│  AabcdEFG...                         │
└──────────────────────────────────────┘
```

That token IS your Redis password!

---

## ✅ Expected Result

After fixing, backend logs should show:

```
[Config] ✅ All required environment variables are set
╔══════════════════════════════════════════╗
║        InboxIQ Backend API               ║
║        Port: 3001                        ║
╚══════════════════════════════════════════╝
[Sync Worker] Started successfully
[Redis] Connected successfully          ← Success!
```

**No more WRONGPASS errors!** ✅

---

## 💡 Why This Happened

Your current password might be:
1. **Incorrect** - Wrong password in `.env`
2. **Expired** - Token was regenerated
3. **Database deleted** - Database was removed/recreated
4. **Account issue** - Upstash account issue

**Solution**: Get fresh credentials from Upstash dashboard!

---

Need help? Share a screenshot of your Upstash dashboard (hide the actual password) and I can guide you better!
