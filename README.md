# InboxIQ

**AI analytics for your Gmail inbox.** InboxIQ syncs your mail through the Gmail API, classifies every message by category and sentiment, embeds it for semantic search, and lets you ask questions about your inbox in plain language through a retrieval-augmented chat.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_+_pgvector-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/BullMQ_+_Redis-DC382D?logo=redis&logoColor=white)

## What it does

| Feature | Details |
|---|---|
| Gmail sync | Google OAuth sign-in, then a background BullMQ job pulls messages through the Gmail API |
| Categorisation | Nine categories: bills, job applications, orders, OTPs, newsletters, real people, academic, promotions, travel |
| Sentiment | Positive, neutral or negative for every message |
| Semantic search | 1024-dimension embeddings in pgvector, so you can search by meaning, not keywords |
| Inbox chat | RAG over your own mail: "What urgent emails haven't I replied to?" |
| Analytics | Volume over time, top senders, category and sentiment breakdowns, timeline view |

## Architecture

```
Next.js frontend (:3000)
        |
        v
Express API (:3001) ---- BullMQ worker ---- Redis (Upstash)
   |  Google OAuth, JWT sessions             |
   |  encrypted Gmail tokens                 | sync jobs
   v                                         v
FastAPI AI service (:8000) <------- classify + embed each message
   |  Llama 3.3 70B (NVIDIA NIM)
   |  NV-EmbedQA-E5-v5 embeddings
   v
PostgreSQL + pgvector (Supabase, row-level security)
```

1. The user signs in with Google; the backend stores the Gmail refresh token encrypted at rest.
2. A sync job is queued in Redis; a BullMQ worker fetches messages from the Gmail API and writes them to Postgres.
3. The worker calls the AI service, which classifies each message and generates its embedding.
4. Search and chat query pgvector, scoped to the signed-in user, and the chat answers from the retrieved messages.

## Security

- Gmail OAuth tokens are encrypted before storage (`TOKEN_ENCRYPTION_KEY`).
- The AI service only accepts calls carrying a shared service token, so it is not an open LLM proxy.
- Supabase row-level security and user-scoped vector queries keep one user's mail out of another user's results.
- OAuth `state` is validated and user-supplied filters are sanitised before they reach the database.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, TypeScript, BullMQ, googleapis, JWT
- **AI service:** Python, FastAPI, Meta Llama 3.3 70B Instruct and NV-EmbedQA-E5-v5 via NVIDIA NIM
- **Data:** PostgreSQL with pgvector on Supabase, Redis on Upstash

## Getting started

**Prerequisites:** Node.js 18+, Python 3.10+, a Google Cloud project with the Gmail API enabled, a Supabase project, an Upstash Redis database and an NVIDIA NIM API key.

```bash
git clone https://github.com/mithileshofficial06/InboxIQ.git
cd InboxIQ
cp .env.example .env                                # backend
cp ai-service/.env.example ai-service/.env          # AI service
cp frontend/.env.local.example frontend/.env.local  # frontend
```

Fill in the values (Google OAuth client, Supabase keys, Redis host, `JWT_SECRET`, `TOKEN_ENCRYPTION_KEY`, `AI_SERVICE_TOKEN`, `NVIDIA_API_KEY`). The Google OAuth redirect URI is `http://localhost:3001/auth/google/callback`.

Create the database by running `database/schema.sql`, then `database/migrate_001_embeddings_and_rls.sql`, in the Supabase SQL editor.

```bash
npm install                                         # frontend + backend workspaces
cd ai-service && python -m venv venv && venv/Scripts/activate && pip install -r requirements.txt && cd ..

npm run dev       # frontend :3000 and backend :3001
npm run dev:ai    # AI service :8000 (Swagger docs at /docs)
```

On Windows, `start-all.bat` starts all three services.

The first sync fetches up to 200 messages (`MAX_EMAILS_TO_SYNC` in `backend/src/queues/emailSync.worker.ts`).

## Testing

| Part | Command | Covers |
|---|---|---|
| Backend | `cd backend && npm test` | Auth, token encryption, OAuth state, env validation, filter sanitising |
| AI service | `cd ai-service && pip install -r requirements-dev.txt && pytest` | Service-token auth, chunker, classifier, pgvector query scoping |
| Frontend | `cd frontend && npm run lint && npm run build` | Lint and type checks |

GitHub Actions (`.github/workflows/ci.yml`) runs all three on every push and pull request to `main`.

## Project structure

```
frontend/     Next.js app: dashboard, inbox explorer, search, chat
backend/      Express API, Google OAuth, Gmail service, BullMQ sync worker
ai-service/   FastAPI: classification, sentiment, embeddings, RAG
database/     PostgreSQL schema and pgvector / RLS migration
```
