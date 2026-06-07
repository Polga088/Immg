import { describe, expect, it } from "vitest";
import { chunkText, hashContent } from "@/lib/rag/chunker";

describe("chunkText", () => {
  it("returns empty for blank input", () => {
    expect(chunkText("   ")).toEqual([]);
  });

  it("keeps short text as single chunk", () => {
    expect(chunkText("Hello IRCC")).toEqual(["Hello IRCC"]);
  });

  it("splits long text into multiple chunks", () => {
    const text = "word ".repeat(300).trim();
    const chunks = chunkText(text, 200, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(" ")).toContain("word");
  });
});

describe("hashContent", () => {
  it("returns stable hash for same content", () => {
    expect(hashContent("test")).toBe(hashContent("test"));
    expect(hashContent("a")).not.toBe(hashContent("b"));
  });
});
