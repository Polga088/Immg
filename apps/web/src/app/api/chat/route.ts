import { streamAgentChat, routeIntent } from "@/lib/chat/service";
import { getOrCreateProfile, profileToCRSInput } from "@/lib/profile/service";
import type { AgentId } from "@/lib/ai/config";
import { DEMO_USER_ID } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      messages,
      agentId,
      locale = "fr",
      resumeText,
      jobDescription,
    } = body as {
      messages: Array<{ role: "user" | "assistant"; content: string }>;
      agentId?: AgentId;
      locale?: "fr" | "en";
      resumeText?: string;
      jobDescription?: string;
    };

    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const resolvedAgent =
      agentId && agentId !== "supervisor"
        ? agentId
        : routeIntent(lastUser?.content ?? "");

    const profile = await getOrCreateProfile(DEMO_USER_ID);

    const result = await streamAgentChat({
      agentId: resolvedAgent,
      messages,
      locale,
      profileData: profileToCRSInput(profile),
      resumeContext: resumeText
        ? { text: resumeText, jobDescription }
        : undefined,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: "Chat failed. Ensure Ollama is running." },
      { status: 500 },
    );
  }
}
