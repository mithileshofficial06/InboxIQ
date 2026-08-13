-- ============================================
-- InboxIQ Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Users table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  picture_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'idle', -- idle, syncing, completed, failed
  last_sync_at TIMESTAMPTZ,
  total_emails_synced INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Emails table
-- ============================================
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gmail_id VARCHAR(255) NOT NULL,
  thread_id VARCHAR(255),
  sender_email VARCHAR(255),
  sender_name VARCHAR(255),
  recipient_emails TEXT[],
  subject TEXT,
  snippet TEXT,
  body_text TEXT, -- Stored temporarily for processing, can be cleared after embedding
  date TIMESTAMPTZ,
  category VARCHAR(100), -- Assigned by AI classifier
  sentiment VARCHAR(50), -- positive, negative, neutral
  sentiment_score REAL,
  is_read BOOLEAN DEFAULT true,
  has_attachments BOOLEAN DEFAULT false,
  label_ids TEXT[],
  raw_size_bytes INTEGER,
  is_processed BOOLEAN DEFAULT false, -- true after chunking + embedding
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, gmail_id)
);

-- ============================================
-- 3. Email Chunks table
-- ============================================
CREATE TABLE IF NOT EXISTS email_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  token_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Embeddings table (pgvector)
-- ============================================
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk_id UUID NOT NULL REFERENCES email_chunks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- 1024 dimensions: NVIDIA nv-embedqa-e5-v5 (see ai-service/app/config.py).
  -- Must match Settings.embedding_dimension exactly or every insert fails.
  embedding vector(1024) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Subscriptions table
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_domain VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  service_name VARCHAR(255),
  category VARCHAR(100), -- SaaS, Food, Finance, Shopping, Travel
  last_email_date TIMESTAMPTZ,
  first_email_date TIMESTAMPTZ,
  email_count INTEGER DEFAULT 0,
  frequency VARCHAR(50), -- daily, weekly, monthly, irregular
  is_dead BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sender_domain)
);

-- ============================================
-- 6. Job Applications table
-- ============================================
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  status VARCHAR(50) DEFAULT 'applied', -- applied, replied, interview, offer, rejected
  applied_date TIMESTAMPTZ,
  last_update_date TIMESTAMPTZ,
  email_ids UUID[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Performance Indexes
-- ============================================

-- Email indexes
CREATE INDEX IF NOT EXISTS idx_emails_user_id ON emails(user_id);
CREATE INDEX IF NOT EXISTS idx_emails_date ON emails(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(user_id, category);
CREATE INDEX IF NOT EXISTS idx_emails_sender ON emails(user_id, sender_email);
CREATE INDEX IF NOT EXISTS idx_emails_gmail_id ON emails(user_id, gmail_id);
CREATE INDEX IF NOT EXISTS idx_emails_thread ON emails(user_id, thread_id);
CREATE INDEX IF NOT EXISTS idx_emails_processed ON emails(user_id, is_processed);

-- Chunk indexes
CREATE INDEX IF NOT EXISTS idx_chunks_email ON email_chunks(email_id);
CREATE INDEX IF NOT EXISTS idx_chunks_user ON email_chunks(user_id);

-- Embedding indexes
CREATE INDEX IF NOT EXISTS idx_embeddings_chunk ON embeddings(chunk_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_user ON embeddings(user_id);

-- HNSW index for fast vector similarity search
CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw ON embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Subscription & Job indexes
CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subs_domain ON subscriptions(user_id, sender_domain);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_applications(user_id, status);

-- ============================================
-- 8. Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subs_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. Row Level Security
-- ============================================
-- Defense in depth. The backend connects with the service-role key, which
-- BYPASSES every policy below — so these do not replace the `.eq('user_id', …)`
-- filters in application code. What they buy us:
--   * a forgotten filter can no longer leak data to any anon/authenticated client
--   * the anon key becomes safe to expose to a browser in future
--   * a leaked non-service credential cannot read the whole table
--
-- Supabase maps the authenticated user to auth.uid(). This project authenticates
-- with its own JWTs rather than Supabase Auth, so there is no auth.uid() to
-- match against for normal clients — the policies below therefore deny all
-- non-service access outright, which is the correct posture today.

ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Force RLS even for the table owner, so only the service role is exempt.
ALTER TABLE users            FORCE ROW LEVEL SECURITY;
ALTER TABLE emails           FORCE ROW LEVEL SECURITY;
ALTER TABLE email_chunks     FORCE ROW LEVEL SECURITY;
ALTER TABLE embeddings       FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    FORCE ROW LEVEL SECURITY;
ALTER TABLE job_applications FORCE ROW LEVEL SECURITY;

-- No permissive policies are defined, so anon and authenticated roles get
-- nothing. Adding Supabase Auth later means adding policies such as:
--   CREATE POLICY emails_owner ON emails
--     FOR SELECT TO authenticated USING (user_id = auth.uid());

REVOKE ALL ON users, emails, email_chunks, embeddings, subscriptions, job_applications
  FROM anon, authenticated;
