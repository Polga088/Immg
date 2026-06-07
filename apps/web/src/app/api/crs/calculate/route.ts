import { calculateCRS } from "@/lib/crs/calculator";
import { getOrCreateProfile, profileToCRSInput } from "@/lib/profile/service";
import { DEMO_USER_ID } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let input = body;

    if (!body.age) {
      const profile = await getOrCreateProfile(DEMO_USER_ID);
      input = profileToCRSInput(profile);
    }

    const breakdown = calculateCRS(input);
    return Response.json({ breakdown });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "CRS calculation failed" }, { status: 500 });
  }
}
