import { describe, expect, it } from "vitest";
import { rollPath, scatterStars } from ".";

describe("rollPath", () => {
  it("given credits taller than the frame, expect them to rise until the last line of Claire's note rests inside", () => {
    expect(rollPath(400, 1000, { speed: 50, rest: 0, start: 1 })).toEqual({ from: 400, to: -600, seconds: 20 });
  });

  it("given the defaults, expect Malenia's first line already rising through the lower half instead of an empty sky", () => {
    expect(rollPath(400, 1000).from).toBe(220);
  });

  it("given credits shorter than the frame, expect Inde's to stop at the top instead of sinking", () => {
    expect(rollPath(400, 200, { rest: 20 }).to).toBe(0);
  });
});

describe("scatterStars", () => {
  it("given the same seed twice, expect Malenia to see the very same sky", () => {
    expect(scatterStars(5, 3)).toEqual(scatterStars(5, 3));
  });

  it("given a count, expect every star inside the sky", () => {
    const stars = scatterStars(50);
    expect(stars).toHaveLength(50);
    expect(stars.every((star) => star.x >= 0 && star.x <= 100 && star.y >= 0 && star.y <= 70)).toBe(true);
  });
});
