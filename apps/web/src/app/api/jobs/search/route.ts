import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { getUserCvText, rankListingsByCv } from "@/lib/jobs/cv-matching";
import { searchJobBank } from "@/lib/jobs/job-bank";

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const { keywords, location, page, rankByCv } = (await req.json()) as {
      keywords?: string;
      location?: string;
      page?: number;
      rankByCv?: boolean;
    };

    if (!keywords?.trim()) {
      return Response.json({ error: "keywords required" }, { status: 400 });
    }

    const data = await searchJobBank(
      keywords.trim(),
      location?.trim() ?? "Canada",
      page ?? 1,
    );

    if (rankByCv) {
      const cv = await getUserCvText(userId);
      if (cv) {
        const ranked = rankListingsByCv(data.results, cv.text);
        return Response.json({
          results: ranked,
          total: data.total,
          rankedByCv: true,
        });
      }
    }

    return Response.json({ ...data, rankedByCv: false });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error("Job search error:", error);
    return Response.json({ error: "Job Bank search failed" }, { status: 500 });
  }
}
