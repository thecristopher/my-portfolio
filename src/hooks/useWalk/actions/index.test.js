import { describe, expect, it } from "vitest";
import { stepWalk } from ".";

describe("stepWalk", () => {
  it("given the scroll moving down the page, expect Claire walking right toward the date", () => {
    expect(stepWalk(0.2, 0.25, "left")).toEqual({ facing: "right", hasMoved: true });
  });

  it("given the scroll moving back up, expect Inde turning around to walk left", () => {
    expect(stepWalk(0.5, 0.4, "right")).toEqual({ facing: "left", hasMoved: true });
  });

  it("given only a tiny spring wobble, expect Malenia to stand still and keep facing the same way", () => {
    expect(stepWalk(0.5, 0.5001, "left")).toEqual({ facing: "left", hasMoved: false });
  });
});
