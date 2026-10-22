import { describe, expect, it } from "vitest";
import { REST_AFTER_MS, shouldRest } from "./rest";

describe("shouldRest", () => {
  it("lets Malenia sit at the grace once she has been still long enough", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS, isBusy: false, isHidden: false })).toBe(true);
  });

  it("keeps the page awake while Claire is still reading Inde's note", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS - 1, isBusy: false, isHidden: false })).toBe(false);
  });

  it("waits for Inde to close the relic they are admiring before resting", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS * 2, isBusy: true, isHidden: false })).toBe(false);
  });

  it("saves the rest for later when the tab is in the background", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS * 2, isBusy: false, isHidden: true })).toBe(false);
  });
});
