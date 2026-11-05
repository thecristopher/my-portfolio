import { describe, expect, it, vi } from "vitest";

vi.mock("lenis", () => ({ default: class {} }));
const { isTooFarToGlide } = await import("./smoothScroll");

describe("isTooFarToGlide", () => {
  it("lets Claire glide down to the next section", () => {
    expect(isTooFarToGlide(900, 900)).toBe(false);
  });

  it("jumps Malenia back over the whole Experience scene", () => {
    expect(isTooFarToGlide(-14000, 900)).toBe(true);
  });

  it("counts the distance the same going up or down", () => {
    expect(isTooFarToGlide(-3000, 900)).toBe(isTooFarToGlide(3000, 900));
  });
});
