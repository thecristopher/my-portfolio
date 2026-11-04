import { describe, expect, it } from "vitest";
import { pixelSteps, trackDistance, wordWindow } from "./motion";

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

describe("wordWindow", () => {
  it("given the first word of Inde's love note, expect it to start lighting right away", () => {
    expect(wordWindow(0, 10)[0]).toBe(0);
  });

  it("given the last word, expect it to finish lighting exactly when the scroll does", () => {
    expect(wordWindow(9, 10)[1]).toBe(1);
  });

  it("given two words in a row, expect the second to start before the first finishes so the light rolls", () => {
    const [, firstEnds] = wordWindow(3, 10);
    const [secondStarts] = wordWindow(4, 10);
    expect(secondStarts).toBeLessThan(firstEnds);
  });

  it("given an empty paragraph, expect the whole scroll so Malenia's quiet line never breaks", () => {
    expect(wordWindow(0, 0)).toEqual([0, 1]);
  });
});

describe("trackDistance", () => {
  it("given Claire's repos wider than the screen, expect the overflow as the distance to slide", () => {
    expect(trackDistance(3200, 1200)).toBe(2000);
  });

  it("given a track that already fits, expect it to stay put", () => {
    expect(trackDistance(900, 1200)).toBe(0);
  });
});
