import type { AgentId } from "@/lib/ai/config";
import { loadPrompt } from "@/agents/prompts/loader";
import { streamWithProvider } from "@/lib/ai/provider";
import { searchRegulations } from "@/lib/rag/search";
import {
  formatSourcesBlock,
  noSourceMessage,
  buildRegulationSystemPrompt,
} from "@/lib/rag/citations";
import { scoreATS } from "@/lib/ats/scorer";
import { calculateCRS, explainCRS, type EducationLevel } from "@/lib/crs/calculator";

export async function buildAgentContext(
  agentId: AgentId,
  userMessage: string,
  locale: "fr" | "en",
  profileData?: Record<string, unknown>,
): Promise<string> {
  let context = "";

  if (agentId === "regulation") {
    const results = await searchRegulations(userMessage);
    if (results.length === 0) {
      context = `STRICT INSTRUCTION: ${noSourceMessage(locale)} Do NOT invent any regulatory information.`;
    } else {
      context = `${buildRegulationSystemPrompt(locale)}\n\n${formatSourcesBlock(results)}`;
    }
  }

  if (agentId === "procedure" && profileData) {
    const age = Number(profileData.age ?? 30);
    const breakdown = calculateCRS({
      age,
      educationLevel: (profileData.educationLevel as EducationLevel) ?? "bachelors",
      firstLanguageClb: Number(profileData.firstLanguageClb ?? 7),
      secondLanguageClb: Number(profileData.secondLanguageClb ?? 0),
      foreignWorkYears: Number(profileData.foreignWorkYears ?? 0),
      canadianWorkYears: Number(profileData.canadianWorkYears ?? 0),
      hasCanadianEducation: Boolean(profileData.hasCanadianEducation),
      hasCanadianJobOffer: Boolean(profileData.hasCanadianJobOffer),
      hasSiblingInCanada: Boolean(profileData.hasSiblingInCanada),
    });
    context = explainCRS(breakdown, locale);
  }

  return context;
}

export async function streamAgentChat(options: {
  agentId: AgentId;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  locale: "fr" | "en";
  profileData?: Record<string, unknown>;
  resumeContext?: { text: string; jobDescription?: string };
}) {
  const { agentId, messages, locale, profileData, resumeContext } = options;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userMessage = lastUser?.content ?? "";

  let extraContext = await buildAgentContext(
    agentId,
    userMessage,
    locale,
    profileData,
  );

  if (agentId === "cv" && resumeContext?.text) {
    const ats = scoreATS(resumeContext.text, resumeContext.jobDescription);
    extraContext += `\n\nATS Score: ${ats.score}/100\nIssues: ${ats.issues.join("; ")}\nSuggestions: ${ats.suggestions.join("; ")}`;
  }

  const system = `${loadPrompt(agentId === "supervisor" ? "supervisor" : agentId)}

Language: respond in ${locale === "fr" ? "French" : "English"}.

${extraContext ? `Context data:\n${extraContext}` : ""}`;

  return streamWithProvider({ system, messages });
}

export function routeIntent(message: string): AgentId {
  const lower = message.toLowerCase();

  if (/crs|express entry|checklist|procedure|immigr|visa|pnp|document|admissib/i.test(lower)) {
    return "procedure";
  }
  if (/cv|resume|ats|curriculum|mot-clé|keyword/i.test(lower)) {
    return "cv";
  }
  if (/emploi|job|lettre|cover letter|candidat|offre|travail/i.test(lower)) {
    return "job";
  }
  if (/ircc|règlement|regulation|loi|law|nouveau|change|bulletin/i.test(lower)) {
    return "regulation";
  }

  return "procedure";
}
