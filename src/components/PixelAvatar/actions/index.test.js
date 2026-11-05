import { describe, expect, it } from "vitest";
import { layOutPixelText, outlineCells, shiftTransform } from ".";

describe("shiftTransform", () => {
  it("given a lean, expect a translate by those whole pixels, like Claire leaning in for a kiss", () => {
    expect(shiftTransform([-3, 2])).toBe("translate(-3 2)");
  });

  it("given no lean, expect nothing so Malenia's layer stays exactly where it was drawn", () => {
    expect(shiftTransform([0, 0])).toBeUndefined();
    expect(shiftTransform()).toBeUndefined();
  });
});

describe("layOutPixelText", () => {
  it("given Inde's two letter word, expect both letters side by side with one pixel between them", () => {
    const { width, height } = layOutPixelText("HI");
    expect(width).toBe(7);
    expect(height).toBe(5);
  });

  it("given lower case, expect Claire's shout drawn in capitals all the same", () => {
    expect(layOutPixelText("hits")).toEqual(layOutPixelText("HITS"));
  });

  it("given a letter the font doesn't know, expect Malenia's note to skip it instead of breaking", () => {
    expect(layOutPixelText("H?I").width).toBe(layOutPixelText("HI").width);
  });

  it("given nothing to say, expect no width and no cells", () => {
    expect(layOutPixelText("")).toEqual({ width: 0, height: 5, cells: [] });
  });
});

describe("outlineCells", () => {
  it("given one lit cell, expect it wrapped in a three by three block", () => {
    expect(outlineCells([{ x: 4, y: 2 }])).toHaveLength(9);
  });

  it("given two touching cells from Claire's love note, expect the shared border counted once", () => {
    expect(outlineCells([{ x: 0, y: 0 }, { x: 1, y: 0 }])).toHaveLength(12);
  });
});
