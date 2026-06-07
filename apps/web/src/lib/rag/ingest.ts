import { prisma } from "@immg/db";
import { embedText } from "@/lib/ai/ollama";
import { chunkText, hashContent } from "./chunker";
import {
  fetchAllIrccSources,
  IRCC_SEED_FALLBACK,
  IRCC_SOURCES,
  type FetchedPage,
} from "./fetch-ircc";
import { ensurePgVectorSchema, storeChunkEmbedding, chunkHasEmbedding } from "./pgvector";

export interface IngestStats {
  pagesFetched: number;
  chunksCreated: number;
  chunksUpdated: number;
  embeddingsStored: number;
  changesDetected: number;
  errors: string[];
}

async function upsertPageChunks(page: FetchedPage, stats: IngestStats): Promise<void> {
  const chunks = chunkText(page.content);
  if (chunks.length === 0) return;

  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i];
    const contentHash = hashContent(content);

    const existing = await prisma.regulationChunk.findUnique({
      where: { sourceUrl_chunkIndex: { sourceUrl: page.url, chunkIndex: i } },
    });

    if (existing && existing.contentHash === contentHash) {
      const hasEmbedding = await chunkHasEmbedding(existing.id);
      if (hasEmbedding) continue;

      try {
        const embedding = await embedText(`${page.title}\n${content}`);
        await storeChunkEmbedding(existing.id, embedding);
        stats.embeddingsStored++;
      } catch (error) {
        stats.errors.push(`Embed failed ${page.url}#${i}: ${String(error)}`);
      }
      continue;
    }

    const isNew = !existing;
    const changeType = isNew ? "new" : "updated";

    const chunk = await prisma.regulationChunk.upsert({
      where: { sourceUrl_chunkIndex: { sourceUrl: page.url, chunkIndex: i } },
      update: {
        title: page.title,
        content,
        contentHash,
        publishedAt: page.fetchedAt,
      },
      create: {
        sourceUrl: page.url,
        title: page.title,
        content,
        contentHash,
        chunkIndex: i,
        publishedAt: page.fetchedAt,
      },
    });

    if (isNew) stats.chunksCreated++;
    else stats.chunksUpdated++;

    if (isNew || existing?.contentHash !== contentHash) {
      await prisma.regulationChange.create({
        data: {
          sourceUrl: page.url,
          title: page.title,
          changeType,
          summary: content.slice(0, 280),
        },
      });
      stats.changesDetected++;
    }

    try {
      const embedding = await embedText(`${page.title}\n${content}`);
      await storeChunkEmbedding(chunk.id, embedding);
      stats.embeddingsStored++;
    } catch (error) {
      stats.errors.push(`Embed failed ${page.url}#${i}: ${String(error)}`);
    }
  }

  await prisma.regulationChunk.deleteMany({
    where: {
      sourceUrl: page.url,
      chunkIndex: { gte: chunks.length },
    },
  });
}

async function ingestFallbackSeeds(stats: IngestStats): Promise<void> {
  for (const seed of IRCC_SEED_FALLBACK) {
    await upsertPageChunks(
      {
        url: seed.url,
        title: seed.title,
        content: seed.content,
        fetchedAt: new Date(),
      },
      stats,
    );
  }
}

export async function ingestIrccCorpus(options?: {
  useLiveFetch?: boolean;
}): Promise<IngestStats> {
  await ensurePgVectorSchema();

  const stats: IngestStats = {
    pagesFetched: 0,
    chunksCreated: 0,
    chunksUpdated: 0,
    embeddingsStored: 0,
    changesDetected: 0,
    errors: [],
  };

  const useLiveFetch = options?.useLiveFetch ?? process.env.IRCC_LIVE_FETCH !== "false";

  if (useLiveFetch) {
    const pages = await fetchAllIrccSources(IRCC_SOURCES);
    stats.pagesFetched = pages.length;

    if (pages.length === 0) {
      stats.errors.push("Live fetch returned 0 pages — using seed fallback");
      await ingestFallbackSeeds(stats);
    } else {
      for (const page of pages) {
        try {
          await upsertPageChunks(page, stats);
        } catch (error) {
          stats.errors.push(`Ingest failed ${page.url}: ${String(error)}`);
        }
      }
    }
  } else {
    await ingestFallbackSeeds(stats);
  }

  return stats;
}

export async function reembedMissingChunks(): Promise<number> {
  await ensurePgVectorSchema();

  const embedded = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT id FROM "RegulationChunk" WHERE embedding IS NULL LIMIT 50`,
  );

  let count = 0;
  for (const row of embedded) {
    const chunk = await prisma.regulationChunk.findUnique({ where: { id: row.id } });
    if (!chunk) continue;
    try {
      const embedding = await embedText(`${chunk.title}\n${chunk.content}`);
      await storeChunkEmbedding(chunk.id, embedding);
      count++;
    } catch {
      // skip
    }
  }
  return count;
}
