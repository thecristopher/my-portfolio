import { describe, expect, it } from "vitest";
import { PERCEPTION_DC, localRoll, verdictFor } from "./dice";

describe("localRoll", () => {
  it("gives Inde a natural 20 from the top of the range", () => {
    expect(localRoll(() => 0.999)).toEqual({ roll: 20, dc: PERCEPTION_DC, success: true, message: "Natural 20! Critical success." });
  });

  it("gives a natural 1 from the bottom of the range, a story for date night", () => {
    expect(localRoll(() => 0)).toMatchObject({ roll: 1, success: false, message: "Natural 1. Critical failure." });
  });

  it("lets Claire spot the clue on a roll equal to the DC", () => {
    expect(localRoll(() => (PERCEPTION_DC - 1) / 20)).toMatchObject({ roll: PERCEPTION_DC, success: true });
  });

  it("asks Malenia for another look on a roll one under the DC", () => {
    expect(localRoll(() => (PERCEPTION_DC - 2) / 20)).toMatchObject({ roll: PERCEPTION_DC - 1, success: false });
  });
});

describe("verdictFor", () => {
  it("names a 20 and a 1 as critical", () => {
    expect(verdictFor({ roll: 20, success: true }).label).toBe("Critical Success");
    expect(verdictFor({ roll: 1, success: false }).label).toBe("Critical Failure");
  });

  it("keeps the label plain for every roll in between", () => {
    expect(verdictFor({ roll: 12, success: true }).label).toBe("Success");
    expect(verdictFor({ roll: 3, success: false }).label).toBe("Failure");
  });
});
