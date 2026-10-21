import { describe, expect, it } from "vitest";
import { REST_AFTER_MS, shouldRest } from "./rest";

describe("shouldRest", () => {
  it("lets Malenia rest once she's been still long enough", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS, isBusy: false, isHidden: false })).toBe(true);
  });

  it("keeps Claire awake while she's still reading", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS - 1, isBusy: false, isHidden: false })).toBe(false);
  });

  it("never interrupts a relic or a dialog Inde has open", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS * 2, isBusy: true, isHidden: false })).toBe(false);
  });

  it("doesn't rest in a tab nobody is looking at", () => {
    expect(shouldRest({ idleMs: REST_AFTER_MS * 2, isBusy: false, isHidden: true })).toBe(false);
  });
});
