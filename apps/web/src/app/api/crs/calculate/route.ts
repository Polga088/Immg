import { calculateCRS } from "@/lib/crs/calculator";
import { getOrCreateProfile, profileToCRSInput } from "@/lib/profile/service";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await req.json().catch(() => ({}));
    let input = body;

    if (!body.age) {
      const profile = await getOrCreateProfile(userId);
      input = profileToCRSInput(profile);
    }

    const breakdown = calculateCRS(input);
    return Response.json({ breakdown });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "CRS calculation failed" }, { status: 500 });
  }
}
