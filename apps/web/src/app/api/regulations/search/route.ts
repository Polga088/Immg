import {
  searchRegulations,
  getRecentChanges,
  ingestIrccCorpus,
} from "@/lib/rag/search";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";
import {
  buildRegulationSystemPrompt,
  ensureCitationsInAnswer,
  formatSourcesBlock,
  noSourceMessage,
} from "@/lib/rag/citations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q) {
    return Response.json({ results: [] });
  }

  const results = await searchRegulations(q);
  return Response.json({ results, searchMode: "semantic" });
}

export async function POST(req: Request) {
  try {
    const { query, locale = "fr" } = (await req.json()) as {
      query?: string;
      locale?: "fr" | "en";
    };

    if (!query?.trim()) {
      return Response.json({ error: "query required" }, { status: 400 });
    }

    const results = await searchRegulations(query);

    if (results.length === 0) {
      return Response.json({
        answer: null,
        sources: [],
        message: noSourceMessage(locale),
      });
    }

    const context = formatSourcesBlock(results);
    const { text } = await generateWithProvider({
      system: `${loadPrompt("regulation")}\n\n${buildRegulationSystemPrompt(locale)}`,
      prompt: `Question: ${query}\n\nOfficial IRCC sources:\n${context}\n\nAnswer with mandatory [Source: URL] citations for every claim.`,
    });

    const answer = ensureCitationsInAnswer(text, results);

    return Response.json({ answer, sources: results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Regulation search failed" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const secret = process.env.INGEST_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const stats = await ingestIrccCorpus({ useLiveFetch: true });
  return Response.json(stats);
}
