import { describe, expect, it } from "vitest";
import { PIXEL_FONT, burstPoints, coinSpray, registerPoke, rowsToPath, textToPixelPath } from "./helpers";

describe("registerPoke", () => {
  it("keeps counting while Claire lands her first two pokes", () => {
    const first = registerPoke([], 0);
    const second = registerPoke(first.pokes, 600);
    expect(second).toEqual({ pokes: [0, 600], isCombo: false });
  });

  it("lands the combo when Malenia pokes three times inside the window", () => {
    expect(registerPoke([0, 500], 1200)).toEqual({ pokes: [], isCombo: true });
  });

  it("drops the pokes Inde left hanging while she was reading a love note", () => {
    expect(registerPoke([0, 400], 3000)).toEqual({ pokes: [3000], isCombo: false });
  });

  it("lets the window and hit count be tuned for a slower date night", () => {
    expect(registerPoke([0], 4000, { hits: 2, windowMs: 5000 }).isCombo).toBe(true);
  });
});

describe("burstPoints", () => {
  it("draws two points per spike", () => {
    expect(burstPoints(8, 48, 30).split(" ")).toHaveLength(16);
  });

  it("starts the first spike straight up from the middle", () => {
    expect(burstPoints(8, 40, 20).split(" ")[0]).toBe("50,10");
  });
});

describe("coinSpray", () => {
  it("throws the middle coin straight up and highest for Claire's anniversary payout", () => {
    const coins = coinSpray(5);
    expect(coins[2]).toMatchObject({ x: 0, peak: 34 });
    expect(coins[0].peak).toBeLessThan(coins[2].peak);
  });

  it("fans the coins out evenly to both sides", () => {
    const coins = coinSpray(3);
    expect(coins[0].x).toBe(-coins[2].x);
  });

  it("keeps a single coin in the middle", () => {
    expect(coinSpray(1)).toEqual([{ x: 0, peak: 34, delay: 0 }]);
  });
});

describe("rowsToPath", () => {
  it("draws a square for every lit pixel, shifted to where the letter starts", () => {
    expect(rowsToPath(["#.", ".#"], 3)).toBe("M3 0h1v1h-1zM4 1h1v1h-1z");
  });
});

describe("textToPixelPath", () => {
  it("leaves a one pixel gap between letters when Malenia levels up", () => {
    const { width, height } = textToPixelPath("LV");
    expect(width).toBe(PIXEL_FONT.L[0].length + 1 + PIXEL_FONT.V[0].length);
    expect(height).toBe(5);
  });

  it("spells Inde's extra life with every glyph it knows", () => {
    expect(textToPixelPath("+1 LIFE").d).toContain("M");
  });

  it("spells the nine years of experience Claire wrote on his anniversary card", () => {
    const missing = [..."+9 YEARS EXP"].filter((char) => !PIXEL_FONT[char]);
    expect(missing).toEqual([]);
  });

  it("leaves a gap for letters the font doesn't have", () => {
    expect(textToPixelPath("Z")).toEqual({ d: "", width: PIXEL_FONT[" "][0].length, height: 5 });
  });

  it("draws nothing for empty text", () => {
    expect(textToPixelPath("")).toEqual({ d: "", width: 0, height: 5 });
  });
});
