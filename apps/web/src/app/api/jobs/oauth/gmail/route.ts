import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAppBaseUrl, shouldUseSecureCookies } from "@/lib/app-url";
import {
  AuthError,
  getSessionUserId,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { buildGmailAuthUrl, getGoogleOAuthConfig } from "@/lib/jobs/gmail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") === "en" ? "en" : "fr";
  const baseUrl = getAppBaseUrl();

  try {
    const userId = await getSessionUserId();
    if (!userId) {
      const callbackUrl = `/api/jobs/oauth/gmail?locale=${locale}`;
      return NextResponse.redirect(
        `${baseUrl}/${locale}/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
    }

    await requireSessionUserId();
    const google = getGoogleOAuthConfig();

    if (!google.configured) {
      return NextResponse.redirect(`${baseUrl}/${locale}/jobs?error=oauth_config`);
    }

    const state = randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("gmail_oauth_state", `${state}:${userId}:${locale}`, {
      httpOnly: true,
      secure: shouldUseSecureCookies(),
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return NextResponse.redirect(buildGmailAuthUrl(state));
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.redirect(`${baseUrl}/${locale}/jobs?error=oauth_start`);
  }
}
