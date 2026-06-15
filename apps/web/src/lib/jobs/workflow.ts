import { prisma } from "@immg/db";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";
import { scoreATS } from "@/lib/ats/scorer";
import { fetchUserMemory } from "@/lib/chat/user-memory";
import { createGmailDraft } from "./gmail";
import { autoRegisterContact, autoRegisterContactsFromText } from "./contacts";

function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match?.[0] ?? null;
}

export async function prepareApplicationPackage(
  userId: string,
  applicationId: string,
  locale: "fr" | "en",
) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });
  if (!application) throw new Error("Application not found");

  const memory = await fetchUserMemory(userId, locale);
  const cvText = memory.latestCv?.excerpt ?? "";
  if (!cvText.trim()) {
    throw new Error("NO_CV");
  }

  const jobDescription = application.jobDescription ?? "";

  const atsBefore = scoreATS(cvText, jobDescription || undefined);

  const { text: adaptedCv } = await generateWithProvider({
    system: loadPrompt("cv"),
    prompt: `Adapt this CV for the job below. NEVER invent experience, employers, or degrees.
Only rephrase, reorder, and emphasize existing content from the CV.

Job title: ${application.title}
Company: ${application.company}
Job description excerpt: ${jobDescription.slice(0, 3000)}

Original CV:
${cvText.slice(0, 6000)}

Output the full adapted CV text in ${locale === "fr" ? "French" : "English"}.`,
  });

  const atsAfter = scoreATS(adaptedCv, jobDescription || undefined);
  const fitScore = Math.round((atsBefore.score + atsAfter.score) / 2);

  const { text: coverLetter } = await generateWithProvider({
    system: loadPrompt("job"),
    prompt: `Write a cover letter for this Canadian job application.
Never invent qualifications not in the CV.

Company: ${application.company}
Job title: ${application.title}
Job URL: ${application.jobUrl ?? "N/A"}
Job description: ${jobDescription.slice(0, 3000)}

Candidate profile:
${memory.profileSummary}

CV excerpt:
${adaptedCv.slice(0, 2500)}

Language: ${locale === "fr" ? "French" : "English"}
End with a note that the candidate must review before sending.`,
  });

  let recruiterEmail = application.recruiterEmail;
  if (!recruiterEmail && jobDescription) {
    recruiterEmail = extractEmail(jobDescription);
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      adaptedCv,
      coverLetter,
      fitScore,
      recruiterEmail,
      packageReady: true,
      status: "ready",
    },
  });

  if (recruiterEmail) {
    await autoRegisterContact(userId, {
      email: recruiterEmail,
      company: application.company,
      title: application.title,
      source: application.source,
      applicationId: application.id,
    });
  }

  if (application.jobDescription) {
    await autoRegisterContactsFromText(userId, application.jobDescription, {
      company: application.company,
      title: application.title,
      source: application.source,
      applicationId: application.id,
    });
  }

  return {
    application: updated,
    fitScore,
    atsBefore: atsBefore.score,
    atsAfter: atsAfter.score,
  };
}

export async function createApplicationDraftEmail(
  userId: string,
  applicationId: string,
  locale: "fr" | "en",
) {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
  });
  if (!application?.coverLetter) throw new Error("Package not ready");
  if (!application.recruiterEmail) throw new Error("NO_RECRUITER_EMAIL");

  const subject =
    locale === "fr"
      ? `Candidature — ${application.title} — ${application.company}`
      : `Application — ${application.title} — ${application.company}`;

  const body = `${application.coverLetter}

---
${locale === "fr" ? "CV adapté joint (à ajouter manuellement dans Gmail)." : "Adapted CV attached (add manually in Gmail)."}
${application.adaptedCv?.slice(0, 500) ?? ""}...`;

  const draftId = await createGmailDraft(userId, {
    to: application.recruiterEmail,
    subject,
    body,
  });

  await prisma.application.update({
    where: { id: applicationId },
    data: { gmailDraftId: draftId, status: "sent" },
  });

  return { draftId };
}
