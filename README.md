# 📧 InboxIQ

**AI-Powered Gmail Analytics Platform**

InboxIQ is a sophisticated email analytics application that provides intelligent insights into your Gmail inbox using advanced AI models. It automatically categorizes emails, performs sentiment analysis, enables semantic search, and provides actionable insights through RAG-based AI assistance.

---

## ✨ Features

### Core Functionality
- 🔐 **Google OAuth Authentication** - Secure login with Gmail integration
- 📊 **Email Analytics Dashboard** - Comprehensive overview of inbox statistics
- 🏷️ **AI-Powered Categorization** - Automatic email classification into 9+ categories
- 😊 **Sentiment Analysis** - Positive, neutral, and negative sentiment detection
- 🔍 **Semantic Search** - Find emails by meaning, not just keywords
- 💬 **RAG-Based AI Chat** - Ask questions about your emails using natural language
- 📅 **Timeline View** - Visualize email patterns over time
- 👥 **Contact Analytics** - Track communication patterns with senders

### Technical Features
- ⚡ **Background Email Sync** - Async queue-based processing with BullMQ
- 🎨 **Modern UI** - Ultra-spacious, magazine-style interface
- 🔄 **Real-time Updates** - Live sync status and progress tracking
- 🔒 **Secure Storage** - PostgreSQL with pgvector for embeddings
- 🚀 **Scalable Architecture** - Microservices-based design

---

## 🏗️ Architecture

InboxIQ consists of three main services:

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                 │
│                    http://localhost:3000                │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                  │
│                    http://localhost:3001                │
│                                                          │
│  • Google OAuth Authentication                          │
│  • Email Sync Queue (BullMQ + Redis)                    │
│  • REST API Endpoints                                   │
│  • JWT Token Management                                 │
└────────┬──────────────────────────────┬─────────────────┘
         │                              │
         ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────┐
│  AI Service (FastAPI)│      │  PostgreSQL + pgvector   │
│  http://localhost:8000│      │       (Supabase)         │
│                       │      │                          │
│  • Email Classification│      │  • Users & Emails       │
│  • Sentiment Analysis  │      │  • Classifications      │
│  • Embeddings (NVIDIA) │      │  • Embeddings (1024D)   │
│  • RAG Pipeline        │      │  • Vector Search        │
└────────┬──────────────┘      └──────────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Redis (Upstash)   │
│   Queue Management  │
└─────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React, TailwindCSS, Lucide Icons
- **State**: React Hooks
- **API Client**: Fetch API with JWT authentication

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Queue**: BullMQ + Redis (Upstash)
- **Auth**: Google OAuth 2.0 + JWT
- **Gmail API**: googleapis package

### AI Service
- **Framework**: FastAPI (Python)
- **LLM**: Meta Llama 3.3 70B Instruct (via NVIDIA NIM)
- **Embeddings**: NVIDIA NV-EmbedQA-E5-v5 (1024 dimensions)
- **Vector DB**: pgvector extension in PostgreSQL

### Database
- **Database**: PostgreSQL (Supabase)
- **Extensions**: pgvector for semantic search
- **Schema**: Users, Emails, Classifications, Embeddings

### Infrastructure
- **Queue**: Redis (Upstash) for background jobs
- **Storage**: Supabase (managed PostgreSQL)
- **AI APIs**: NVIDIA NIM platform

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **Python** 3.9+ and pip
- **Git** for version control
- **Google Cloud Project** with Gmail API enabled
- **Supabase Account** (free tier works)
- **Upstash Account** (free Redis tier works)
- **NVIDIA NIM API Key** (free tier available)

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/InboxIQ.git
cd InboxIQ
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback

# Supabase (from Supabase Dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Redis (from Upstash Console)
REDIS_HOST=your-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Secret (generate a random string)
JWT_SECRET=your-random-secret-string

# NVIDIA NIM API (from NVIDIA platform)
NVIDIA_API_KEY=your_nvidia_api_key

# Service URLs
FRONTEND_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `database/schema.sql`
4. Paste and run the SQL script
5. Verify tables are created in **Database > Tables**

### 4. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**AI Service:**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 5. Start Services

You can start all services with one command:

```bash
# On Windows
start-all.bat

# On macOS/Linux
chmod +x start-all.sh
./start-all.sh
```

Or start each service individually:

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**AI Service:**
```bash
cd ai-service
python -m app.main
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000

---

## 📖 Configuration Guide

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Gmail API**
4. Go to **APIs & Services > Credentials**
5. Create **OAuth 2.0 Client ID**
6. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
7. Copy Client ID and Client Secret to `.env`

### Supabase Setup

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be ready (~2 minutes)
4. Go to **Project Settings > API**
5. Copy **Project URL** and **API Keys** to `.env`
6. Go to **Project Settings > Database**
7. Copy connection string to `.env` (remember to URL-encode password: `@` becomes `%40`)
8. Run `database/schema.sql` in SQL Editor

### Upstash Redis Setup

1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy **Endpoint** (just hostname, not `https://`)
4. Copy **Port** (usually 6379)
5. Copy **Password**
6. Add to `.env`

### NVIDIA NIM Setup

