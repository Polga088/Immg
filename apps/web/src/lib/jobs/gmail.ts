import { prisma } from "@immg/db";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export function getGoogleOAuthConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")}/api/jobs/oauth/gmail/callback`;

  return { clientId, clientSecret, redirectUri, configured: Boolean(clientId && clientSecret) };
}

export function buildGmailAuthUrl(state: string): string {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGmailCode(code: string) {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Gmail token exchange failed: ${res.status}`);
  }

  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
  };
}

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const { clientId, clientSecret } = getGoogleOAuthConfig();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) throw new Error("Gmail token refresh failed");
  return res.json();
}

export async function getValidGmailAccessToken(userId: string): Promise<string | null> {
  const integration = await prisma.jobIntegration.findUnique({
    where: { userId_provider: { userId, provider: "gmail" } },
  });

  if (!integration?.accessToken) return null;

  const expiry = integration.tokenExpiry?.getTime() ?? 0;
  if (expiry > Date.now() + 60_000) {
    return integration.accessToken;
  }

  if (!integration.refreshToken) return integration.accessToken;

  const refreshed = await refreshAccessToken(integration.refreshToken);
  const tokenExpiry = new Date(Date.now() + refreshed.expires_in * 1000);

  await prisma.jobIntegration.update({
    where: { id: integration.id },
    data: { accessToken: refreshed.access_token, tokenExpiry },
  });

  return refreshed.access_token;
}

export async function fetchGmailAccountEmail(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Google account email");
  const data = (await res.json()) as { email?: string };
  return data.email ?? "";
}

export interface GmailJobAlert {
  messageId: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string;
  jobUrl: string | null;
  company: string | null;
  title: string | null;
}

const JOB_ALERT_QUERY =
  'from:(indeed.com OR linkedin.com OR jobbank.gc.ca OR "recrutement" OR "hiring" OR "careers") newer_than:30d';

function extractJobUrl(text: string): string | null {
  const match = text.match(
    /https?:\/\/(?:www\.)?(?:indeed\.com|jobbank\.gc\.ca|linkedin\.com)[^\s"'<>]+/i,
  );
  return match?.[0] ?? null;
}

function parseAlertFields(subject: string, snippet: string): {
  title: string | null;
  company: string | null;
} {
  const indeedMatch = subject.match(/^(.+?)\s+-\s+(.+?)\s+-\s+Indeed/i);
  if (indeedMatch) {
    return { title: indeedMatch[1].trim(), company: indeedMatch[2].trim() };
  }
  const linkedinMatch = subject.match(/^(.+?)\s+at\s+(.+?)(?:\s+[-|]|$)/i);
  if (linkedinMatch) {
    return { title: linkedinMatch[1].trim(), company: linkedinMatch[2].trim() };
  }
  return { title: subject.slice(0, 120), company: null };
}

export async function fetchGmailJobAlerts(userId: string): Promise<GmailJobAlert[]> {
  const accessToken = await getValidGmailAccessToken(userId);
  if (!accessToken) return [];

  const params = new URLSearchParams({
    q: JOB_ALERT_QUERY,
    maxResults: "20",
  });

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!listRes.ok) throw new Error(`Gmail list failed: ${listRes.status}`);

  const list = (await listRes.json()) as { messages?: Array<{ id: string }> };
  const alerts: GmailJobAlert[] = [];

  for (const msg of list.messages ?? []) {
    const detailRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    if (!detailRes.ok) continue;

    const detail = (await detailRes.json()) as {
      snippet?: string;
      internalDate?: string;
      payload?: { headers?: Array<{ name: string; value: string }> };
    };

    const headers = detail.payload?.headers ?? [];
    const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
    const from = headers.find((h) => h.name === "From")?.value ?? "";
    const snippet = detail.snippet ?? "";
    const combined = `${subject} ${snippet}`;
    const jobUrl = extractJobUrl(combined);
    const { title, company } = parseAlertFields(subject, snippet);

    alerts.push({
      messageId: msg.id,
      subject,
      from,
      snippet,
      receivedAt: detail.internalDate
        ? new Date(Number(detail.internalDate)).toISOString()
        : new Date().toISOString(),
      jobUrl,
      company,
      title,
    });
  }

  return alerts;
}

export async function createGmailDraft(
  userId: string,
  options: {
    to: string;
    subject: string;
    body: string;
  },
): Promise<string> {
  const accessToken = await getValidGmailAccessToken(userId);
  if (!accessToken) throw new Error("Gmail not connected");

  const raw = Buffer.from(
    [
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      options.body,
    ].join("\r\n"),
  )
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: { raw } }),
  });

  if (!res.ok) throw new Error(`Gmail draft failed: ${res.status}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}
