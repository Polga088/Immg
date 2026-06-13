import { streamAgentChat } from "@/lib/chat/service";
import { getOrCreateProfile, profileToCRSInput } from "@/lib/profile/service";
import type { AgentId } from "@/lib/ai/config";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
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
      agentId && agentId !== "supervisor" ? agentId : undefined;

    const profile = await getOrCreateProfile(userId);

    const result = await streamAgentChat({
      agentId: resolvedAgent,
      userId,
      messages,
      locale,
      profileData: profileToCRSInput(profile),
      resumeContext: resumeText
        ? { text: resumeText, jobDescription }
        : undefined,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error("Chat error:", error);
    return Response.json(
      { error: "Chat failed. Ensure Ollama is running." },
      { status: 500 },
    );
  }
}
