import { describe, expect, it } from "vitest";
import { brushDelays, crestTip, foamClaws, googleFontHref, ichimatsu, waveBodyPath, waveCrests } from "./helpers";

describe("ichimatsu", () => {
  it("dresses Inde's date night kimono in Tanjiro's green and black by default", () => {
    expect(ichimatsu()).toBe("repeating-conic-gradient(#1f7a4d 0 25%, #121212 0 50%) 0 0 / 2.5rem 2.5rem");
  });

  it("uses the colors and tile size Malenia picks for her own kimono", () => {
    expect(ichimatsu({ green: "#c33", black: "#fff", size: "1rem" })).toBe("repeating-conic-gradient(#c33 0 25%, #fff 0 50%) 0 0 / 1rem 1rem");
  });
});

describe("waveCrests", () => {
  const crests = waveCrests({ start: 10, count: 3, crestWidth: 40, height: 20 });

  it("lines the crests up edge to edge from where the wave starts", () => {
    expect(crests.map(({ x }) => x)).toEqual([10, 50, 90]);
  });

  it("lowers every other crest a little, like the waves Claire and Inde watched on their beach date", () => {
    expect(crests.map(({ height }) => height)).toEqual([20, 14.4, 20]);
  });
});

describe("waveBodyPath", () => {
  const crests = waveCrests({ count: 2, crestWidth: 50, height: 20 });
  const path = waveBodyPath(crests, { baseline: 40, thickness: 20 });

  it("starts on the baseline at the left edge", () => {
    expect(path.startsWith("M0 40 ")).toBe(true);
  });

  it("closes the shape so it can be filled", () => {
    expect(path.endsWith("Z")).toBe(true);
  });

  it("reaches down to the bottom of the water at the right edge", () => {
    expect(path).toContain("L100 60");
  });

  it("draws four curves per crest along the top", () => {
    expect(path.match(/C/g)).toHaveLength(8);
  });
});

describe("crestTip", () => {
  it("finds the tip where the curl of the wave lands", () => {
    expect(crestTip({ x: 0, width: 100, height: 20 }, 50)).toEqual([95, 39]);
  });
});

describe("foamClaws", () => {
  const crest = { x: 0, width: 100, height: 20 };

  it("hangs one foam claw per finger asked for", () => {
    expect(foamClaws(crest, 50, 5)).toHaveLength(5);
  });

  it("starts the first claw on the lip and the last one on the tip", () => {
    const claws = foamClaws(crest, 50, 3);
    expect(claws[0].startsWith("M62 30 ")).toBe(true);
    expect(claws[2].startsWith("M95 39 ")).toBe(true);
  });

  it("still hangs a single claw from the tip", () => {
    expect(foamClaws(crest, 50, 1)[0].startsWith("M95 39 ")).toBe(true);
  });
});

describe("brushDelays", () => {
  it("paints Claire's love note to Inde one glyph after another", () => {
    expect(brushDelays(["全集中"], { startAt: 1, perGlyph: 0.1 })).toEqual([[1, 1.1, 1.2]]);
  });

  it("takes a breath before starting the next column", () => {
    expect(brushDelays(["水", "の"], { perGlyph: 0.1, columnPause: 0.5 })).toEqual([[0], [0.6]]);
  });

  it("gives a space its beat too", () => {
    expect(brushDelays(["壱 型"], { perGlyph: 0.1 })[0]).toEqual([0, 0.1, 0.2]);
  });
});

describe("googleFontHref", () => {
  it("asks for the font family with spaces turned into plus signs", () => {
    expect(googleFontHref("Dot Gothic", "炭")).toMatch(/family=Dot\+Gothic&/);
  });

  it("ships each glyph of Inde's love note only once and skips the spaces", () => {
    const href = googleFontHref("DotGothic16", "水の 水の");
    expect(decodeURIComponent(href.split("text=")[1].split("&")[0])).toBe("水の");
  });

  it("asks the browser to show the fallback while Claire waits for the font", () => {
    expect(googleFontHref("DotGothic16", "全")).toMatch(/&display=swap$/);
  });
});
