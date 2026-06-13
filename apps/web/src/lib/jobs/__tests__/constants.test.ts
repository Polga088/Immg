import { describe, expect, it } from "vitest";
import { isValidApplicationStatus, KANBAN_COLUMNS } from "../constants";

describe("job constants", () => {
  it("validates known statuses", () => {
    expect(isValidApplicationStatus("draft")).toBe(true);
    expect(isValidApplicationStatus("interview")).toBe(true);
    expect(isValidApplicationStatus("invalid")).toBe(false);
  });

  it("defines kanban columns in pipeline order", () => {
    expect(KANBAN_COLUMNS).toEqual(["draft", "ready", "sent", "interview"]);
  });
});
