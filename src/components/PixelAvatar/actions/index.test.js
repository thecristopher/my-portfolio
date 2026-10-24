import { describe, expect, it } from "vitest";
import { shiftTransform } from ".";

describe("shiftTransform", () => {
  it("given a lean, expect a translate by those whole pixels, like Claire leaning in for a kiss", () => {
    expect(shiftTransform([-3, 2])).toBe("translate(-3 2)");
  });

  it("given no lean, expect nothing so Malenia's layer stays exactly where it was drawn", () => {
    expect(shiftTransform([0, 0])).toBeUndefined();
    expect(shiftTransform()).toBeUndefined();
  });
});
