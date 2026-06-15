import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { buildCvJobSuggestions } from "@/lib/jobs/cv-matching";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const suggestions = await buildCvJobSuggestions(userId);
    return Response.json(suggestions);
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return Response.json({ error: "Failed to build suggestions" }, { status: 500 });
  }
}
