-- Migration: Change embedding dimension from 768 (Gemini) to 1024 (NVIDIA NV-Embed)
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing embeddings (only if you have test data, otherwise skip)
-- TRUNCATE TABLE embeddings CASCADE;

-- Step 2: Drop the old embedding column
ALTER TABLE embeddings DROP COLUMN IF EXISTS embedding;

-- Step 3: Add new embedding column with 1024 dimensions
ALTER TABLE embeddings ADD COLUMN embedding vector(1024);

-- Step 4: Recreate the HNSW index for faster similarity search
DROP INDEX IF EXISTS idx_embeddings_hnsw;
CREATE INDEX idx_embeddings_hnsw ON embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Step 5: Verify the change
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'embeddings' 
AND column_name = 'embedding';

-- Expected output: vector(1024)
