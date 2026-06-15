import { describe, expect, it } from "vitest";
import { suggestJobTitlesFromCv } from "../cv-matching";

describe("suggestJobTitlesFromCv", () => {
  it("suggests developer titles from IT CV", () => {
    const cv = `
      Software Developer with 5 years experience in React, Node.js, TypeScript.
      Backend API development, Docker, AWS cloud.
    `;
    const result = suggestJobTitlesFromCv(cv);
    expect(result.suggestedTitles.length).toBeGreaterThan(0);
    expect(result.suggestedTitles.some((t) => t.includes("developer"))).toBe(true);
  });
});
