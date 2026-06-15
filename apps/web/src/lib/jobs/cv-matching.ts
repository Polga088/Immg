import { prisma } from "@immg/db";
import { scoreATS } from "@/lib/ats/scorer";
import type { JobBankListing } from "./job-bank";

const TITLE_PATTERNS: Array<{ pattern: RegExp; title: string }> = [
  { pattern: /\b(full[\s-]?stack|fullstack)\b/i, title: "full stack developer" },
  { pattern: /\b(front[\s-]?end|frontend|react|vue|angular)\b/i, title: "frontend developer" },
  { pattern: /\b(back[\s-]?end|backend|node\.?js|java|spring)\b/i, title: "backend developer" },
  { pattern: /\b(devops|kubernetes|docker|aws|azure|cloud)\b/i, title: "devops engineer" },
  { pattern: /\b(data\s*scientist|machine\s*learning|ml\b|ai\b)/i, title: "data scientist" },
  { pattern: /\b(data\s*analyst|business\s*analyst|analyste)\b/i, title: "data analyst" },
  { pattern: /\b(software|développeur|developer|programmeur)\b/i, title: "software developer" },
  { pattern: /\b(project\s*manager|chef\s*de\s*projet)\b/i, title: "project manager" },
  { pattern: /\b(qa|test|quality\s*assurance)\b/i, title: "QA tester" },
  { pattern: /\b(designer|ux|ui)\b/i, title: "UX designer" },
  { pattern: /\b(network|réseau|sysadmin|système)\b/i, title: "network administrator" },
  { pattern: /\b(support|helpdesk|technicien)\b/i, title: "IT support specialist" },
];

export interface CvJobSuggestions {
  hasCv: boolean;
  cvFilename: string | null;
  suggestedTitles: string[];
  topSkills: string[];
}

export async function getUserCvText(userId: string): Promise<{
  text: string;
  filename: string | null;
} | null> {
  const doc = await prisma.document.findFirst({
    where: { userId, type: "cv" },
    orderBy: { createdAt: "desc" },
    select: { content: true, filename: true },
  });
  if (!doc?.content?.trim()) return null;
  return { text: doc.content, filename: doc.filename };
}

export function suggestJobTitlesFromCv(cvText: string): CvJobSuggestions {
  const textLower = cvText.toLowerCase();
  const suggestedTitles: string[] = [];

  for (const { pattern, title } of TITLE_PATTERNS) {
    if (pattern.test(cvText) && !suggestedTitles.includes(title)) {
      suggestedTitles.push(title);
    }
  }

  if (suggestedTitles.length === 0) {
    suggestedTitles.push("software developer", "IT specialist");
  }

  const words = textLower
    .split(/[^a-z0-9+#.-]+/)
    .filter((w) => w.length > 3);
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  const topSkills = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w)
    .filter((w) => !["avec", "dans", "pour", "years", "experience"].includes(w));

  return {
    hasCv: true,
    cvFilename: null,
    suggestedTitles: suggestedTitles.slice(0, 5),
    topSkills,
  };
}

export async function buildCvJobSuggestions(userId: string): Promise<CvJobSuggestions> {
  const cv = await getUserCvText(userId);
  if (!cv) {
    return {
      hasCv: false,
      cvFilename: null,
      suggestedTitles: ["software developer"],
      topSkills: [],
    };
  }

  const suggestions = suggestJobTitlesFromCv(cv.text);
  suggestions.cvFilename = cv.filename;
  return suggestions;
}

export interface RankedListing extends JobBankListing {
  fitScore: number;
}

export function rankListingsByCv(
  listings: JobBankListing[],
  cvText: string,
): RankedListing[] {
  return listings
    .map((listing) => {
      const jobText = `${listing.title} ${listing.company} ${listing.location} ${listing.salary}`;
      const ats = scoreATS(cvText, jobText);
      return { ...listing, fitScore: ats.score };
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}
