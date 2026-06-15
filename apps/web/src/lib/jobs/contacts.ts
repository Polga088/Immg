import { prisma } from "@immg/db";

const IGNORED_EMAIL_DOMAINS = [
  "example.com",
  "jobbank.gc.ca",
  "indeed.com",
  "linkedin.com",
  "google.com",
  "gmail.com",
];

export function extractEmailsFromText(text: string): string[] {
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) ?? [];
  return [
    ...new Set(
      matches.filter((email) => {
        const domain = email.split("@")[1]?.toLowerCase() ?? "";
        return !IGNORED_EMAIL_DOMAINS.some((d) => domain.endsWith(d));
      }),
    ),
  ];
}

export function parseEmailFromHeader(from: string): { email: string; name: string | null } {
  const bracket = from.match(/<([^>]+)>/);
  if (bracket) {
    const name = from.replace(/<[^>]+>/, "").replace(/"/g, "").trim() || null;
    return { email: bracket[1], name };
  }
  if (from.includes("@")) {
    return { email: from.trim(), name: null };
  }
  return { email: "", name: null };
}

export async function autoRegisterContact(
  userId: string,
  data: {
    email: string;
    name?: string | null;
    company?: string | null;
    title?: string | null;
    source: string;
    applicationId?: string;
    notes?: string;
  },
): Promise<void> {
  const email = data.email.toLowerCase().trim();
  if (!email || !email.includes("@")) return;

  const domain = email.split("@")[1] ?? "";
  if (IGNORED_EMAIL_DOMAINS.some((d) => domain.endsWith(d))) return;

  const existing = await prisma.recruiterContact.findFirst({
    where: { userId, email },
  });

  if (existing) {
    await prisma.recruiterContact.update({
      where: { id: existing.id },
      data: {
        company: data.company ?? existing.company,
        title: data.title ?? existing.title,
        name: data.name ?? existing.name,
        applicationId: data.applicationId ?? existing.applicationId,
        source: data.source,
      },
    });
    return;
  }

  await prisma.recruiterContact.create({
    data: {
      userId,
      email,
      name: data.name ?? null,
      company: data.company ?? null,
      title: data.title ?? null,
      source: data.source,
      applicationId: data.applicationId ?? null,
      notes: data.notes ?? null,
    },
  });
}

export async function autoRegisterContactsFromText(
  userId: string,
  text: string,
  context: {
    company?: string;
    title?: string;
    source: string;
    applicationId?: string;
  },
): Promise<number> {
  const emails = extractEmailsFromText(text);
  for (const email of emails) {
    await autoRegisterContact(userId, { email, ...context });
  }
  return emails.length;
}
