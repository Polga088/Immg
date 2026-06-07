import { readFileSync } from "fs";
import { join } from "path";

export function loadPrompt(agent: string, version = "v1"): string {
  try {
    const promptPath = join(
      process.cwd(),
      "src/agents/prompts",
      agent,
      `${version}.md`,
    );
    return readFileSync(promptPath, "utf-8").trim();
  } catch {
    return `You are the ${agent} agent for Canada immigration assistance.`;
  }
}
