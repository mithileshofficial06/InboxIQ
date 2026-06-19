# InboxIQ — AI-Powered Gmail Analytics Dashboard

> Transform your Gmail inbox into an interactive, insight-rich analytics dashboard with AI-powered classification, natural language search, and intelligent tracking.

## 🏗️ Architecture

```
Frontend (Next.js + Tailwind)  →  Backend API (Express + BullMQ)  →  AI Service (FastAPI)
                                         ↕                              ↕
                                  Redis (Upstash)               PostgreSQL + pgvector (Supabase)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Cloud project with Gmail API enabled
- Supabase account (free tier)
- Upstash Redis account (free tier)
- Gemini API key

### 1. Clone & Install

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install

# AI Service
cd ai-service && pip install -r requirements.txt
```

### 2. Environment Setup

```bash
cp .env.example .env
# Fill in your API keys and credentials
```

### 3. Database Setup

Run `database/schema.sql` in your Supabase SQL Editor.

### 4. Start Services

```bash
# Terminal 1 — Frontend (port 3000)
cd frontend && npm run dev

# Terminal 2 — Backend (port 3001)
cd backend && npm run dev

# Terminal 3 — AI Service (port 8000)
cd ai-service && uvicorn app.main:app --reload --port 8000
```

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, Tailwind CSS v4, Recharts, Framer Motion |
| Backend | Node.js, Express, BullMQ, googleapis |
| AI Service | Python, FastAPI, Gemini API |
| Database | PostgreSQL + pgvector (Supabase) |
| Queue | BullMQ + Redis (Upstash) |
| Auth | Google OAuth 2.0 (read-only) |

## 🔐 Privacy

- Read-only Gmail scope — InboxIQ cannot send, delete, or modify emails
- Raw email body text is not permanently stored — only metadata and embeddings
- All tokens encrypted at rest
- Full data deletion available at any time

## 📄 License

MIT
