export type AIProvider = "ollama" | "hybrid" | "openai";

export const aiConfig = {
  provider: (process.env.AI_PROVIDER ?? "ollama") as AIProvider,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  model: process.env.OLLAMA_MODEL ?? "qwen2.5:7b",
  embedModel: process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text",
  routerModel: process.env.OLLAMA_ROUTER_MODEL ?? "llama3.2:3b",
  openaiBaseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  fallbackModel: process.env.FALLBACK_MODEL ?? "gpt-4o-mini",
  timeoutMs: Number(process.env.CHAT_TIMEOUT_MS ?? 180_000),
};

export type AgentId = "supervisor" | "regulation" | "cv" | "job" | "procedure";

export const AGENT_IDS = ["regulation", "cv", "job", "procedure"] as const;
