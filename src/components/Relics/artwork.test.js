import { describe, expect, it } from "vitest";
import { D20_EDGES, D20_FACE, D20_OUTLINE, TRIFORCE_PIECES, TWIG_HALVES, UMBRELLA_RED, UMBRELLA_WEDGES } from "./artwork";

describe("UMBRELLA_WEDGES", () => {
  it("builds the logo Claire knows from eight wedges, red and white in turn", () => {
    expect(UMBRELLA_WEDGES).toHaveLength(8);
    expect(UMBRELLA_WEDGES.filter((wedge) => wedge.fill === UMBRELLA_RED)).toHaveLength(4);
    expect(UMBRELLA_WEDGES[0].fill).not.toBe(UMBRELLA_WEDGES[1].fill);
  });
});

describe("the d20", () => {
  it("has a hexagon for its rim and a triangle for the face Malenia reads", () => {
    expect(D20_OUTLINE.split(" ")).toHaveLength(6);
    expect(D20_FACE.split(" ")).toHaveLength(3);
  });

  it("starts every inner edge on a corner of the front face", () => {
    const corners = D20_FACE.split(" ").map((corner) => corner.replace(",", " "));
    D20_EDGES.forEach((edge) => expect(corners.some((corner) => edge.startsWith(`M${corner}L`))).toBe(true));
  });
});

describe("TRIFORCE_PIECES", () => {
  it("gives Inde three triangles to put together", () => {
    expect(TRIFORCE_PIECES).toHaveLength(3);
    TRIFORCE_PIECES.forEach((piece) => expect(piece).toMatch(/Z$/));
  });
});

describe("TWIG_HALVES", () => {
  it("splits the willow into a left and a right half that meet in the middle", () => {
    expect(TWIG_HALVES.map((half) => half.side)).toEqual([-1, 1]);
    expect(TWIG_HALVES[0].d.endsWith("32 34")).toBe(true);
    expect(TWIG_HALVES[1].d.startsWith("M32 34")).toBe(true);
  });
});
