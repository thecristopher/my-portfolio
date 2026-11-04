import { describe, expect, it } from "vitest";
import { burstSpokes, polygonPoints, wedgePath } from ".";

describe("burstSpokes", () => {
  it("throws as many spokes as Inde asks for, evenly spaced", () => {
    const spokes = burstSpokes(8);
    expect(spokes).toHaveLength(8);
    expect(spokes[1].angle).toBe(45);
  });

  it("makes every other spoke the long one", () => {
    expect(burstSpokes(4).map((spoke) => spoke.isLong)).toEqual([true, false, true, false]);
  });
});

describe("wedgePath", () => {
  it("draws Umbrella's first wedge from the center up toward the top", () => {
    expect(wedgePath(0, 4, 10, { x: 0, y: 0 })).toBe("M0 0 L-7.07 -7.07 L7.07 -7.07 Z");
  });
});

describe("polygonPoints", () => {
  it("draws Leon a triangle with its first corner on top", () => {
    expect(polygonPoints(3, 10, { x: 0, y: 0 }).split(" ")[0]).toBe("0,-10");
  });

  it("lists one corner per side", () => {
    expect(polygonPoints(6, 10).split(" ")).toHaveLength(6);
  });
});
