import { prisma } from "@immg/db";
import { generateWithProvider } from "@/lib/ai/provider";
import { loadPrompt } from "@/agents/prompts/loader";
import { fetchUserMemory } from "@/lib/chat/user-memory";
import { isValidApplicationStatus } from "./constants";

export async function listApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createApplication(
  userId: string,
  data: { company: string; title: string; jobUrl?: string },
) {
  return prisma.application.create({
    data: {
      userId,
      company: data.company,
      title: data.title,
      jobUrl: data.jobUrl || null,
      status: "draft",
    },
  });
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
