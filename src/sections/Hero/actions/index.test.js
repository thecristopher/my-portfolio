import { describe, expect, it } from "vitest";
import { HERO_BEATS, headlineStory } from ".";

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

  it("keeps every beat inside the pinned scroll", () => {
    Object.values(HERO_BEATS).forEach(([start, end]) => {
      expect(start).toBeGreaterThanOrEqual(0);
      expect(end).toBeLessThanOrEqual(1);
      expect(start).toBeLessThan(end);
    });
  });
});
