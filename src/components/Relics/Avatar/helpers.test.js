import { describe, expect, it } from "vitest";
import { BEATS, elementBeat, erhuNote } from "./helpers";

describe("elementBeat", () => {
  it("gives Water, Earth, Fire and Air one beat each, in order", () => {
    const beats = [0, 1, 2, 3].map(elementBeat);
    expect(beats[0]).toBe(BEATS.firstElement);
    beats.slice(1).forEach((beat, index) => expect(beat - beats[index]).toBeCloseTo(BEATS.elementGap));
  });

  it("lets Air finish before the four nations come together", () => {
    expect(elementBeat(3)).toBeLessThan(BEATS.together);
  });
});

describe("BEATS", () => {
  it("speaks the harmony line before Claire and Inde's roles, names the one who masters all four, and settles inside six seconds", () => {
    expect(BEATS.together).toBeLessThan(BEATS.harmony);
    expect(BEATS.harmony).toBeLessThan(BEATS.roles);
    expect(BEATS.roles).toBeLessThan(BEATS.master);
    expect(BEATS.master * 1000).toBeLessThan(BEATS.lastsMs);
    expect(BEATS.lastsMs).toBeGreaterThanOrEqual(3000);
    expect(BEATS.lastsMs).toBeLessThanOrEqual(6000);
  });
});

describe("erhuNote", () => {
  const notes = erhuNote(12, 1, 0.5);

  it("scoops up into the note from a semitone below", () => {
    const [scoop] = notes;
    expect(scoop[0]).toBe(11);
    expect(scoop[1]).toBe(1);
    expect(scoop[3].slideTo).toBe(12);
  });

  it("wobbles around the pitch for the rest of the note, like the love song Claire plays for Inde", () => {
    const held = notes.slice(1);
    expect(held.length).toBeGreaterThan(1);
    held.forEach(([pitch, , , { slideTo }]) => {
      expect([12, 12.35]).toContain(pitch);
      expect([12, 12.35]).toContain(slideTo);
      expect(pitch).not.toBe(slideTo);
    });
  });

  it("finishes about when the note should", () => {
    const [, start, length] = notes.at(-1);
    expect(start + length).toBeCloseTo(1.53, 1);
  });
});
