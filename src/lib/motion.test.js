import { describe, expect, it } from "vitest";
import { pixelSteps } from "./motion";

describe("pixelSteps", () => {
  it("given four frames, expect the motion snapped to quarters, like Claire's note landing one beat at a time", () => {
    const ease = pixelSteps(4);
    expect(ease(0.1)).toBe(0);
    expect(ease(0.3)).toBe(0.25);
    expect(ease(0.9)).toBe(1);
  });

  it("given the ends, expect them untouched so Malenia always starts and finishes in place", () => {
    const ease = pixelSteps(3);
    expect(ease(0)).toBe(0);
    expect(ease(1)).toBe(1);
  });
});
