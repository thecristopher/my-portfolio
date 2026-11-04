import { describe, expect, it } from "vitest";
import { MAIN_PROJECT, lastPushed } from ".";

describe("lastPushed", () => {
  const now = new Date("2026-11-04T12:00:00Z").getTime();

  it("says today for the playlist Inde pushed this morning", () => {
    expect(lastPushed("2026-11-04T08:00:00Z", now)).toBe("today");
  });

  it("counts days for Claire's repo from last week", () => {
    expect(lastPushed("2026-10-28T12:00:00Z", now)).toBe("7d ago");
  });

  it("counts months for Malenia's anniversary project", () => {
    expect(lastPushed("2026-08-01T12:00:00Z", now)).toBe("3mo ago");
  });

  it("counts years for Leon's oldest repo", () => {
    expect(lastPushed("2024-10-01T12:00:00Z", now)).toBe("2y ago");
  });
});

describe("MAIN_PROJECT", () => {
  it("points at the nvim config and pitches it without em dashes", () => {
    expect(MAIN_PROJECT.url).toMatch(/nvim-config$/);
    expect(MAIN_PROJECT.pitch).not.toContain("\u2014");
  });
});
