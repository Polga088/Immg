import { prisma } from "@immg/db";
import { embedText } from "@/lib/ai/ollama";
import { MIN_SIMILARITY_SCORE } from "./constants";
import { countEmbeddedChunks, vectorSearch } from "./pgvector";
import { ingestIrccCorpus } from "./ingest";

export interface RegulationSearchResult {
  title: string;
  content: string;
  sourceUrl: string;
  score: number;
}

async function keywordSearch(
  query: string,
  limit: number,
): Promise<RegulationSearchResult[]> {
  const chunks = await prisma.regulationChunk.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);

  const scored = chunks.map((chunk) => {
    const text = `${chunk.title} ${chunk.content}`.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (text.includes(word)) score += 1;
    }
    return { ...chunk, score: score / Math.max(queryWords.length, 1) };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((c) => ({
      title: c.title,
      content: c.content,
      sourceUrl: c.sourceUrl,
      score: c.score,
    }));
}

async function semanticSearch(
  query: string,
  limit: number,
): Promise<RegulationSearchResult[]> {
  const embedding = await embedText(query);
  const results = await vectorSearch(embedding, limit);

  return results
    .filter((r) => r.score >= MIN_SIMILARITY_SCORE)
    .map((r) => ({
      title: r.title,
      content: r.content,
      sourceUrl: r.sourceUrl,
      score: r.score,
    }));
}

export async function searchRegulations(
  query: string,
  limit = 5,
): Promise<RegulationSearchResult[]> {
  const totalChunks = await prisma.regulationChunk.count();

  if (totalChunks === 0) {
    await ingestIrccCorpus({ useLiveFetch: true });
    return searchRegulations(query, limit);
  }

  const embeddedCount = await countEmbeddedChunks();

  if (embeddedCount > 0) {
    try {
      const semantic = await semanticSearch(query, limit);
      if (semantic.length > 0) return semantic;
    } catch (error) {
      console.warn("Semantic search failed, falling back to keywords:", error);
    }
  }

  return keywordSearch(query, limit);
}

export async function getRecentChanges(days = 30, limit = 10) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.regulationChange.findMany({
    where: { detectedAt: { gte: since } },
    orderBy: { detectedAt: "desc" },
    take: limit,
  });
}

/** @deprecated Use ingestIrccCorpus from ./ingest */
export { ingestIrccCorpus as ingestRegulationSources } from "./ingest";

export { ingestIrccCorpus } from "./ingest";
