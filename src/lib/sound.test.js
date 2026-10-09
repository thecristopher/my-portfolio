import { describe, expect, it } from "vitest";
import { SECRET_IDS } from "./secrets";
import { SOUNDS, noteFrequency, playSound } from "./sound";

describe("noteFrequency", () => {
  it("tunes zero semitones to A4", () => {
    expect(noteFrequency(0)).toBe(440);
  });

  it("doubles the frequency one octave up", () => {
    expect(noteFrequency(12)).toBe(880);
  });
});

describe("SOUNDS", () => {
  it("has a jingle for every secret", () => {
    for (const id of SECRET_IDS) expect(SOUNDS).toHaveProperty(id);
  });

  it("has the jab and coins for the avatar", () => {
    expect(SOUNDS).toHaveProperty("punch");
  });
});

describe("playSound", () => {
  it("stays quiet when the browser has no Web Audio", () => {
    expect(() => playSound("grace")).not.toThrow();
  });

  it("ignores a sound it does not know", () => {
    expect(() => playSound("hollow-knight")).not.toThrow();
  });
});
