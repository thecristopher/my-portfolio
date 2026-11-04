import { describe, expect, it } from "vitest";
import { pointOnCircle } from "./geometry";

describe("pointOnCircle", () => {
  it("puts zero degrees at the top, where Malenia's blade points", () => {
    expect(pointOnCircle(0, 10)).toEqual({ x: 0, y: -10 });
  });

  it("runs clockwise, so ninety degrees lands to the right like a clock at three", () => {
    expect(pointOnCircle(90, 10)).toEqual({ x: 10, y: 0 });
  });

  it("moves with the center Claire picks", () => {
    expect(pointOnCircle(180, 4, { x: 32, y: 32 })).toEqual({ x: 32, y: 36 });
  });
});
