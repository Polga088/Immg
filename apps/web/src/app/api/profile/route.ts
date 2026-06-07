import { getOrCreateProfile, updateProfile } from "@/lib/profile/service";
import { calculateCRS } from "@/lib/crs/calculator";
import { profileToCRSInput } from "@/lib/profile/service";
import { DEMO_USER_ID } from "@/lib/utils";

export async function GET() {
  try {
    const profile = await getOrCreateProfile(DEMO_USER_ID);
    return Response.json({ profile });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const profile = await updateProfile(DEMO_USER_ID, data);
    const crs = calculateCRS(profileToCRSInput(profile));

    await updateProfile(DEMO_USER_ID, { crsScore: crs.total });

    return Response.json({ profile, crs });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
