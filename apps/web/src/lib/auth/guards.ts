import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrCreateProfile } from "@/lib/profile/service";
import { isProfileComplete } from "@/lib/profile/completeness";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

export async function requireCompleteProfile(userId: string) {
  const profile = await getOrCreateProfile(userId);
  if (!isProfileComplete(profile)) {
    redirect("/profile?incomplete=1");
  }
  return profile;
}

export async function requireAuthWithProfile() {
  const user = await requireAuth();
  const profile = await requireCompleteProfile(user.id);
  return { user, profile };
}
