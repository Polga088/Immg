import { prisma } from "@immg/db";
import { getProcedureChecklist } from "@/lib/procedure/service";
import { profileCompletionPercent, isProfileComplete } from "@/lib/profile/completeness";

export interface UserMemory {
  profileSummary: string;
  profileComplete: boolean;
  profileCompletion: number;
  targetProgram: string | null;
  latestCv: { filename: string; excerpt: string; length: number } | null;
  checklistSummary: string | null;
  applicationsSummary: string | null;
}

export async function fetchUserMemory(
  userId: string,
  locale: "fr" | "en",
): Promise<UserMemory> {
  const [profile, latestCv, applications] = await Promise.all([
    prisma.immigrationProfile.findUnique({ where: { userId } }),
    prisma.document.findFirst({
      where: { userId, type: "cv" },
      orderBy: { createdAt: "desc" },
      select: { filename: true, content: true },
    }),
    prisma.application.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { company: true, title: true, status: true },
    }),
  ]);

  const profileComplete = profile ? isProfileComplete(profile) : false;
  const profileCompletion = profile ? profileCompletionPercent(profile) : 0;

  let checklistSummary: string | null = null;
  if (profile?.targetProgram) {
    const checklist = await getProcedureChecklist(userId, profile.targetProgram);
    const stepLines = checklist.steps
      .map((s) => `- ${s.stepKey}: ${s.completed ? "done" : "pending"}`)
      .join("\n");
    checklistSummary =
      locale === "fr"
        ? `Programme: ${checklist.program}\nProgression: ${checklist.progress}% (${checklist.completed}/${checklist.total})\nÉtapes:\n${stepLines}\nDocuments en attente: ${checklist.pendingDocuments.join(", ") || "aucun"}`
        : `Program: ${checklist.program}\nProgress: ${checklist.progress}% (${checklist.completed}/${checklist.total})\nSteps:\n${stepLines}\nPending documents: ${checklist.pendingDocuments.join(", ") || "none"}`;
  }

  const profileSummary = profile
    ? locale === "fr"
      ? `Profil immigration (${profileCompletion}% complet):
- Âge: ${profile.age ?? "?"}
- Éducation: ${profile.educationLevel ?? "?"}
- CLB langue 1: ${profile.firstLanguageClb ?? "?"}
- Programme cible: ${profile.targetProgram ?? "?"}
- Score CRS enregistré: ${profile.crsScore ?? "non calculé"}
- Expérience étranger/Canada: ${profile.foreignWorkYears}/${profile.canadianWorkYears} ans`
      : `Immigration profile (${profileCompletion}% complete):
- Age: ${profile.age ?? "?"}
- Education: ${profile.educationLevel ?? "?"}
- First language CLB: ${profile.firstLanguageClb ?? "?"}
- Target program: ${profile.targetProgram ?? "?"}
- Stored CRS score: ${profile.crsScore ?? "not calculated"}
- Foreign/Canadian work years: ${profile.foreignWorkYears}/${profile.canadianWorkYears}`
    : locale === "fr"
      ? "Profil immigration: non renseigné."
      : "Immigration profile: not filled in.";

  const applicationsSummary =
    applications.length > 0
      ? locale === "fr"
        ? `Candidatures récentes:\n${applications.map((a) => `- ${a.title} @ ${a.company} (${a.status})`).join("\n")}`
        : `Recent applications:\n${applications.map((a) => `- ${a.title} @ ${a.company} (${a.status})`).join("\n")}`
      : null;

  return {
    profileSummary,
    profileComplete,
    profileCompletion,
    targetProgram: profile?.targetProgram ?? null,
    latestCv: latestCv
      ? {
          filename: latestCv.filename,
          excerpt: latestCv.content.slice(0, 1500),
          length: latestCv.content.length,
        }
      : null,
    checklistSummary,
    applicationsSummary,
  };
}

export function formatUserMemoryBlock(memory: UserMemory): string {
  const parts = [`=== USER PROFILE ===\n${memory.profileSummary}`];

  if (memory.checklistSummary) {
    parts.push(`=== CHECKLIST ===\n${memory.checklistSummary}`);
  }

  if (memory.latestCv) {
    parts.push(
      `=== LATEST CV (${memory.latestCv.filename}, ${memory.latestCv.length} chars) ===\n${memory.latestCv.excerpt}${memory.latestCv.length > 1500 ? "\n[...truncated]" : ""}`,
    );
  }

  if (memory.applicationsSummary) {
    parts.push(`=== APPLICATIONS ===\n${memory.applicationsSummary}`);
  }

  return parts.join("\n\n");
}
