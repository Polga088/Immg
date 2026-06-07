export type EducationLevel =
  | "less_than_secondary"
  | "secondary"
  | "one_year_post_secondary"
  | "two_year_post_secondary"
  | "bachelors"
  | "two_or_more_degrees"
  | "masters"
  | "phd";

export interface CRSProfile {
  age: number;
  educationLevel: EducationLevel;
  firstLanguageClb: number;
  secondLanguageClb: number;
  foreignWorkYears: number;
  canadianWorkYears: number;
  hasCanadianEducation: boolean;
  hasCanadianJobOffer: boolean;
  hasSiblingInCanada: boolean;
}

export interface CRSBreakdown {
  age: number;
  education: number;
  firstLanguage: number;
  secondLanguage: number;
  foreignWork: number;
  canadianWork: number;
  adaptability: number;
  total: number;
}

function scoreAge(age: number): number {
  if (age < 18) return 0;
  if (age <= 19) return 99;
  if (age <= 20) return 100;
  if (age <= 29) return 110;
  if (age === 30) return 105;
  if (age === 31) return 99;
  if (age === 32) return 94;
  if (age === 33) return 88;
  if (age === 34) return 83;
  if (age === 35) return 77;
  if (age === 36) return 72;
  if (age === 37) return 66;
  if (age === 38) return 61;
  if (age === 39) return 55;
  if (age === 40) return 50;
  if (age === 41) return 39;
  if (age === 42) return 28;
  if (age === 43) return 17;
  if (age === 44) return 6;
  return 0;
}

function scoreEducation(level: EducationLevel): number {
  const map: Record<EducationLevel, number> = {
    less_than_secondary: 0,
    secondary: 30,
    one_year_post_secondary: 90,
    two_year_post_secondary: 98,
    bachelors: 120,
    two_or_more_degrees: 128,
    masters: 135,
    phd: 150,
  };
  return map[level] ?? 0;
}

function scoreFirstLanguage(clb: number): number {
  if (clb < 4) return 0;
  const map: Record<number, number> = {
    4: 6,
    5: 6,
    6: 9,
    7: 17,
    8: 23,
    9: 31,
    10: 34,
  };
  return map[Math.min(clb, 10)] ?? 0;
}

function scoreSecondLanguage(clb: number): number {
  if (clb <= 4) return 0;
  if (clb <= 6) return 1;
  if (clb === 7) return 3;
  if (clb === 8) return 3;
  if (clb === 9) return 6;
  return 6;
}

function scoreForeignWork(years: number): number {
  if (years < 1) return 0;
  if (years === 1) return 40;
  if (years === 2) return 53;
  if (years === 3) return 64;
  if (years >= 4) return 80;
  return 0;
}

function scoreCanadianWork(years: number): number {
  if (years < 1) return 0;
  if (years === 1) return 40;
  if (years === 2) return 53;
  if (years === 3) return 64;
  if (years >= 4) return 80;
  return 0;
}

function scoreAdaptability(profile: CRSProfile): number {
  let score = 0;
  if (profile.hasCanadianEducation) score += 30;
  if (profile.hasCanadianJobOffer) score += 50;
  if (profile.hasSiblingInCanada) score += 15;
  if (profile.firstLanguageClb >= 7 && profile.hasCanadianEducation) score += 0;
  return Math.min(score, 100);
}

export function calculateCRS(profile: CRSProfile): CRSBreakdown {
  const age = scoreAge(profile.age);
  const education = scoreEducation(profile.educationLevel);
  const firstLanguage = scoreFirstLanguage(profile.firstLanguageClb);
  const secondLanguage = scoreSecondLanguage(profile.secondLanguageClb);
  const foreignWork = scoreForeignWork(profile.foreignWorkYears);
  const canadianWork = scoreCanadianWork(profile.canadianWorkYears);
  const adaptability = scoreAdaptability(profile);

  const total =
    age +
    education +
    firstLanguage +
    secondLanguage +
    foreignWork +
    canadianWork +
    adaptability;

  return {
    age,
    education,
    firstLanguage,
    secondLanguage,
    foreignWork,
    canadianWork,
    adaptability,
    total,
  };
}

export function explainCRS(breakdown: CRSBreakdown, locale: "fr" | "en"): string {
  if (locale === "fr") {
    return `Score CRS total : ${breakdown.total} points
- Âge : ${breakdown.age}
- Éducation : ${breakdown.education}
- Langue 1 : ${breakdown.firstLanguage}
- Langue 2 : ${breakdown.secondLanguage}
- Expérience étranger : ${breakdown.foreignWork}
- Expérience Canada : ${breakdown.canadianWork}
- Adaptabilité : ${breakdown.adaptability}`;
  }

  return `Total CRS score: ${breakdown.total} points
- Age: ${breakdown.age}
- Education: ${breakdown.education}
- First language: ${breakdown.firstLanguage}
- Second language: ${breakdown.secondLanguage}
- Foreign work: ${breakdown.foreignWork}
- Canadian work: ${breakdown.canadianWork}
- Adaptability: ${breakdown.adaptability}`;
}
