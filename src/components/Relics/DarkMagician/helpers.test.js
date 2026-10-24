import { describe, expect, it } from "vitest";
import { hexagramRows, magicRingRows } from "./helpers";

describe("magicRingRows", () => {
  const rings = magicRingRows(48);

  it("draws a square sprite as big as asked, for the circle Inde and Claire stand in on their anniversary", () => {
    expect(rings).toHaveLength(48);
    rings.forEach((row) => expect(row).toHaveLength(48));
  });

  it("puts the pink ring outside the blue one", () => {
    const middle = rings[24];
    expect(middle.indexOf("p")).toBeLessThan(middle.indexOf("b"));
    expect(middle.lastIndexOf("p")).toBeGreaterThan(middle.lastIndexOf("b"));
  });

  it("leaves the middle empty for the hexagram", () => {
    expect(rings[24].slice(12, 36)).toBe(".".repeat(24));
  });
});

describe("hexagramRows", () => {
  const star = hexagramRows(48);

  it("draws a square sprite the same size as the rings so Malenia can stack them", () => {
    expect(star).toHaveLength(48);
    star.forEach((row) => expect(row).toHaveLength(48));
  });

  it("points the pink triangle up and the blue one down", () => {
    const firstPink = star.findIndex((row) => row.includes("p"));
    const lastBlue = star.findLastIndex((row) => row.includes("b"));
    expect(star[firstPink].indexOf("p")).toBeGreaterThanOrEqual(22);
    expect(star[firstPink].indexOf("p")).toBeLessThanOrEqual(25);
    expect(star[lastBlue].indexOf("b")).toBeGreaterThanOrEqual(22);
    expect(lastBlue).toBeGreaterThan(40);
  });

  it("never lets a line break up, so every row between the tips has ink", () => {
    const firstInk = star.findIndex((row) => row !== ".".repeat(48));
    const lastInk = star.findLastIndex((row) => row !== ".".repeat(48));
    star.slice(firstInk, lastInk + 1).forEach((row) => expect(row).toMatch(/[pb]/));
  });
});
