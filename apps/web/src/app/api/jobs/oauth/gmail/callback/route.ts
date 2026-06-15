import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@immg/db";
import { getAppBaseUrl } from "@/lib/app-url";
import {
  exchangeGmailCode,
  fetchGmailAccountEmail,
  getGoogleOAuthConfig,
} from "@/lib/jobs/gmail";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const baseUrl = getAppBaseUrl();

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/fr/jobs?error=oauth`);
  }

  const cookieStore = await cookies();
  const stored = cookieStore.get("gmail_oauth_state")?.value;
  cookieStore.delete("gmail_oauth_state");

  if (!stored) {
    return NextResponse.redirect(`${baseUrl}/fr/jobs?error=oauth_state`);
  }

  const [storedState, userId, locale = "fr"] = stored.split(":");
  const jobsPath = `/${locale === "en" ? "en" : "fr"}/jobs`;

  if (!storedState || storedState !== state || !userId) {
    return NextResponse.redirect(`${baseUrl}${jobsPath}?error=oauth_state`);
  }

  const google = getGoogleOAuthConfig();

  if (!google.configured) {
    return NextResponse.redirect(`${baseUrl}${jobsPath}?error=oauth_config`);
  }

  try {
    const tokens = await exchangeGmailCode(code);
    const accountEmail = await fetchGmailAccountEmail(tokens.access_token);
    const tokenExpiry = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.jobIntegration.upsert({
      where: { userId_provider: { userId, provider: "gmail" } },
      create: {
        userId,
        provider: "gmail",
        accountEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        tokenExpiry,
        connectedAt: new Date(),
        metadata: { scopes: tokens.scope, connectionMethod: "oauth" },
      },
      update: {
        accountEmail,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? undefined,
        tokenExpiry,
        connectedAt: new Date(),
        metadata: { scopes: tokens.scope, connectionMethod: "oauth" },
      },
    });

    return NextResponse.redirect(`${baseUrl}${jobsPath}?gmail=connected`);
  } catch (error) {
    console.error("Gmail OAuth callback failed:", error);
    return NextResponse.redirect(`${baseUrl}${jobsPath}?error=oauth_token`);
  }
}
