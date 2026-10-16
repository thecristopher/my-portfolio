import { describe, expect, it } from "vitest";
import { PERCEPTION_DC, localRoll, verdictFor } from "./dice";

describe("localRoll", () => {
  it("rolls a natural 20 off the top of the range", () => {
    expect(localRoll(() => 0.999)).toEqual({ roll: 20, dc: PERCEPTION_DC, success: true, message: "Natural 20! Critical success." });
  });

  it("rolls a natural 1 off the bottom", () => {
    expect(localRoll(() => 0)).toMatchObject({ roll: 1, success: false, message: "Natural 1. Critical failure." });
  });

  it("passes on the DC itself", () => {
    expect(localRoll(() => (PERCEPTION_DC - 1) / 20)).toMatchObject({ roll: PERCEPTION_DC, success: true });
  });

  it("fails just under the DC", () => {
    expect(localRoll(() => (PERCEPTION_DC - 2) / 20)).toMatchObject({ roll: PERCEPTION_DC - 1, success: false });
  });
});

describe("verdictFor", () => {
  it("calls out the crits", () => {
    expect(verdictFor({ roll: 20, success: true }).label).toBe("Critical Success");
    expect(verdictFor({ roll: 1, success: false }).label).toBe("Critical Failure");
  });

  it("keeps it plain for everything in between", () => {
    expect(verdictFor({ roll: 12, success: true }).label).toBe("Success");
    expect(verdictFor({ roll: 3, success: false }).label).toBe("Failure");
  });
});
