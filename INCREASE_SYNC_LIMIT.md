# 📧 How to Increase Sync Limit (Later)

## Current: 200 emails (testing)
## To sync ALL emails:

### Step 1: Edit the Worker File

Open: `backend/src/queues/emailSync.worker.ts`

Find this line (around line 52):
```typescript
const MAX_EMAILS_TO_SYNC = 200;
```

### Step 2: Change the Limit

```typescript
// Option A: Sync 1000 emails
const MAX_EMAILS_TO_SYNC = 1000;

// Option B: Sync 5000 emails  
const MAX_EMAILS_TO_SYNC = 5000;

// Option C: Sync ALL emails (remove limit)
const MAX_EMAILS_TO_SYNC = Infinity;
```

### Step 3: Restart Backend

The backend will auto-reload if using `tsx watch`, or:

```bash
# Press Ctrl+C in backend terminal
# Then restart:
npm run dev
```

### Step 4: Trigger New Sync

- Go to dashboard
- Click "Sync" button
- It will continue from where it left off (incremental)

---

## ⏱️ Time Estimates

| Limit | Time |
|-------|------|
| 200 | 5-10 min |
| 500 | 15-20 min |
| 1000 | 30-40 min |
| 5000 | 2-3 hours |
| All (10k+) | 4-6 hours |

---

## 💡 Recommendation

1. **First**: Sync 200 (done) - verify everything works
2. **Then**: Sync 1000 - test with more data
3. **Finally**: Sync all - full inbox

This way you catch issues early!
