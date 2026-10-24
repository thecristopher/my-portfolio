import { describe, expect, it } from "vitest";
import { triangleRows, triforceRows } from "./helpers";

describe("triangleRows", () => {
  const piece = triangleRows(16, 16);

  it("given a size, expect that many rows that wide, like the frame Claire picked for Inde's photo", () => {
    expect(piece).toHaveLength(16);
    expect(piece.every((row) => row.length === 16)).toBe(true);
  });

  it("given the tip and the base, expect a narrow top and a base that spans the whole width", () => {
    expect(piece[0].replaceAll(".", "").length).toBeLessThan(4);
    expect(piece[15]).not.toContain(".");
  });

  it("given Malenia's golden triangle, expect it outlined, lit and shaded, and mirrored in shape", () => {
    expect(piece.join("")).toMatch(/K/);
    expect(piece.join("")).toMatch(/h/);
    expect(piece.join("")).toMatch(/s/);
    expect(piece.map((row) => row.replace(/[^.]/g, "#"))).toEqual(piece.map((row) => [...row.replace(/[^.]/g, "#")].reverse().join("")));
  });
});

describe("triforceRows", () => {
  it("given one piece, expect the three stacked into a Triforce twice its size, a gift for Claire's anniversary", () => {
    const whole = triforceRows([".#.", "###"].map((row) => `${row}.`));
    expect(whole).toEqual(["...#....", "..###...", ".#...#..", "###.###."]);
  });
});
