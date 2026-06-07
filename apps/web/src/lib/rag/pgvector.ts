import { prisma } from "@immg/db";
import { EMBEDDING_DIMENSIONS } from "./constants";

let pgvectorReady = false;

export async function ensurePgVectorSchema(): Promise<void> {
  if (pgvectorReady) return;

  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "RegulationChunk"
    ADD COLUMN IF NOT EXISTS embedding vector(${EMBEDDING_DIMENSIONS})
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_regulation_chunk_embedding
    ON "RegulationChunk"
    USING hnsw (embedding vector_cosine_ops)
  `);

  pgvectorReady = true;
}

export async function chunkHasEmbedding(chunkId: string): Promise<boolean> {
  await ensurePgVectorSchema();
  const rows = await prisma.$queryRawUnsafe<Array<{ has: boolean }>>(
    `SELECT (embedding IS NOT NULL) AS has FROM "RegulationChunk" WHERE id = $1`,
    chunkId,
  );
  return rows[0]?.has ?? false;
}

export async function storeChunkEmbedding(chunkId: string, embedding: number[]): Promise<void> {
  await ensurePgVectorSchema();
  const vector = `[${embedding.join(",")}]`;
  await prisma.$executeRawUnsafe(
    `UPDATE "RegulationChunk" SET embedding = $1::vector WHERE id = $2`,
    vector,
    chunkId,
  );
}

export interface VectorSearchResult {
  id: string;
  title: string;
  content: string;
  sourceUrl: string;
  score: number;
}

export async function vectorSearch(
  embedding: number[],
  limit = 5,
): Promise<VectorSearchResult[]> {
  await ensurePgVectorSchema();

  const vector = `[${embedding.join(",")}]`;
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      title: string;
      content: string;
      sourceUrl: string;
      score: number;
    }>
  >(
    `
    SELECT id, title, content, "sourceUrl",
           1 - (embedding <=> $1::vector) AS score
    FROM "RegulationChunk"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    vector,
    limit,
  );

  return rows;
}

export async function countEmbeddedChunks(): Promise<number> {
  await ensurePgVectorSchema();
  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM "RegulationChunk" WHERE embedding IS NOT NULL`,
  );
  return Number(rows[0]?.count ?? 0);
}
