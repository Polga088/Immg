import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { searchJobBank } from "@/lib/jobs/job-bank";

export async function POST(req: Request) {
  try {
    await requireSessionUserId();
    const { keywords, location, page } = (await req.json()) as {
      keywords?: string;
      location?: string;
      page?: number;
    };

    if (!keywords?.trim()) {
      return Response.json({ error: "keywords required" }, { status: 400 });
    }

    const data = await searchJobBank(
      keywords.trim(),
      location?.trim() ?? "Canada",
      page ?? 1,
    );

    return Response.json(data);
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error("Job search error:", error);
    return Response.json({ error: "Job Bank search failed" }, { status: 500 });
  }
}
