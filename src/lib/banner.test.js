import { describe, expect, it } from "vitest";
import { BANNER_KINDS, spacedLetters } from "./banner";

describe("spacedLetters", () => {
  it("spaces Malenia's defeat the way the game carves it", () => {
    expect(spacedLetters("enemy felled").join("")).toBe("ENEMY  FELLED");
  });

  it("keeps a single word as plain letters", () => {
    expect(spacedLetters("Leyndell")).toEqual([..."LEYNDELL"]);
  });

  it("returns nothing for an empty banner", () => {
    expect(spacedLetters("")).toEqual([]);
  });
});

describe("BANNER_KINDS", () => {
  it("lets YOU DIED seep in all at once", () => {
    expect(BANNER_KINDS.died.staggerMs).toBe(0);
  });

  it("gives every banner time to be read", () => {
    Object.values(BANNER_KINDS).forEach((kind) => expect(kind.durationMs).toBeGreaterThanOrEqual(2500));
  });
});
