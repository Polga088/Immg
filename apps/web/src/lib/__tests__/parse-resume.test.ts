import { describe, expect, it } from "vitest";
import {
  extractResumeText,
  parseResumeText,
  ResumeParseError,
} from "@/lib/ats/parse-resume";

describe("parseResumeText", () => {
  it("normalizes pasted plain text", () => {
    const text = "  John Doe\r\n\r\n\r\nEXPERIENCE\r\nDeveloper  ";
    expect(parseResumeText(text, "resume.txt")).toContain("EXPERIENCE");
    expect(parseResumeText(text, "resume.txt")).not.toMatch(/\r/);
  });
});

describe("extractResumeText", () => {
  it("extracts text from a txt buffer", async () => {
    const buffer = Buffer.from(
      "Jane Doe\nEmail: jane@example.com\n\nEXPERIENCE\nEngineer at Acme",
      "utf8",
    );
    const text = await extractResumeText(buffer, "cv.txt");
    expect(text).toContain("Jane Doe");
    expect(text).toContain("EXPERIENCE");
  });

  it("rejects unsupported extensions", async () => {
    const buffer = Buffer.from("data", "utf8");
    await expect(extractResumeText(buffer, "cv.doc")).rejects.toBeInstanceOf(
      ResumeParseError,
    );
  });

  it("rejects files that are too large", async () => {
    const buffer = Buffer.alloc(5 * 1024 * 1024 + 1);
    await expect(extractResumeText(buffer, "big.pdf")).rejects.toMatchObject({
      code: "too_large",
    });
  });

  it("rejects empty text extraction", async () => {
    const buffer = Buffer.from("   \n  ", "utf8");
    await expect(extractResumeText(buffer, "empty.txt")).rejects.toMatchObject({
      code: "empty",
    });
  });
});
