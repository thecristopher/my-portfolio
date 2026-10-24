import { describe, expect, it } from "vitest";
import {
  BEATS,
  circlePath,
  crackleBolts,
  crackleJoints,
  crackleTimes,
  floorCircleLines,
  floorGlyphPixels,
  glyphMarks,
  haloPixels,
  hexagramPaths,
  lightningBolt,
  linePixels,
  pathPixels,
  pixelPath,
  pointOnCircle,
  regularPolygon,
  seededRandom,
  splitRuns,
  toFloor,
  toPolyline,
} from "./helpers";

const floor = { cx: 50, cy: 36, rx: 46, ry: 19 };

describe("pointOnCircle", () => {
  it("puts angle zero straight up, like noon on the clock Claire set for her lunch date with Inde", () => {
    expect(pointOnCircle(50, 50, 10, 0)).toEqual({ x: 50, y: 40 });
  });

  it("puts a quarter turn on the right", () => {
    expect(pointOnCircle(50, 50, 10, Math.PI / 2)).toEqual({ x: 60, y: 50 });
  });
});

describe("circlePath", () => {
  it("starts and ends at the top so Malenia's circle draws itself in one stroke", () => {
    const path = circlePath(50, 50, 40);
    expect(path.startsWith("M50 10")).toBe(true);
    expect(path.endsWith("50 10")).toBe(true);
  });
});

describe("regularPolygon", () => {
  it("gives a triangle three corners, the first one on top", () => {
    const corners = regularPolygon(50, 50, 30, 3);
    expect(corners).toHaveLength(3);
    expect(corners[0]).toEqual({ x: 50, y: 20 });
  });
});

describe("hexagramPaths", () => {
  it("draws one triangle pointing up and one pointing down", () => {
    const [up, down] = hexagramPaths(50, 50, 30);
    expect(up.startsWith("M50 20")).toBe(true);
    expect(down.startsWith("M50 80")).toBe(true);
  });
});

describe("glyphMarks", () => {
  it("spreads Inde's love notes evenly around the band, cycling through the glyph kinds", () => {
    const marks = glyphMarks(50, 50, 43, 6);
    expect(marks).toHaveLength(6);
    expect(marks.map(({ kind }) => kind)).toEqual(["tick", "dot", "bar", "tick", "dot", "bar"]);
    marks.forEach(({ x, y }) => expect(Math.hypot(x - 50, y - 50)).toBeCloseTo(43, 1));
  });
});

describe("seededRandom", () => {
  it("gives Claire and Inde the same sequence when they share a seed", () => {
    const claire = seededRandom(1998);
    const inde = seededRandom(1998);
    expect([claire(), claire(), claire()]).toEqual([inde(), inde(), inde()]);
  });

  it("stays between 0 and 1", () => {
    const random = seededRandom(7);
    Array.from({ length: 50 }, random).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });
});

describe("lightningBolt", () => {
  it("keeps both ends exactly where the bolt starts and lands", () => {
    const bolt = lightningBolt({ x: 0, y: 0 }, { x: 60, y: 0 }, { segments: 6, random: seededRandom(3) });
    expect(bolt).toHaveLength(7);
    expect(bolt[0]).toEqual({ x: 0, y: 0 });
    expect(bolt.at(-1)).toEqual({ x: 60, y: 0 });
  });

  it("kicks the joints sideways, never past the jitter", () => {
    const bolt = lightningBolt({ x: 0, y: 0 }, { x: 60, y: 0 }, { jitter: 4, random: seededRandom(11) });
    const kicks = bolt.slice(1, -1).map(({ y }) => Math.abs(y));
    expect(Math.max(...kicks)).toBeGreaterThan(0);
    kicks.forEach((kick) => expect(kick).toBeLessThanOrEqual(4));
  });

  it("runs straight when the random sits in the middle", () => {
    const bolt = lightningBolt({ x: 0, y: 0 }, { x: 0, y: 30 }, { segments: 3, random: () => 0.5 });
    expect(bolt).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 0, y: 20 },
      { x: 0, y: 30 },
    ]);
  });
});

describe("toPolyline", () => {
  it("writes the joints the way an svg polyline reads them", () => {
    expect(toPolyline([{ x: 1, y: 2 }, { x: 3, y: 4 }])).toBe("1,2 3,4");
  });
});

describe("crackleBolts", () => {
  it("grows the asked number of bolts", () => {
    expect(crackleBolts({ count: 8, floor, random: seededRandom(5) })).toHaveLength(8);
  });

  it("starts every bolt on the rim of the circle on the floor", () => {
    crackleBolts({ count: 6, floor, random: seededRandom(9) }).forEach((bolt) => {
      const [x, y] = bolt.split(" ")[0].split(",").map(Number);
      expect(((x - floor.cx) / floor.rx) ** 2 + ((y - floor.cy) / floor.ry) ** 2).toBeCloseTo(1, 1);
    });
  });

  it("grows a fresh shape on every call, so the sparks Malenia watches never repeat", () => {
    const random = seededRandom(21);
    expect(crackleBolts({ floor, random })).not.toEqual(crackleBolts({ floor, random }));
  });
});

