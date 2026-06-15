import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  decryptGmailSecret,
  encryptGmailSecret,
  normalizeAppPassword,
} from "../gmail-crypto";

describe("gmail-crypto", () => {
  const original = process.env.NEXTAUTH_SECRET;

  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret-for-gmail-encryption";
  });

  afterEach(() => {
    process.env.NEXTAUTH_SECRET = original;
  });

  it("encrypts and decrypts app passwords", () => {
    const plain = "abcd efgh ijkl mnop";
    const encrypted = encryptGmailSecret(plain);
    expect(encrypted).not.toContain(plain);
    expect(decryptGmailSecret(encrypted)).toBe(plain);
  });

  it("normalizes app password spaces", () => {
    expect(normalizeAppPassword("abcd efgh ijkl mnop")).toBe("abcdefghijklmnop");
  });
});
