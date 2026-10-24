import { describe, expect, it } from "vitest";
import { edgeFade, graceEmbers } from "./helpers";
import { BIG_SIGIL_ROWS, SIGIL_PALETTE, SIGIL_ROWS, SIGIL_STROKES } from "./grace";

describe("edgeFade", () => {
  const fade = edgeFade("gold", { solid: 40 });

  it("holds the full color across the middle for Malenia's name on the love letter", () => {
    expect(fade).toContain("color-mix(in oklab, gold 100%, transparent) 30%, color-mix(in oklab, gold 100%, transparent) 70%");
  });

  it("fades smoothly to nothing at both edges", () => {
    expect(fade).toMatch(/^linear-gradient\(to right, transparent 0%, /);
    expect(fade).toMatch(/transparent 100%\)$/);
  });

  it("dims the middle when the strength is turned down, like candlelight on Claire's anniversary dinner", () => {
    expect(edgeFade("black", { solid: 50, strength: 0.5 })).toContain("black 50%, transparent) 25%");
  });
});

describe("graceEmbers", () => {
  it("rises one speck per ember, every one inside the screen", () => {
    const embers = graceEmbers(18);
    expect(embers).toHaveLength(18);
    embers.forEach(({ left }) => expect(left).toBeGreaterThanOrEqual(4));
    embers.forEach(({ left }) => expect(left).toBeLessThan(96));
  });

  it("gives each ember its own spot, so Inde never sees two drift up as one", () => {
    const lefts = graceEmbers(18).map(({ left }) => left);
    expect(new Set(lefts).size).toBe(18);
  });
});

describe("the sigil sprites", () => {
  it.each([
    ["the small sigil", SIGIL_ROWS],
    ["the big sigil", BIG_SIGIL_ROWS],
  ])("draws %s on a clean square", (_, rows) => {
    rows.forEach((row) => expect(row).toHaveLength(rows.length));
  });

  it("colors every pixel of the small sigil from its palette", () => {
    const used = new Set(SIGIL_ROWS.join("").replaceAll(".", ""));
    used.forEach((char) => expect(SIGIL_PALETTE).toHaveProperty(char));
  });

  it("draws every stroke of the big sigil so each can light up on its beat", () => {
    SIGIL_STROKES.forEach((stroke) => expect(BIG_SIGIL_ROWS.join("")).toContain(stroke));
  });
});
