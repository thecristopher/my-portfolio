import { describe, expect, it } from "vitest";
import { pixelsToPaths, spritePaths, typingEnds, wobbleKeyframes } from "./helpers";

describe("pixelsToPaths", () => {
  it("puts every pixel of one color in the same path, like Claire's red jacket", () => {
    const paths = pixelsToPaths([
      { x: 0, y: 0, color: "#c0392b" },
      { x: 1, y: 0, color: "#c0392b" },
    ]);
    expect(paths).toEqual([{ color: "#c0392b", d: "M0 0h1v1h-1zM1 0h1v1h-1z" }]);
  });

  it("keeps the colors in the order Malenia's sprite shows them", () => {
    const paths = pixelsToPaths([
      { x: 0, y: 0, color: "#c9302c" },
      { x: 0, y: 1, color: "#e8c35a" },
      { x: 1, y: 1, color: "#c9302c" },
    ]);
    expect(paths.map(({ color }) => color)).toEqual(["#c9302c", "#e8c35a"]);
  });

  it("draws nothing for an empty sprite", () => {
    expect(pixelsToPaths()).toEqual([]);
  });
});

describe("typingEnds", () => {
  it("knows when Inde's love note to Claire finishes printing", () => {
    expect(typingEnds("te amo", 1, 0.05)).toBe(1.3);
  });

  it("finishes right away for an empty line", () => {
    expect(typingEnds("", 2, 0.04)).toBe(2);
  });
});

describe("wobbleKeyframes", () => {
  it("rocks three times and rests in between before Malenia's catch clicks shut", () => {
    const { rotate, times } = wobbleKeyframes(3);
    expect(rotate).toHaveLength(13);
    expect(rotate.filter((angle) => angle < 0)).toHaveLength(3);
    expect(times).toHaveLength(rotate.length);
  });

  it("starts and ends at rest, spread over the whole animation", () => {
    const { rotate, times } = wobbleKeyframes(2, 10);
    expect(rotate[0]).toBe(0);
    expect(rotate.at(-1)).toBe(0);
    expect(times[0]).toBe(0);
    expect(times.at(-1)).toBe(1);
  });

  it("keeps the times climbing so framer never plays a keyframe backwards", () => {
    const { times } = wobbleKeyframes(3);
    expect(times.every((time, index) => index === 0 || time > times[index - 1])).toBe(true);
  });
});

describe("spritePaths", () => {
  it("paints the rose Inde brings to Claire from its rows and palette", () => {
    expect(spritePaths(["R.", "G"], { R: "#e0245e", G: "#2f7a32" })).toEqual([
      { color: "#e0245e", d: "M0 0h1v1h-1z" },
      { color: "#2f7a32", d: "M0 1h1v1h-1z" },
    ]);
  });
});
