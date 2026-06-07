CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "RegulationChunk"
  ADD COLUMN IF NOT EXISTS embedding vector(768);

CREATE INDEX IF NOT EXISTS idx_regulation_chunk_embedding
  ON "RegulationChunk"
  USING hnsw (embedding vector_cosine_ops);
