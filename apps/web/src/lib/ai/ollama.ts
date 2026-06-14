import { createOllama } from "ai-sdk-ollama";
import { aiConfig } from "./config";

export const ollamaProvider = createOllama({
  // Host only — ai-sdk-ollama appends /api/generate itself (do not add /api)
  baseURL: aiConfig.ollamaBaseUrl.replace(/\/$/, ""),
});

export function getChatModel(model = aiConfig.model) {
  return ollamaProvider(model);
}

export function getRouterModel() {
  return ollamaProvider(aiConfig.routerModel);
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${aiConfig.ollamaBaseUrl}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function embedText(text: string): Promise<number[]> {
  const res = await fetch(`${aiConfig.ollamaBaseUrl}/api/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: aiConfig.embedModel,
      prompt: text,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!res.ok) {
    throw new Error(`Embedding failed: ${res.statusText}`);
  }

  const data = (await res.json()) as { embedding: number[] };
  return data.embedding;
}
