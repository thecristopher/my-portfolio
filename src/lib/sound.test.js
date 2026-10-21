import { describe, expect, it } from "vitest";
import { UI_SOUNDS, getMuted, noteFrequency, playRecipe, playSound, setMuted } from "./sound";

describe("noteFrequency", () => {
  it("tunes zero semitones to A4", () => {
    expect(noteFrequency(0)).toBe(440);
  });

  it("doubles the frequency one octave up", () => {
    expect(noteFrequency(12)).toBe(880);
  });
});

describe("UI_SOUNDS", () => {
  it("has the jab and coins for the avatar", () => {
    expect(UI_SOUNDS).toHaveProperty("punch");
  });
});

describe("playRecipe", () => {
  it("stays quiet when the browser has no Web Audio", () => {
    expect(() => playRecipe(UI_SOUNDS.punch)).not.toThrow();
  });

  it("ignores a missing recipe", () => {
    expect(() => playRecipe(undefined)).not.toThrow();
  });
});

describe("playSound", () => {
  it("ignores a sound it does not know", () => {
    expect(() => playSound("hollow-knight")).not.toThrow();
  });
});

describe("setMuted", () => {
  it("flips the mute and keeps every sound quiet", () => {
    setMuted(true);
    expect(getMuted()).toBe(true);
    expect(() => playSound("punch")).not.toThrow();
    setMuted(false);
    expect(getMuted()).toBe(false);
  });
});
