import { getRecentChanges } from "@/lib/rag/search";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function GET(req: Request) {
  try {
    await requireSessionUserId();
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days") ?? 30);
    const limit = Number(searchParams.get("limit") ?? 10);

    const changes = await getRecentChanges(days, limit);
    return Response.json({ changes });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "Failed to load changes" }, { status: 500 });
  }
}
