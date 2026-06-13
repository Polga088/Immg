import type { AgentId } from "@/lib/ai/config";
import { scoreATS } from "@/lib/ats/scorer";
import { calculateCRS, explainCRS, type EducationLevel } from "@/lib/crs/calculator";
import {
  buildRegulationSystemPrompt,
  formatSourcesBlock,
  noSourceMessage,
} from "@/lib/rag/citations";
import { searchRegulations } from "@/lib/rag/search";
import type { RoutableAgent } from "@/lib/chat/routing";
import { formatUserMemoryBlock, type UserMemory } from "@/lib/chat/user-memory";

export interface ToolContextInput {
  agents: RoutableAgent[];
  userMessage: string;
  locale: "fr" | "en";
  profileData?: Record<string, unknown>;
  memory: UserMemory;
  resumeContext?: { text: string; jobDescription?: string };
}

export async function buildToolContext(input: ToolContextInput): Promise<string> {
  const { agents, userMessage, locale, profileData, memory, resumeContext } = input;
  const blocks: string[] = [
    "=== TOOL OUTPUT (authoritative — do not contradict or recalculate) ===",
    formatUserMemoryBlock(memory),
  ];

  for (const agent of agents) {
    const toolBlock = await runAgentTools(agent, {
      userMessage,
      locale,
      profileData,
      memory,
      resumeContext,
    });
    if (toolBlock) blocks.push(toolBlock);
  }

  return blocks.join("\n\n");
}

async function runAgentTools(
  agent: RoutableAgent,
  ctx: Omit<ToolContextInput, "agents">,
): Promise<string | null> {
  switch (agent) {
    case "regulation":
      return buildRegulationTools(ctx.userMessage, ctx.locale);
    case "procedure":
      return buildProcedureTools(ctx.profileData, ctx.locale);
    case "cv":
      return buildCvTools(ctx.resumeContext, ctx.memory);
    case "job":
      return buildJobTools(ctx.memory, ctx.locale);
    default:
      return null;
  }
}

async function buildRegulationTools(
  userMessage: string,
  locale: "fr" | "en",
): Promise<string> {
  const results = await searchRegulations(userMessage);
  const header = "=== TOOL: searchRegulations ===";

  if (results.length === 0) {
    return `${header}\n${noSourceMessage(locale)}\nSTRICT: Do NOT invent regulatory facts. Refuse substantive answer.`;
  }

  return `${header}\n${buildRegulationSystemPrompt(locale)}\n\n${formatSourcesBlock(results)}`;
}

function buildProcedureTools(
  profileData: Record<string, unknown> | undefined,
  locale: "fr" | "en",
): string | null {
  if (!profileData) {
    return locale === "fr"
      ? "=== TOOL: calculateCRS ===\nProfil incomplet — demander à l'utilisateur de compléter son profil."
      : "=== TOOL: calculateCRS ===\nProfile incomplete — ask user to complete profile.";
  }

  const breakdown = calculateCRS({
    age: Number(profileData.age ?? 30),
    educationLevel: (profileData.educationLevel as EducationLevel) ?? "bachelors",
    firstLanguageClb: Number(profileData.firstLanguageClb ?? 7),
    secondLanguageClb: Number(profileData.secondLanguageClb ?? 0),
    foreignWorkYears: Number(profileData.foreignWorkYears ?? 0),
    canadianWorkYears: Number(profileData.canadianWorkYears ?? 0),
    hasCanadianEducation: Boolean(profileData.hasCanadianEducation),
    hasCanadianJobOffer: Boolean(profileData.hasCanadianJobOffer),
    hasSiblingInCanada: Boolean(profileData.hasSiblingInCanada),
  });

  return `=== TOOL: calculateCRS ===\n${explainCRS(breakdown, locale)}`;
}

function buildCvTools(
  resumeContext: { text: string; jobDescription?: string } | undefined,
  memory: UserMemory,
): string | null {
  const text = resumeContext?.text ?? memory.latestCv?.excerpt;
  if (!text?.trim()) {
    return "=== TOOL: scoreATS ===\nNo resume text available. Ask user to upload or paste CV.";
  }

  const ats = scoreATS(text, resumeContext?.jobDescription);
  return `=== TOOL: scoreATS ===
Score: ${ats.score}/100
Sections detected: ${JSON.stringify(ats.sections)}
Issues: ${ats.issues.join("; ") || "none"}
Suggestions: ${ats.suggestions.join("; ")}
Keyword matches: ${ats.keywordMatches.slice(0, 10).join(", ") || "none"}
Keyword gaps: ${ats.keywordMisses.slice(0, 5).join(", ") || "none"}`;
}

function buildJobTools(memory: UserMemory, locale: "fr" | "en"): string | null {
  if (!memory.applicationsSummary) {
    return locale === "fr"
      ? "=== TOOL: listApplications ===\nAucune candidature enregistrée."
      : "=== TOOL: listApplications ===\nNo applications on file.";
  }
  return `=== TOOL: listApplications ===\n${memory.applicationsSummary}`;
}

export function resolvePromptAgent(
  explicitAgent: AgentId | undefined,
  resolvedAgents: RoutableAgent[],
): AgentId {
  if (explicitAgent && explicitAgent !== "supervisor") {
    return explicitAgent;
  }
  if (resolvedAgents.length > 1) {
    return "supervisor";
  }
  return resolvedAgents[0] ?? "procedure";
}
