import { describe, expect, it } from "vitest";
import { frameAt, leanRows, ovalRows, pixelsToPaths, spinSchedule, spritePaths, turnRows, typingEnds, wobbleKeyframes, wobbleSchedule } from "./helpers";

describe("pixelsToPaths", () => {
  it("puts every pixel of one color in the same path, like Claire's red jacket", () => {
    const paths = pixelsToPaths([
      { x: 0, y: 0, color: "#c0392b" },
      { x: 1, y: 0, color: "#c0392b" },
    ]);
    expect(paths).toEqual([{ color: "#c0392b", d: "M0 0h1v1h-1zM1 0h1v1h-1z" }]);
  });

  it("keeps the colors in the order Malenia's sprite shows them", () => {
    const paths = pixelsToPaths([
      { x: 0, y: 0, color: "#c9302c" },
      { x: 0, y: 1, color: "#e8c35a" },
      { x: 1, y: 1, color: "#c9302c" },
    ]);
    expect(paths.map(({ color }) => color)).toEqual(["#c9302c", "#e8c35a"]);
  });

  it("draws nothing for an empty sprite", () => {
    expect(pixelsToPaths()).toEqual([]);
  });
});

describe("typingEnds", () => {
  it("knows when Inde's love note to Claire finishes printing", () => {
    expect(typingEnds("te amo", 1, 0.05)).toBe(1.3);
  });

  it("finishes right away for an empty line", () => {
    expect(typingEnds("", 2, 0.04)).toBe(2);
  });
});

describe("wobbleKeyframes", () => {
  it("rocks three times and rests in between before Malenia's catch clicks shut", () => {
    const { rotate, times } = wobbleKeyframes(3);
    expect(rotate).toHaveLength(13);
    expect(rotate.filter((angle) => angle < 0)).toHaveLength(3);
    expect(times).toHaveLength(rotate.length);
  });

  it("starts and ends at rest, spread over the whole animation", () => {
    const { rotate, times } = wobbleKeyframes(2, 10);
    expect(rotate[0]).toBe(0);
    expect(rotate.at(-1)).toBe(0);
    expect(times[0]).toBe(0);
    expect(times.at(-1)).toBe(1);
  });

  it("keeps the times climbing so framer never plays a keyframe backwards", () => {
    const { times } = wobbleKeyframes(3);
    expect(times.every((time, index) => index === 0 || time > times[index - 1])).toBe(true);
  });
});

describe("spritePaths", () => {
  it("paints the rose Inde brings to Claire from its rows and palette", () => {
    expect(spritePaths(["R.", "G"], { R: "#e0245e", G: "#2f7a32" })).toEqual([
      { color: "#e0245e", d: "M0 0h1v1h-1z" },
      { color: "#2f7a32", d: "M0 1h1v1h-1z" },
    ]);
  });
});

describe("turnRows", () => {
  it("turns Claire's love note a quarter turn clockwise", () => {
    expect(turnRows(["ab", "cd"])).toEqual(["ca", "db"]);
  });

  it("comes back to where it started after four turns, like Malenia's dance", () => {
    const rows = ["R..", "RR.", "RRR"];
    expect(turnRows(turnRows(turnRows(turnRows(rows))))).toEqual(rows);
  });
});

describe("leanRows", () => {
  it("slides the top row the whole lean and keeps the bottom planted", () => {
    expect(leanRows(["A", "B", "C"], 2)).toEqual(["....A", "...B.", "..C.."]);
  });

  it("leans the other way for a negative lean", () => {
    expect(leanRows(["A", "B"], -1)).toEqual(["A..", ".B."]);
  });

  it("keeps every frame the same width so Inde's ball never jumps", () => {
    const widths = new Set([...leanRows(["KK", "KK", "KK"], 2), ...leanRows(["KK", "KK", "KK"], -2)].map((row) => row.length));
    expect(widths).toEqual(new Set([6]));
  });
});

describe("ovalRows", () => {
  it("draws the grass platform Claire and Inde picnic on at the size asked", () => {
    const rows = ovalRows(20, 6);
    expect(rows).toHaveLength(6);
    expect(rows.every((row) => row.length === 20)).toBe(true);
  });

  it("outlines the oval and shades its bottom", () => {
    const rows = ovalRows(20, 6).join("");
    expect(rows).toContain("K");
    expect(rows).toContain("G");
    expect(rows).toContain("g");
  });

  it("leaves the corners see through", () => {
    expect(ovalRows(20, 6)[0][0]).toBe(".");
  });
});

describe("frameAt", () => {
  const schedule = [
    [1, "up"],
    [2, "leanLeft"],
  ];

  it("shows the first frame before Malenia's date starts", () => {
    expect(frameAt(schedule, 0)).toBe("up");
  });

  it("shows the last frame that has started", () => {
    expect(frameAt(schedule, 2.5)).toBe("leanLeft");
  });
});

describe("spinSchedule", () => {
  it("goes through every quarter turn and lands upright", () => {
    const frames = spinSchedule(0, 1, 1);
    expect(frames.map(([, frame]) => frame)).toEqual(["up", "right", "down", "left", "up"]);
  });

  it("spreads the turns evenly between the start and the end", () => {
    const frames = spinSchedule(2, 1, 1);
    expect(frames[0][0]).toBe(2);
    expect(frames.at(-1)[0]).toBe(3);
  });
});

describe("wobbleSchedule", () => {
  it("tips the ball the way Inde nudges it for every angle", () => {
    const frames = wobbleSchedule(1, 2, { rotate: [0, -10, 10], times: [0, 0.5, 1] });
    expect(frames).toEqual([
      [1, "up"],
      [2, "leanLeft"],
      [3, "leanRight"],
    ]);
  });
});
