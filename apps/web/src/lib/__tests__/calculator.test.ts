import { describe, it, expect } from "vitest";
import { calculateCRS } from "@/lib/crs/calculator";
import { scoreATS } from "@/lib/ats/scorer";

describe("CRS Calculator", () => {
  it("calculates score for typical profile", () => {
    const result = calculateCRS({
      age: 30,
      educationLevel: "bachelors",
      firstLanguageClb: 9,
      secondLanguageClb: 5,
      foreignWorkYears: 3,
      canadianWorkYears: 0,
      hasCanadianEducation: false,
      hasCanadianJobOffer: false,
      hasSiblingInCanada: false,
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.age).toBe(105);
    expect(result.education).toBe(120);
  });

  it("returns zero age score for age 45+", () => {
    const result = calculateCRS({
      age: 46,
      educationLevel: "bachelors",
      firstLanguageClb: 7,
      secondLanguageClb: 0,
      foreignWorkYears: 0,
      canadianWorkYears: 0,
      hasCanadianEducation: false,
      hasCanadianJobOffer: false,
      hasSiblingInCanada: false,
    });

    expect(result.age).toBe(0);
  });
});

describe("ATS Scorer", () => {
  const sampleResume = `
John Doe
Email: john@example.com | Phone: 555-1234

EXPERIENCE
Software Engineer at Tech Corp (2020-2024)
- Built web applications with React and Node.js

EDUCATION
Bachelor of Computer Science, University XYZ

SKILLS
JavaScript, TypeScript, React, Node.js, Python
`;

  it("scores resume with all sections", () => {
    const result = scoreATS(sampleResume);
    expect(result.score).toBeGreaterThan(40);
    expect(result.sections.contact).toBe(true);
    expect(result.sections.experience).toBe(true);
  });

  it("matches keywords from job description", () => {
    const jobDesc = "Looking for React TypeScript developer with Node.js experience";
    const result = scoreATS(sampleResume, jobDesc);
    expect(result.keywordMatches.length).toBeGreaterThan(0);
  });
});
