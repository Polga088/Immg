import {
  getOrCreateProfile,
  saveProfileWithCRS,
} from "@/lib/profile/service";
import { isProfileComplete, profileCompletionPercent } from "@/lib/profile/completeness";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const profile = await getOrCreateProfile(userId);
    return Response.json({
      profile,
      complete: isProfileComplete(profile),
      completionPercent: profileCompletionPercent(profile),
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await requireSessionUserId();
    const data = await req.json();
    const { profile, crs } = await saveProfileWithCRS(userId, data);
    return Response.json({
      profile,
      crs,
      complete: isProfileComplete(profile),
      completionPercent: profileCompletionPercent(profile),
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    console.error(error);
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
