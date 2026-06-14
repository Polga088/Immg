import { readFileSync, existsSync } from "fs";
import { join } from "path";

function resolvePromptPath(agent: string, version: string): string | null {
  const rel = join(agent, `${version}.md`);
  const candidates = [
    join(process.cwd(), "prompts", rel),
    join(process.cwd(), "src/agents/prompts", rel),
    join(process.cwd(), "apps/web/src/agents/prompts", rel),
  ];
  for (const path of candidates) {
    if (existsSync(path)) return path;
  }
  return null;
}

export function loadPrompt(agent: string, version = "v2"): string {
  try {
    const promptPath = resolvePromptPath(agent, version);
    if (!promptPath) {
      return `You are the ${agent} agent for Canada immigration assistance.`;
    }
    return readFileSync(promptPath, "utf-8").trim();
  } catch {
    return `You are the ${agent} agent for Canada immigration assistance.`;
  }
}
