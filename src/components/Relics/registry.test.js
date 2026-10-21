import { describe, expect, it } from "vitest";
import { RELIC_IDS } from "../../lib/relics";
import { RELIC_EFFECTS, RELIC_SOUNDS } from "./registry";

describe("relic registry", () => {
  it("gives every relic Malenia can touch a moment and a jingle", () => {
    RELIC_IDS.forEach((id) => {
      expect(RELIC_EFFECTS[id]).toBeTruthy();
      expect(RELIC_SOUNDS[id].notes.length).toBeGreaterThan(0);
    });
  });

  it("knows nothing Claire can't find on the page", () => {
    expect(Object.keys(RELIC_SOUNDS).sort()).toEqual([...RELIC_IDS].sort());
  });
});
