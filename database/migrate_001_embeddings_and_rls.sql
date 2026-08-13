-- ============================================
-- Migration 001 — embedding dimension + row level security
-- Run this in the Supabase SQL Editor on EXISTING databases only.
-- Fresh installs get all of this from schema.sql already.
-- ============================================

-- --------------------------------------------
-- Part 1: embedding dimension 768 -> 1024
-- --------------------------------------------
-- The original schema declared vector(768) for Gemini embedding-001, but the AI
-- service emits 1024-dim NVIDIA nv-embedqa-e5-v5 vectors. Any database created
-- from the old schema rejects every embedding insert.
--
-- Existing 768-dim vectors cannot be converted — they come from a different
-- model and are meaningless in the new space. They must be dropped and the
-- affected emails re-processed.

-- Discard stale vectors and their chunks, and requeue the emails.
TRUNCATE TABLE embeddings CASCADE;
TRUNCATE TABLE email_chunks CASCADE;
UPDATE emails SET is_processed = false;

ALTER TABLE embeddings DROP COLUMN IF EXISTS embedding;
ALTER TABLE embeddings ADD COLUMN embedding vector(1024) NOT NULL;

DROP INDEX IF EXISTS idx_embeddings_hnsw;
CREATE INDEX idx_embeddings_hnsw ON embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- --------------------------------------------
-- Part 2: row level security
-- --------------------------------------------
-- Defense in depth only. The backend uses the service-role key, which bypasses
-- RLS, so application-level `user_id` filters remain load-bearing. This ensures
-- a leaked anon key or a forgotten filter cannot expose other users' mail.

ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails           ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

ALTER TABLE users            FORCE ROW LEVEL SECURITY;
ALTER TABLE emails           FORCE ROW LEVEL SECURITY;
ALTER TABLE email_chunks     FORCE ROW LEVEL SECURITY;
ALTER TABLE embeddings       FORCE ROW LEVEL SECURITY;
ALTER TABLE subscriptions    FORCE ROW LEVEL SECURITY;
ALTER TABLE job_applications FORCE ROW LEVEL SECURITY;

REVOKE ALL ON users, emails, email_chunks, embeddings, subscriptions, job_applications
  FROM anon, authenticated;

-- --------------------------------------------
-- Part 3: verification
-- --------------------------------------------
-- Expect: vector, 1024
SELECT a.atttypmod AS embedding_dimension
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
WHERE c.relname = 'embeddings' AND a.attname = 'embedding';

-- Expect rowsecurity = true for all six tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users','emails','email_chunks','embeddings','subscriptions','job_applications')
ORDER BY tablename;

-- IMPORTANT: the AI service connects via DATABASE_URL as the `postgres` role,
-- which has BYPASSRLS in Supabase, so it is unaffected. Confirm it can still
-- read and write after running this:
--   SELECT count(*) FROM emails;
