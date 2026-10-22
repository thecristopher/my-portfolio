import { describe, expect, it } from "vitest";
import { pixelsToPaths } from ".";

describe("pixelsToPaths", () => {
  it("joins every pixel of one color into a single path, like Claire's two red notes on the same page", () => {
    const pixels = [
      { x: 0, y: 0, color: "#d62828" },
      { x: 1, y: 0, color: "#d62828" },
    ];
    expect(pixelsToPaths(pixels)).toEqual([{ color: "#d62828", d: "M0 0h1v1h-1zM1 0h1v1h-1z" }]);
  });

  it("gives each color its own path in the order Malenia painted them", () => {
    const pixels = [
      { x: 2, y: 3, color: "#f5d77a" },
      { x: 0, y: 1, color: "#3fa9f5" },
      { x: 4, y: 5, color: "#f5d77a" },
    ];
    expect(pixelsToPaths(pixels).map((path) => path.color)).toEqual(["#f5d77a", "#3fa9f5"]);
  });

  it("draws nothing for an empty layer, ready for whatever Inde sketches next", () => {
    expect(pixelsToPaths([])).toEqual([]);
  });
});
