import { describe, expect, it } from "vitest";
import { REGION_NAMES } from "./regions";
import { REGION_SOUNDS } from "./regionSounds";

describe("REGION_SOUNDS", () => {
  it("gives every region Malenia can travel to a sound of its own", () => {
    REGION_NAMES.forEach((name) => expect(REGION_SOUNDS[name]?.notes.length).toBeGreaterThan(0));
  });

  it("keeps every note Claire hears short enough to land before the banner leaves", () => {
    Object.values(REGION_SOUNDS).forEach((sound) =>
      sound.notes.forEach(([, start, length]) => expect(start + length).toBeLessThanOrEqual(2.8))
    );
  });
});
