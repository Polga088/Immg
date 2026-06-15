import { ImapFlow } from "imapflow";
import type { GmailJobAlert } from "./gmail";
import { normalizeAppPassword } from "./gmail-crypto";

const JOB_ALERT_DOMAINS = [
  "indeed.com",
  "linkedin.com",
  "jobbank.gc.ca",
  "glassdoor.com",
  "monster.com",
];

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

function isJobAlertFrom(fromAddress: string): boolean {
  const lower = fromAddress.toLowerCase();
  return JOB_ALERT_DOMAINS.some((domain) => lower.includes(domain));
}

function formatFromAddress(from: { name?: string; address?: string } | undefined): string {
  if (!from?.address) return "";
  if (from.name) return `${from.name} <${from.address}>`;
  return from.address;
}

export async function withGmailImap<T>(
  email: string,
  appPassword: string,
  fn: (client: ImapFlow) => Promise<T>,
): Promise<T> {
  const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
      user: email.toLowerCase().trim(),
      pass: normalizeAppPassword(appPassword),
    },
    logger: false,
  });

  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout();
  }
}

export async function verifyGmailAppPassword(email: string, appPassword: string): Promise<void> {
  await withGmailImap(email, appPassword, async (client) => {
    await client.mailboxOpen("INBOX");
  });
}

export async function fetchGmailJobAlertsImap(
  email: string,
  appPassword: string,
): Promise<GmailJobAlert[]> {
  return withGmailImap(email, appPassword, async (client) => {
    await client.mailboxOpen("INBOX");

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const uids = await client.search({ since }, { uid: true });
    if (!uids || uids.length === 0) return [];

    const recentUids = uids.slice(-80);
    const alerts: GmailJobAlert[] = [];

    for await (const message of client.fetch(recentUids, {
      uid: true,
      envelope: true,
      source: { maxLength: 12_000, start: 0 },
    })) {
      const fromAddr = message.envelope?.from?.[0]?.address ?? "";
      if (!isJobAlertFrom(fromAddr)) continue;

      const subject = message.envelope?.subject ?? "";
      const from = formatFromAddress(message.envelope?.from?.[0]);
      const sourceText = message.source?.toString("utf8") ?? "";
      const snippet = sourceText.replace(/\s+/g, " ").slice(0, 400);
      const combined = `${subject} ${snippet}`;
      const jobUrl = extractJobUrl(combined);
      const { title, company } = parseAlertFields(subject, snippet);

      alerts.push({
        messageId: String(message.uid ?? message.seq),
        subject,
        from,
        snippet,
        receivedAt: message.envelope?.date
          ? message.envelope.date.toISOString()
          : new Date().toISOString(),
        jobUrl,
        company,
        title,
      });
    }

    return alerts.sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
  });
}

export async function createGmailDraftImap(
  email: string,
  appPassword: string,
  options: { to: string; subject: string; body: string },
): Promise<string> {
  return withGmailImap(email, appPassword, async (client) => {
    const subjectEncoded = `=?UTF-8?B?${Buffer.from(options.subject, "utf8").toString("base64")}?=`;
    const raw = [
      `From: ${email}`,
      `To: ${options.to}`,
      `Subject: ${subjectEncoded}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      options.body,
    ].join("\r\n");

    const result = await client.append("[Gmail]/Drafts", raw, ["\\Draft"]);
    const uid = result && typeof result === "object" && "uid" in result ? result.uid : Date.now();
    return `imap-draft-${uid}`;
  });
}
