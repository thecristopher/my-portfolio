import { describe, expect, it } from "vitest";
import { REGION_NAMES } from "./regions";
import { REGION_SOUNDS } from "./regionSounds";

describe("REGION_SOUNDS", () => {
  it("gives every region Malenia and Inde travel to a melody of its own", () => {
    REGION_NAMES.forEach((name) => expect(REGION_SOUNDS[name]?.notes.length).toBeGreaterThan(0));
  });

  it("finishes every note Claire hears before the region banner fades", () => {
    Object.values(REGION_SOUNDS).forEach((sound) =>
      sound.notes.forEach(([, start, length]) => expect(start + length).toBeLessThanOrEqual(2.8))
    );
  });
});
