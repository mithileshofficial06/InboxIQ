# 🤖 AI API Clarification - InboxIQ

## ❌ NOT Using Gemini API

**You are NOT using Google Gemini in this project.**

## ✅ Using NVIDIA NIM API

**You ARE using NVIDIA NIM with Meta's Llama 3.3 70B Instruct.**

---

## Current Configuration

### **AI Models**
| Purpose | Model | Provider |
|---------|-------|----------|
| **Classification** | `meta/llama-3.3-70b-instruct` | NVIDIA NIM |
| **Embeddings** | `nvidia/nv-embedqa-e5-v5` | NVIDIA NIM |
| **RAG/Chat** | `meta/llama-3.3-70b-instruct` | NVIDIA NIM |

### **API Endpoint**
```
https://integrate.api.nvidia.com/v1
```

### **API Key** (in use)
```
NVIDIA_API_KEY=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
```

This is configured in: `ai-service/.env`

---

## Why the Confusion?

### **1. Comment in `.env` said "Gemini API"**
- Fixed! Now says "NVIDIA NIM API"

### **2. Code comments mention Gemini**
- File: `ai-service/app/services/classifier.py`
- Line 34: Comment says "using Gemini LLM"
- **Reality**: Code uses NVIDIA NIM API (OpenAI-compatible client)

### **3. Fallback in config.py**
```python
nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", os.getenv("GEMINI_API_KEY", ""))
```
This just provides a fallback if `NVIDIA_API_KEY` is not found. You're using `NVIDIA_API_KEY`.

---

## How to Verify

### **1. Check Config File**
```bash
cat ai-service/.env
```

Should show:
```
NVIDIA_API_KEY=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
```

### **2. Check Code**
File: `ai-service/app/config.py`

```python
# NVIDIA NIM API (Meta Llama 3.3 70B)
nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", ...)
nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"

# Model config
llm_model: str = "meta/llama-3.3-70b-instruct"  # NVIDIA NIM
embedding_model: str = "nvidia/nv-embedqa-e5-v5"  # NVIDIA
```

### **3. Test AI Service**
Start AI service:
```bash
cd ai-service
uvicorn app.main:app --reload
```

Then test:
```bash
curl -X POST http://localhost:8000/ai/classify \
  -H "Content-Type: application/json" \
  -d "{
    \"subject\": \"Your order has shipped\",
    \"snippet\": \"Track your package\",
    \"sender_email\": \"noreply@amazon.com\"
  }"
```

If you get a successful response, you're using NVIDIA NIM!

---

## Cost & Limits

### **NVIDIA NIM (Current)**
- **Free Tier**: Yes, available
- **Rate Limits**: Generous for development
- **Models**: 
  - Llama 3.3 70B Instruct (classification, chat)
  - NV-Embed-QA-E5-v5 (embeddings, 1024 dimensions)
- **Docs**: https://build.nvidia.com

### **Gemini (NOT using)**
- You don't need a Gemini API key
- You can remove any Gemini references if you want

---

## Migration History

### **Original Plan**
- Google Gemini API
- `text-embedding-004` (768 dimensions)

### **Changed To**
- NVIDIA NIM API
- Llama 3.3 70B for classification
- NV-Embed-QA-E5-v5 for embeddings (1024 dimensions)

### **Why Changed**
- Better performance
- More reliable API
- OpenAI-compatible interface
- Larger embedding dimensions (1024 vs 768)

---

## What You Need

### ✅ **Required API Keys**
1. **NVIDIA_API_KEY** - ✅ You have this
2. **GOOGLE_CLIENT_ID** - ✅ You have this (for Gmail OAuth)
3. **GOOGLE_CLIENT_SECRET** - ✅ You have this (for Gmail OAuth)

### ❌ **NOT Required**
1. ~~GEMINI_API_KEY~~ - You don't need this
2. ~~GOOGLE_AI_API_KEY~~ - You don't need this

---

## Environment Files

### **Backend `.env`** (root folder)
```bash
# Google OAuth (for Gmail access)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# AI Service URL (backend calls AI service)
AI_SERVICE_URL=http://localhost:8000

# Note: NVIDIA_API_KEY here is just for reference
# The AI service uses its own .env file
NVIDIA_API_KEY=your-nvidia-api-key-here
```

### **AI Service `.env`** (ai-service folder)
```bash
# NVIDIA NIM API Key (THIS IS WHAT MATTERS!)
NVIDIA_API_KEY=your-nvidia-api-key-here

# Database
DATABASE_URL=postgresql://...

# Debug
DEBUG=false
```

---

## Summary

### 🎯 **What You're Using**
- **NVIDIA NIM API**
- **Meta Llama 3.3 70B Instruct** (classification, chat)
- **NVIDIA NV-Embed-QA-E5-v5** (embeddings)
- **1024-dimensional embeddings**

### ❌ **What You're NOT Using**
- ~~Google Gemini API~~
- ~~768-dimensional embeddings~~

### ✅ **Confirmation**
Your project is correctly configured for NVIDIA NIM. The only confusion was:
1. Old comment saying "Gemini API" → Fixed
2. Code comments mentioning Gemini → They're just outdated comments

**The actual API calls go to NVIDIA, not Gemini!** 🎉

---

## If You Want to Switch Back to Gemini

(You probably don't, but here's how if needed)

1. Get a Gemini API key from: https://aistudio.google.com/apikey
2. Update `ai-service/.env`:
   ```bash
   GEMINI_API_KEY=your_key_here
   ```
3. Update `ai-service/app/config.py`:
   ```python
   # Change to Gemini config
   gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
   llm_model: str = "gemini-2.0-flash-exp"
   embedding_model: str = "text-embedding-004"
   embedding_dimension: int = 768
   ```
4. Update service code to use Gemini SDK instead of OpenAI client
5. Run migration to change embeddings table from 1024 → 768 dimensions

**But you don't need to do this! NVIDIA NIM is working great!** 👍
