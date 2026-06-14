import type { AgentId } from "@/lib/ai/config";
import { loadPrompt } from "@/agents/prompts/loader";
import { generateChatWithProvider } from "@/lib/ai/provider";
import { buildToolContext, resolvePromptAgent } from "@/lib/chat/agent-kernel";
import { resolveAgents, describeAgentRoles, type RoutableAgent } from "@/lib/chat/routing";
import { fetchUserMemory } from "@/lib/chat/user-memory";

export { routeIntent, resolveAgents } from "@/lib/chat/routing";

export async function generateAgentChat(options: {
  agentId?: AgentId;
  userId: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  locale: "fr" | "en";
  profileData?: Record<string, unknown>;
  resumeContext?: { text: string; jobDescription?: string };
}): Promise<string> {
  const { agentId, userId, messages, locale, profileData, resumeContext } = options;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const userMessage = lastUser?.content ?? "";

  const explicitAgent =
    agentId && agentId !== "supervisor" ? (agentId as RoutableAgent) : undefined;
  const resolvedAgents: RoutableAgent[] = explicitAgent
    ? [explicitAgent]
    : resolveAgents(userMessage);

  const memory = await fetchUserMemory(userId, locale);

  const toolContext = await buildToolContext({
    agents: resolvedAgents,
    userMessage,
    locale,
    profileData,
    memory,
    resumeContext,
  });

  const promptAgent = resolvePromptAgent(agentId, resolvedAgents);
  const multiAgentNote =
    resolvedAgents.length > 1
      ? locale === "fr"
        ? `\nCoordination multi-agents requise: ${describeAgentRoles(resolvedAgents, locale)}.`
        : `\nMulti-agent coordination required: ${describeAgentRoles(resolvedAgents, locale)}.`
      : "";

  const system = `${loadPrompt(promptAgent)}

Respond in ${locale === "fr" ? "French" : "English"}.
${multiAgentNote}

${toolContext}`;

  return generateChatWithProvider({ system, messages });
}
