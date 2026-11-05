import { describe, expect, it } from "vitest";
import { coinCount, irisMask, irisReach, loadingLine, percentDone, trackAll } from ".";

describe("percentDone", () => {
  it("given three of Claire's four love notes delivered, expect 75", () => {
    expect(percentDone(3, 4)).toBe(75);
  });

  it("given nothing to load, expect Malenia to start already done", () => {
    expect(percentDone(0, 0)).toBe(100);
  });
});

describe("coinCount", () => {
  it("given seven percent, expect an arcade score with three digits", () => {
    expect(coinCount(7)).toBe("007");
  });

  it("given a little over a hundred, expect Inde's counter to stop at 100", () => {
    expect(coinCount(104)).toBe("100");
  });
});

describe("loadingLine", () => {
  const lines = ["Picking the playlist", "Booking the table", "Lighting the candles"];

  it("given the very start of the date, expect the first line", () => {
    expect(loadingLine(0, lines)).toBe("Picking the playlist");
  });

  it("given a full bar, expect the last line instead of running past the list", () => {
    expect(loadingLine(100, lines)).toBe("Lighting the candles");
  });
});

describe("trackAll", () => {
  it("given one task that fails, expect it still counted so Claire's loader never gets stuck", async () => {
    const seen = [];
    await trackAll([() => Promise.resolve("note"), () => Promise.reject(new Error("lost letter"))], (done, total) => seen.push([done, total]));
    expect(seen.at(-1)).toEqual([2, 2]);
  });

  it("given no tasks, expect Inde to hear zero of zero once", async () => {
    const seen = [];
    await trackAll([], (done, total) => seen.push([done, total]));
    expect(seen).toEqual([[0, 0]]);
  });
});

describe("irisMask", () => {
  it("given a radius, expect see through inside and solid one pixel past it", () => {
    expect(irisMask(40, { x: 10, y: 20 })).toBe("radial-gradient(circle at 10px 20px, transparent 40px, black 41px)");
  });
});

describe("irisReach", () => {
  it("given the iris opening from Malenia's corner, expect it to reach the far corner", () => {
    expect(irisReach({ x: 0, y: 0 }, { width: 300, height: 400 })).toBe(500);
  });

  it("given the middle of the screen, expect half the diagonal", () => {
    expect(irisReach({ x: 150, y: 200 }, { width: 300, height: 400 })).toBe(250);
  });
});
