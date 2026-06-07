import { generateText, streamText, type LanguageModel } from "ai";
import { aiConfig } from "./config";
import { getChatModel } from "./ollama";

async function getOpenAIModel(): Promise<LanguageModel | null> {
  if (!aiConfig.openaiApiKey) return null;
  try {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const openai = createOpenAI({
      baseURL: aiConfig.openaiBaseUrl,
      apiKey: aiConfig.openaiApiKey,
    });
    return openai(aiConfig.fallbackModel);
  } catch {
    return null;
  }
}

export async function resolveChatModel(): Promise<LanguageModel> {
  if (aiConfig.provider === "openai") {
    const model = await getOpenAIModel();
    if (!model) throw new Error("OPENAI_API_KEY required for openai provider");
    return model;
  }
  return getChatModel();
}

export async function generateWithProvider(options: {
  system: string;
  prompt: string;
  model?: LanguageModel;
}) {
  const model = options.model ?? (await resolveChatModel());

  try {
    return await generateText({
      model,
      system: options.system,
      prompt: options.prompt,
      abortSignal: AbortSignal.timeout(aiConfig.timeoutMs),
    });
  } catch (error) {
    if (aiConfig.provider !== "hybrid") throw error;

    const fallback = await getOpenAIModel();
    if (!fallback) throw error;

    return generateText({
      model: fallback,
      system: options.system,
      prompt: options.prompt,
    });
  }
}

export async function streamWithProvider(options: {
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  model?: LanguageModel;
}) {
  const model = options.model ?? (await resolveChatModel());

  try {
    return streamText({
      model,
      system: options.system,
      messages: options.messages,
      abortSignal: AbortSignal.timeout(aiConfig.timeoutMs),
    });
  } catch (error) {
    if (aiConfig.provider !== "hybrid") throw error;

    const fallback = await getOpenAIModel();
    if (!fallback) throw error;

    return streamText({
      model: fallback,
      system: options.system,
      messages: options.messages,
    });
  }
}