describe("crackleTimes", () => {
  it("keeps every spark inside the stretch and in order", () => {
    const times = crackleTimes(0.4, 1.6, 14);
    expect(times).toHaveLength(14);
    expect(times[0]).toBeGreaterThanOrEqual(0.4);
    expect(times.at(-1)).toBeLessThan(1.6);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("never spaces two sparks evenly in a row", () => {
    const times = crackleTimes(0, 1, 10);
    const gaps = times.slice(1).map((time, index) => Math.round((time - times[index]) * 1000));
    expect(new Set(gaps).size).toBeGreaterThan(1);
  });
});

describe("BEATS", () => {
  it("claps, stamps, speaks, then transmutes the gift, all inside six seconds", () => {
    expect(BEATS.clap).toBeLessThan(BEATS.stamp);
    expect(BEATS.stamp).toBeLessThan(BEATS.title);
    expect(BEATS.title).toBeLessThan(BEATS.narration);
    expect(BEATS.narration).toBeLessThan(BEATS.payoff);
    expect(BEATS.payoff).toBeLessThan(BEATS.tagline);
    expect(BEATS.tagline * 1000).toBeLessThan(BEATS.lastsMs);
    expect(BEATS.lastsMs).toBeGreaterThanOrEqual(3000);
    expect(BEATS.lastsMs).toBeLessThanOrEqual(6000);
  });
});

describe("crackleJoints", () => {
  it("gives the same bolts crackleBolts prints, as joints", () => {
    const joints = crackleJoints({ count: 4, floor, random: seededRandom(14) });
    expect(joints.map(toPolyline)).toEqual(crackleBolts({ count: 4, floor, random: seededRandom(14) }));
  });
});

describe("linePixels", () => {
  it("draws Claire's straight road to Inde's place one pixel per step", () => {
    expect(linePixels({ x: 0, y: 0 }, { x: 3, y: 0 })).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ]);
  });

  it("steps along the longer side so a steep line never leaves a gap", () => {
    const pixels = linePixels({ x: 0, y: 0 }, { x: 1, y: 4 });
    expect(pixels).toHaveLength(5);
    expect(pixels.at(-1)).toEqual({ x: 1, y: 4 });
  });

  it("rounds the ends onto the grid", () => {
    expect(linePixels({ x: 0.4, y: 0.6 }, { x: 0.4, y: 0.6 })).toEqual([{ x: 0, y: 1 }]);
  });
});

describe("pathPixels", () => {
  it("follows Malenia's path through every joint without drawing a corner twice", () => {
    const pixels = pathPixels([
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
    ]);
    expect(pixels).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
    ]);
  });
});

describe("haloPixels", () => {
  it("wraps a single spark in a plus of light", () => {
    expect(haloPixels([{ x: 5, y: 5 }])).toHaveLength(5);
  });

  it("counts a shared neighbor only once", () => {
    expect(
      haloPixels([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ])
    ).toHaveLength(8);
  });
});

describe("splitRuns", () => {
  it("cuts Inde's playlist into runs of nearly the same size", () => {
    expect(splitRuns([1, 2, 3, 4, 5], 2)).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });

  it("never hands back an empty run", () => {
    expect(splitRuns([1], 4)).toEqual([[1]]);
  });
});

describe("toFloor", () => {
  it("puts the middle of the design on the middle of the floor", () => {
    expect(toFloor({ x: 50, y: 50 }, floor)).toEqual({ x: floor.cx, y: floor.cy });
  });

  it("lands the top of the outer ring on the far edge of the ellipse", () => {
    expect(toFloor({ x: 50, y: 3 }, floor)).toEqual({ x: floor.cx, y: floor.cy - floor.ry });
  });
});

describe("floorCircleLines", () => {
  it("draws the five lines of the circle Claire chalks for Malenia, in order", () => {
    expect(floorCircleLines(floor)).toHaveLength(5);
  });

  it("keeps every pixel of the outer ring on the floor", () => {
    const [outer] = floorCircleLines(floor);
    expect(outer.every(({ y }) => y >= floor.cy - floor.ry - 1 && y <= floor.cy + floor.ry + 1)).toBe(true);
  });
});

describe("floorGlyphPixels", () => {
  it("drops one whole pixel per glyph", () => {
    const glyphs = floorGlyphPixels(floor, 12);
    expect(glyphs).toHaveLength(12);
    expect(glyphs.every(({ x, y }) => Number.isInteger(x) && Number.isInteger(y))).toBe(true);
  });
});

describe("pixelPath", () => {
  it("draws the two pixels of Claire and Inde's initials as one path", () => {
    expect(
      pixelPath([
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ])
    ).toBe("M1 2h1v1h-1zM3 4h1v1h-1z");
  });

  it("draws nothing when there are no pixels", () => {
    expect(pixelPath([])).toBe("");
  });
});
