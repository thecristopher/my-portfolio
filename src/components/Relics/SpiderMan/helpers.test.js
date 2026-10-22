import { describe, expect, it } from "vitest";
import { pointOn, spokeAngles, squigglePath, starburstPoints, tendrilPath, webRing } from "./helpers";

describe("pointOn", () => {
  it("finds the point straight right of the middle at angle zero", () => {
    expect(pointOn([50, 50], 0, 10)).toEqual([60, 50]);
  });

  it("stretches the circle taller when asked, like the web on the Halloween mask Inde made for Claire", () => {
    expect(pointOn([0, 0], Math.PI / 2, 10, 1.5)).toEqual([0, 15]);
  });
});

describe("spokeAngles", () => {
  it("spaces Malenia's four spokes a quarter turn apart", () => {
    expect(spokeAngles(4)).toEqual([0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]);
  });

  it("turns the whole set by a fraction of a gap", () => {
    expect(spokeAngles(4, 0.5)[0]).toBeCloseTo(Math.PI / 4);
  });
});

describe("webRing", () => {
  const ring = webRing({ center: [50, 50], radius: 10, spokes: spokeAngles(4) });

  it("starts on the first spoke", () => {
    expect(ring.startsWith("M60 50 ")).toBe(true);
  });

  it("hops once per spoke and comes back around to where it started", () => {
    expect(ring.match(/Q/g)).toHaveLength(4);
    expect(ring.endsWith(" 60 50")).toBe(true);
  });

  it("sags toward the middle between spokes", () => {
    const [, sagX, sagY] = ring.match(/Q(\S+) (\S+)/).map(Number);
    expect(Math.hypot(sagX - 50, sagY - 50)).toBeCloseTo(8.4, 0);
  });
});

describe("squigglePath", () => {
  const squiggle = squigglePath({ center: [0, 0], angle: 0, from: 10, to: 20, zigs: 4, amplitude: 2 });

  it("has one point per zig plus the start", () => {
    expect(squiggle.match(/[ML]/g)).toHaveLength(5);
  });

  it("starts and ends right on the ray, like Inde's heartbeat when Claire walks in", () => {
    expect(squiggle.startsWith("M10 0 ")).toBe(true);
    expect(squiggle.endsWith("L20 0")).toBe(true);
  });

  it("kicks the points in between out to alternating sides", () => {
    expect(squiggle).toContain("L12.5 -2");
    expect(squiggle).toContain("L15 2");
  });
});

describe("starburstPoints", () => {
  it("gives a tip and a notch for every spike", () => {
    expect(starburstPoints({ spikes: 6, outer: 40, inner: 30 }).split(" ")).toHaveLength(12);
  });

  it("points the first tip straight up", () => {
    expect(starburstPoints({ spikes: 6, outer: 40, inner: 30 }).split(" ")[0]).toBe("50,10");
  });
});

describe("tendrilPath", () => {
  const tendril = tendrilPath({ baseX: 50, baseWidth: 10, tipX: 40, tipY: 30 });

  it("rises out of the ground at both sides of its base", () => {
    expect(tendril.startsWith("M45 105 ")).toBe(true);
    expect(tendril).toContain("55 105 Z");
  });

  it("reaches its tip right where Claire pointed", () => {
    expect(tendril).toContain(" 40 30 C");
  });
});
