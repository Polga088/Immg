import { generateAgentChat } from "@/lib/chat/service";
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

    const resolvedAgent =
      agentId && agentId !== "supervisor" ? agentId : undefined;

    const profile = await getOrCreateProfile(userId);

    const text = await generateAgentChat({
      agentId: resolvedAgent,
      userId,
      messages,
      locale,
      profileData: profileToCRSInput(profile),
      resumeContext: resumeText
        ? { text: resumeText.slice(0, 8000), jobDescription }
        : undefined,
    });

    if (!text.trim()) {
      return Response.json({ error: "Empty LLM response" }, { status: 502 });
    }

    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat error:", message, error);
    return Response.json(
      { error: "Chat failed", detail: message },
      { status: 500 },
    );
  }
}
