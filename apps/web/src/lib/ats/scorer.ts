export interface ATSResult {
  score: number;
  sections: Record<string, boolean>;
  keywordMatches: string[];
  keywordMisses: string[];
  issues: string[];
  suggestions: string[];
}

const REQUIRED_SECTIONS = [
  "contact",
  "experience",
  "education",
  "skills",
];

const SECTION_PATTERNS: Record<string, RegExp[]> = {
  contact: [/email|e-mail|phone|téléphone|tel|@/i],
  experience: [/experience|expérience|employment|work history/i],
  education: [/education|formation|diploma|diplôme|degree/i],
  skills: [/skills|compétences|technologies|technical/i],
};

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/)
    .filter((w) => w.length > 3)
    .filter((w, i, arr) => arr.indexOf(w) === i);
}

export function scoreATS(
  resumeText: string,
  jobDescription?: string,
): ATSResult {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const sections: Record<string, boolean> = {};

  for (const section of REQUIRED_SECTIONS) {
    const found = SECTION_PATTERNS[section].some((p) => p.test(resumeText));
    sections[section] = found;
    if (!found) {
      issues.push(`Missing section: ${section}`);
      suggestions.push(`Add a clear "${section}" section heading`);
    }
  }

  if (resumeText.length < 200) {
    issues.push("Resume too short");
    suggestions.push("Expand experience descriptions with measurable achievements");
  }

  if (/<table|<img|\|{3,}/i.test(resumeText)) {
    issues.push("Complex formatting detected (tables/images)");
    suggestions.push("Use simple single-column format for ATS compatibility");
  }

  let keywordMatches: string[] = [];
  let keywordMisses: string[] = [];
  let keywordScore = 50;

  if (jobDescription) {
    const jobKeywords = extractKeywords(jobDescription).slice(0, 30);
    const resumeLower = resumeText.toLowerCase();
    keywordMatches = jobKeywords.filter((k) => resumeLower.includes(k));
    keywordMisses = jobKeywords.filter((k) => !resumeLower.includes(k)).slice(0, 10);

    if (jobKeywords.length > 0) {
      keywordScore = Math.round((keywordMatches.length / jobKeywords.length) * 100);
    }

    if (keywordMisses.length > 0) {
      suggestions.push(
        `Consider adding relevant keywords: ${keywordMisses.slice(0, 5).join(", ")}`,
      );
    }
  }

  const sectionScore =
    (Object.values(sections).filter(Boolean).length / REQUIRED_SECTIONS.length) * 40;
  const lengthScore = Math.min(resumeText.length / 2000, 1) * 20;
  const formatPenalty = issues.some((i) => i.includes("formatting")) ? 10 : 0;

  const score = Math.round(
    Math.min(100, sectionScore + lengthScore + keywordScore * 0.4 - formatPenalty),
  );

  return {
    score,
    sections,
    keywordMatches,
    keywordMisses,
    issues,
    suggestions: suggestions.slice(0, 5),
  };
}
