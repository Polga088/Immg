import { prisma } from "@immg/db";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";
import { fetchUserMemory } from "@/lib/chat/user-memory";
import { isValidApplicationStatus } from "./constants";
import { fetchJobBankPostingDetails, type JobBankListing } from "./job-bank";
import type { JobSource } from "./sources";
import {
  autoRegisterContact,
  autoRegisterContactsFromText,
  parseEmailFromHeader,
} from "./contacts";

export async function listApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listRecruiterContacts(userId: string) {
  return prisma.recruiterContact.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function listJobIntegrations(userId: string) {
  return prisma.jobIntegration.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      accountEmail: true,
      connectedAt: true,
      metadata: true,
    },
  });
}

export async function createApplication(
  userId: string,
  data: {
    company: string;
    title: string;
    jobUrl?: string;
    source?: JobSource;
    externalJobId?: string;
    location?: string;
    salary?: string;
    jobDescription?: string;
    recruiterEmail?: string;
    recruiterName?: string;
  },
) {
  const app = await prisma.application.create({
    data: {
      userId,
      company: data.company,
      title: data.title,
      jobUrl: data.jobUrl || null,
      source: data.source ?? "manual",
      externalJobId: data.externalJobId ?? null,
      location: data.location ?? null,
      salary: data.salary ?? null,
      jobDescription: data.jobDescription ?? null,
      recruiterEmail: data.recruiterEmail ?? null,
      recruiterName: data.recruiterName ?? null,
      status: "draft",
    },
  });

  if (data.recruiterEmail) {
    await autoRegisterContact(userId, {
      email: data.recruiterEmail,
      name: data.recruiterName,
      company: data.company,
      title: data.title,
      source: data.source ?? "manual",
      applicationId: app.id,
    });
  }

  if (data.jobDescription) {
    await autoRegisterContactsFromText(userId, data.jobDescription, {
      company: data.company,
      title: data.title,
      source: data.source ?? "manual",
      applicationId: app.id,
    });
  }

  return app;
}

export async function importJobBankListing(userId: string, listing: JobBankListing) {
  const existing = await prisma.application.findFirst({
    where: { userId, externalJobId: listing.externalJobId, source: "job_bank" },
  });
  if (existing) return existing;

  const { description, emails } = await fetchJobBankPostingDetails(listing.externalJobId);

  const app = await createApplication(userId, {
    company: listing.company,
    title: listing.title,
    jobUrl: listing.jobUrl,
    source: "job_bank",
    externalJobId: listing.externalJobId,
    location: listing.location,
    salary: listing.salary,
    jobDescription: description,
    recruiterEmail: emails[0],
    recruiterName: listing.company,
  });

  for (const email of emails.slice(1)) {
    await autoRegisterContact(userId, {
      email,
      company: listing.company,
      title: listing.title,
      source: "job_bank",
      applicationId: app.id,
    });
  }

  return app;
}

export async function importGmailAlert(
  userId: string,
  alert: {
    title: string | null;
    company: string | null;
    jobUrl: string | null;
    from: string;
    snippet: string;
    messageId: string;
    subject?: string;
  },
) {
  const source: JobSource = alert.jobUrl?.includes("indeed") ? "indeed" : "gmail";
  const title = alert.title ?? "Opportunité emploi";
  const company =
    alert.company ??
    (alert.from.replace(/<.*>/, "").trim() || "Inconnu");

  const existing = await prisma.application.findFirst({
    where: {
      userId,
      jobUrl: alert.jobUrl ?? undefined,
      source,
    },
  });
  if (existing) return existing;

  const emailMatch = alert.from.match(/<([^>]+)>/);
  const parsed = parseEmailFromHeader(alert.from);
  const recruiterEmail = parsed.email || emailMatch?.[1] || null;

  const app = await createApplication(userId, {
    company,
    title,
    jobUrl: alert.jobUrl ?? undefined,
    source,
    jobDescription: alert.snippet,
    recruiterEmail: recruiterEmail ?? undefined,
    recruiterName: parsed.name ?? company,
  });

  if (recruiterEmail) {
    await autoRegisterContact(userId, {
      email: recruiterEmail,
      name: parsed.name,
      company,
      title,
      source,
      applicationId: app.id,
      notes: alert.subject ?? undefined,
    });
  }

  await autoRegisterContactsFromText(userId, `${alert.snippet} ${alert.from}`, {
    company,
    title,
    source,
    applicationId: app.id,
  });

  return app;
}

export async function updateApplicationStatus(
  userId: string,
  id: string,
  status: string,
) {
  if (!isValidApplicationStatus(status)) {
    throw new Error("Invalid status");
  }

  const existing = await prisma.application.findFirst({
    where: { id, userId },
  });
  if (!existing) return null;

  return prisma.application.update({
    where: { id },
    data: { status },
  });
}

export async function generateApplicationCoverLetter(
  userId: string,
  data: {
    id?: string;
    company: string;
    title: string;
    jobUrl?: string;
    jobDescription?: string;
    locale?: "fr" | "en";
  },
) {
  const locale = data.locale ?? "fr";
  const memory = await fetchUserMemory(userId, locale);

  const cvBlock = memory.latestCv
    ? `\nCV excerpt (${memory.latestCv.filename}):\n${memory.latestCv.excerpt}`
    : "";

  const { text } = await generateWithProvider({
    system: loadPrompt("job"),
    prompt: `Generate a professional cover letter draft for a Canadian immigration candidate.

Company: ${data.company}
Job title: ${data.title}
Job URL: ${data.jobUrl ?? "N/A"}
Job description: ${data.jobDescription ?? "N/A"}

Candidate background:
${memory.profileSummary}
${cvBlock}

Rules:
- Never invent degrees, employers, or skills not present in the CV or profile.
- Highlight relevant experience from the CV when available.
- Write in ${locale === "fr" ? "French" : "English"} unless the job posting is clearly in the other language.
- End with a note that the candidate must review before sending.`,
  });

  if (data.id) {
    const existing = await prisma.application.findFirst({
      where: { id: data.id, userId },
    });
    if (existing) {
      await prisma.application.update({
        where: { id: data.id },
        data: { coverLetter: text, status: "ready" },
      });
    }
  }

  return text;
}
