import { describe, expect, it } from "vitest";
import { generateMessageId } from "../utils";

describe("generateMessageId", () => {
  it("returns a non-empty unique string", () => {
    const a = generateMessageId();
    const b = generateMessageId();
    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });
});
