import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AuthError,
  requireSessionUserId,
  unauthorizedResponse,
} from "@/lib/auth/session";
import { buildGmailAuthUrl, getGoogleOAuthConfig } from "@/lib/jobs/gmail";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const google = getGoogleOAuthConfig();

    if (!google.configured) {
      return NextResponse.json(
        { error: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required" },
        { status: 503 },
      );
    }

    const state = randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("gmail_oauth_state", `${state}:${userId}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    return NextResponse.redirect(buildGmailAuthUrl(state));
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: "OAuth start failed" }, { status: 500 });
  }
}
