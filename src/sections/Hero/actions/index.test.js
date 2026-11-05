import { describe, expect, it } from "vitest";
import { AURORA_PALETTES, HERO_BEATS, headlineStory, isLampLit, letterWeight, skyPhase } from ".";

describe("headlineStory", () => {
  it("keeps the story and drops the title Claire already reads above the name", () => {
    expect(headlineStory("Engineering Manager & Tech Lead. Nine years of shipping software from Baja.")).toBe("Nine years of shipping software from Baja.");
  });

  it("keeps every sentence after the first in Malenia's longer headline", () => {
    expect(headlineStory("Tech Lead. Ships with Inde. Answers every love letter.")).toBe("Ships with Inde. Answers every love letter.");
  });

  it("gives nothing back for a headline with a single sentence", () => {
    expect(headlineStory("Engineering Manager")).toBe("");
  });

  it("gives nothing back while the API has not answered", () => {
    expect(headlineStory(undefined)).toBe("");
    expect(headlineStory(null)).toBe("");
  });
});

describe("HERO_BEATS", () => {
  it("lets the photo finish growing before the caption lands on it", () => {
    expect(HERO_BEATS.grow[1]).toBeLessThanOrEqual(HERO_BEATS.caption[0]);
  });

  it("waits for the story to land before melting the stage into the page, so Inde reads it first", () => {
    expect(HERO_BEATS.caption[1]).toBeLessThanOrEqual(HERO_BEATS.exit[0]);
  });

  it("keeps every beat inside the pinned scroll", () => {
    Object.values(HERO_BEATS).forEach(([start, end]) => {
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeLessThanOrEqual(1);
      expect(start).toBeLessThan(end);
    });
  });
});

describe("skyPhase", () => {
  it("given the sun just over the hills, expect sunrise for Claire's early date on the pier", () => {
    expect(skyPhase({ isDay: true, progress: 0.05 })).toBe("sunrise");
  });

  it("given the sun high over the bay, expect plain day", () => {
    expect(skyPhase({ isDay: true, progress: 0.5 })).toBe("day");
  });

  it("given the sun about to sink into the sea, expect the sunset Inde waits for", () => {
    expect(skyPhase({ isDay: true, progress: 0.95 })).toBe("sunset");
  });

  it("given the moon out, expect night, the hour Malenia writes her letters", () => {
    expect(skyPhase({ isDay: false, progress: 0.4 })).toBe("night");
  });
});

describe("AURORA_PALETTES", () => {
  it("gives every light three colors to drift in", () => {
    Object.values(AURORA_PALETTES).forEach((palette) => expect(palette).toHaveLength(3));
  });
});

describe("letterWeight", () => {
  const weights = { reach: 200, rest: 600, peak: 900 };

  it("given the cursor right on a letter of Claire's name, expect it at full weight", () => {
    expect(letterWeight(0, weights)).toBe(900);
  });

  it("given the cursor past the reach, expect Malenia's letters resting", () => {
    expect(letterWeight(260, weights)).toBe(600);
  });

  it("given the cursor halfway, expect Inde's letter halfway between the two weights", () => {
    expect(letterWeight(100, weights)).toBe(750);
  });
});

describe("isLampLit", () => {
  it("given the first light of the sunrise, expect every lamp on the pier still burning for Claire's walk", () => {
    expect([0, 1, 2, 3, 4, 5].every((index) => isLampLit(index, 6, 0.1))).toBe(true);
  });

  it("given the day coming, expect the lamp farthest out at sea to go out before the one by the shore", () => {
    expect(isLampLit(5, 6, 0.4)).toBe(false);
    expect(isLampLit(0, 6, 0.4)).toBe(true);
  });

  it("given the sun fully up, expect Malenia to find every lamp off", () => {
    expect([0, 1, 2, 3, 4, 5].some((index) => isLampLit(index, 6, 1))).toBe(false);
  });

  it("given a pier with a single lamp, expect it to still go out instead of dividing by zero", () => {
    expect(isLampLit(0, 1, 0.9)).toBe(false);
  });
});
