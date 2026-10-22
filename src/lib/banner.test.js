import { describe, expect, it } from "vitest";
import { BANNER_KINDS, spacedLetters } from "./banner";

describe("spacedLetters", () => {
  it("carves ENEMY FELLED wide after Malenia wins her sparring match with Radahn", () => {
    expect(spacedLetters("enemy felled").join("")).toBe("ENEMY  FELLED");
  });

  it("spells Leyndell as plain letters for Claire's arrival", () => {
    expect(spacedLetters("Leyndell")).toEqual([..."LEYNDELL"]);
  });

  it("returns no letters for an empty banner", () => {
    expect(spacedLetters("")).toEqual([]);
  });
});

describe("BANNER_KINDS", () => {
  it("shows YOU DIED all at once, so Inde can get right back up", () => {
    expect(BANNER_KINDS.died.staggerMs).toBe(0);
  });

  it("keeps every banner up long enough for Claire to read it", () => {
    Object.values(BANNER_KINDS).forEach((kind) => expect(kind.durationMs).toBeGreaterThanOrEqual(2500));
  });
});
