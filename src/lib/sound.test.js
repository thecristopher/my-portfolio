import { describe, expect, it } from "vitest";
import { UI_SOUNDS, getMuted, noteFrequency, playRecipe, playSound, setMuted } from "./sound";

describe("noteFrequency", () => {
  it("tunes zero semitones to A4, the first note of Claire and Inde's playlist", () => {
    expect(noteFrequency(0)).toBe(440);
  });

  it("doubles the frequency one octave up", () => {
    expect(noteFrequency(12)).toBe(880);
  });
});

describe("UI_SOUNDS", () => {
  it("gives every hit of the avatar's combo its own sound, from the first jab to the shoryuken", () => {
    expect(Object.keys(UI_SOUNDS)).toEqual(expect.arrayContaining(["punch", "kick", "shoryuken"]));
  });
});

describe("playRecipe", () => {
  it("stays quiet when the browser has no Web Audio", () => {
    expect(() => playRecipe(UI_SOUNDS.punch)).not.toThrow();
  });

  it("stays calm when no recipe is given", () => {
    expect(() => playRecipe(undefined)).not.toThrow();
  });
});

describe("playSound", () => {
  it("skips a sound name it does not know", () => {
    expect(() => playSound("hollow-knight")).not.toThrow();
  });
});

describe("setMuted", () => {
  it("mutes for Malenia's quiet evening and unmutes when she is ready", () => {
    setMuted(true);
    expect(getMuted()).toBe(true);
    expect(() => playSound("punch")).not.toThrow();
    setMuted(false);
    expect(getMuted()).toBe(false);
  });
});
