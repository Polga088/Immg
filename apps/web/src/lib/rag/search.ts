import { prisma } from "@immg/db";
import { embedText } from "@/lib/ai/ollama";

export interface RegulationSource {
  url: string;
  title: string;
  content: string;
  publishedAt?: Date;
}

export const IRCC_SEED_SOURCES: RegulationSource[] = [
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/aide-famille/entree-express/verifier-note.html",
    title: "Entrée express — Comprehensive Ranking System",
    content:
      "Le système de classement global (CRS) évalue les candidats selon l'âge, l'éducation, l'expérience de travail, les compétences linguistiques et d'autres facteurs. Les candidats avec les scores les plus élevés reçoivent une invitation à présenter une demande.",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/aide-famille/entree-express/qui-est-admissible.html",
    title: "Entrée express — Admissibilité",
    content:
      "Pour être admissible à Entrée express, vous devez être admissible à au moins un des programmes : Travailleurs qualifiés (fédéral), Catégorie de l'expérience canadienne, ou Travailleurs de métiers qualifiés (fédéral).",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada/permis.html",
    title: "Permis de travail",
    content:
      "La plupart des étrangers ont besoin d'un permis de travail pour travailler au Canada. Il existe des permis ouverts et des permis fermés liés à un employeur spécifique.",
  },
  {
    url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/programmes-nomination-provinciale.html",
    title: "Programmes des candidats des provinces",
    content:
      "Les PNP permettent aux provinces et territoires de nominer des personnes qui souhaitent immigrer au Canada et s'établir dans une province particulière.",
  },
];

export async function ingestRegulationSources(
  sources: RegulationSource[] = IRCC_SEED_SOURCES,
): Promise<number> {
  let count = 0;

  for (const source of sources) {
    const existing = await prisma.regulationChunk.findFirst({
      where: { sourceUrl: source.url },
    });

    if (existing) continue;

    await prisma.regulationChunk.create({
      data: {
        sourceUrl: source.url,
        title: source.title,
        content: source.content,
        publishedAt: source.publishedAt ?? new Date(),
      },
    });

    try {
      await embedText(`${source.title}\n${source.content}`);
    } catch {
      // Embedding optional if Ollama down during ingest
    }

    count++;
  }

  return count;
}

export async function searchRegulations(
  query: string,
  limit = 5,
): Promise<Array<{ title: string; content: string; sourceUrl: string; score: number }>> {
  const chunks = await prisma.regulationChunk.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  if (chunks.length === 0) {
    await ingestRegulationSources();
    return searchRegulations(query, limit);
  }

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 3);

  interface ChunkRow {
    title: string;
    content: string;
    sourceUrl: string;
  }

  type ScoredChunk = ChunkRow & { score: number };

  const scored: ScoredChunk[] = chunks.map((chunk: ChunkRow) => {
    const text = `${chunk.title} ${chunk.content}`.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (text.includes(word)) score += 1;
    }
    return { ...chunk, score };
  });

  return scored
    .filter((c: ScoredChunk) => c.score > 0)
    .sort((a: ScoredChunk, b: ScoredChunk) => b.score - a.score)
    .slice(0, limit)
    .map((c) => ({
      title: c.title,
      content: c.content,
      sourceUrl: c.sourceUrl,
      score: c.score,
    }));
}

export async function getRecentChanges(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  return prisma.regulationChunk.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}
