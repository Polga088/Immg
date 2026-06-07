import { searchRegulations, ingestRegulationSources } from "@/lib/rag/search";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q) {
    return Response.json({ results: [] });
  }

  const results = await searchRegulations(q);
  return Response.json({ results });
}

export async function POST(req: Request) {
  try {
    const { query, locale = "fr" } = await req.json();

    if (!query) {
      return Response.json({ error: "query required" }, { status: 400 });
    }

    const results = await searchRegulations(query);

    if (results.length === 0) {
      return Response.json({
        answer: null,
        sources: [],
        message:
          locale === "fr"
            ? "Aucune source trouvée — réponse non fournie."
            : "No sources found — no answer provided.",
      });
    }

    const context = results
      .map((r) => `[Source: ${r.sourceUrl}]\n${r.title}\n${r.content}`)
      .join("\n\n");

    const { text } = await generateWithProvider({
      system: loadPrompt("regulation"),
      prompt: `Question: ${query}\n\nSources:\n${context}\n\nAnswer with citations.`,
    });

    return Response.json({ answer: text, sources: results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Regulation search failed" }, { status: 500 });
  }
}

export async function PUT() {
  const count = await ingestRegulationSources();
  return Response.json({ ingested: count });
}