1. Sign up at [build.nvidia.com](https://build.nvidia.com)
2. Navigate to API Catalog
3. Generate API key
4. Add to `.env`

---

## 🎯 Usage

### First Login

1. Open http://localhost:3000
2. Click **"Sign in with Google"**
3. Authorize InboxIQ to access your Gmail
4. Wait for email sync to complete (~1-2 minutes for 200 emails)

### Dashboard

View comprehensive analytics:
- Total emails, categories, sentiment distribution
- Top senders and communication patterns
- Email volume over time
- Unread email count

### Inbox Explorer

- **Grid View**: Magazine-style cards with spacious layout
- **List View**: Compact list with quick scanning
- **Timeline View**: Chronological email patterns

### Search & Filter

- Search by subject, sender, or content
- Filter by category (9+ categories)
- Filter by sentiment (positive, neutral, negative)
- Filter by date range
- Filter by sender email

### AI Chat

Ask questions about your emails:
- "Show me all job applications from last month"
- "What are the urgent emails I haven't replied to?"
- "Summarize emails from [sender]"
- "Find emails about [topic]"

---

## 📁 Project Structure

```
InboxIQ/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   └── lib/           # API client, utilities
│   └── package.json
│
├── backend/               # Express.js backend
│   ├── src/
│   │   ├── config/        # Configuration
│   │   ├── middleware/    # Auth middleware
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Gmail service
│   │   └── queues/        # BullMQ workers
│   └── package.json
│
├── ai-service/            # FastAPI AI service
│   ├── app/
│   │   ├── routes/        # AI endpoints
│   │   ├── services/      # AI logic
│   │   ├── models/        # Pydantic schemas
│   │   └── db/            # pgvector client
│   └── requirements.txt
│
├── database/              # Database schemas
│   └── schema.sql         # PostgreSQL + pgvector
│
├── .env                   # Environment variables
├── .env.example           # Example configuration
├── start-all.bat          # Windows startup script
└── README.md              # This file
```

---

## 🔧 Development

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

**AI Service:**
```bash
cd ai-service
pytest
```

### Environment Variables

See `.env.example` for all available configuration options.

### API Documentation

- **Backend API**: http://localhost:3001/health
- **AI Service API**: http://localhost:8000/docs (Swagger UI)

---

## 📊 Email Sync

### How It Works

1. User logs in with Google OAuth
2. Backend queues email sync job in Redis
3. BullMQ worker processes job asynchronously
4. Fetches emails from Gmail API (200 limit for testing)
5. Stores emails in PostgreSQL
6. Triggers AI service for classification
7. AI service generates embeddings and categories
8. Results stored back in database

### Sync Limits

- **Testing**: 200 emails (configurable in `backend/src/queues/emailSync.worker.ts`)
- **Production**: Increase `MAX_EMAILS_TO_SYNC` as needed

### Monitoring Sync

Watch backend logs:
```
[Sync] Starting email sync for user: <user_id>
[Sync Worker] Processing job: <job_id>
[Sync Worker] Fetched 100 message IDs (total: 100)
[Sync Worker] Stored 95 emails (total processed: 95)
[Sync Worker] ✅ Completed full-sync: 200 emails
```

---

## 🤖 AI Features

### Email Categories

Automatically classified into:
- Bills & Invoices
- Job Applications
- Orders & Deliveries
- OTPs & Notifications
- Newsletters
- Real People
- Academic
- Promotions
- Travel & Bookings

### Sentiment Analysis

Three-level classification:
- **Positive**: Appreciative, friendly, enthusiastic
- **Neutral**: Informational, transactional
- **Negative**: Complaints, urgent issues, problems

### Embeddings

- **Model**: NVIDIA NV-EmbedQA-E5-v5
- **Dimensions**: 1024
- **Use Cases**: Semantic search, similarity matching, RAG

---

## 🐛 Troubleshooting

### Backend won't start

- Check `.env` file has all required variables
- Verify Redis is accessible
- Confirm Supabase database is active

### Database connection errors

- Ensure Supabase project is not paused
- Verify `DATABASE_URL` has correct credentials
- Check password is URL-encoded (`@` → `%40`)

### Redis connection fails

- Confirm Upstash Redis database is active
- Verify `REDIS_HOST` doesn't include `https://`
- Check firewall isn't blocking port 6379

### Email sync not working

- Verify Redis connection is successful
- Check Google OAuth scopes include Gmail API
- Look for errors in backend logs

### AI service errors

- Confirm NVIDIA API key is valid
- Check network connection to NVIDIA NIM
- Verify embeddings table exists in database

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Enable HTTPS for all services
- [ ] Update `FRONTEND_URL` and `GOOGLE_REDIRECT_URI`
- [ ] Increase email sync limit if needed
- [ ] Set up monitoring and logging
- [ ] Configure database backups
- [ ] Review and adjust rate limits

### Recommended Hosting

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, Fly.io
- **AI Service**: Railway, Render (with GPU for better performance)
- **Database**: Supabase (managed PostgreSQL)
- **Redis**: Upstash (serverless Redis)

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📞 Support

For issues and questions:
- **GitHub Issues**: [github.com/yourusername/InboxIQ/issues](https://github.com/yourusername/InboxIQ/issues)
- **Email**: support@inboxiq.com

---

## 🙏 Acknowledgments

- **NVIDIA NIM**: For providing powerful LLM APIs
- **Supabase**: For managed PostgreSQL with pgvector
- **Upstash**: For serverless Redis
- **Next.js Team**: For the amazing React framework
- **Gmail API**: For enabling email access

---

**Built with ❤️ using AI assistance**
