import { describe, expect, it } from "vitest";
import { BEATS, HUD_LINES, HUD_TIMING, rainStreaks, scheduleLines, towerPath } from "./helpers";

describe("scheduleLines", () => {
  const notes = [
    { label: "TO", value: "Inde Navarrete" },
    { label: "FROM", value: "Claire Redfield" },
  ];

  it("starts Claire's note to Inde right on time", () => {
    const [first] = scheduleLines(notes, { startAt: 1, perLetter: 0.1, pause: 0.5 });
    expect(first.text).toBe("TO: Inde Navarrete");
    expect(first.at).toBe(1);
  });

  it("waits for the first line to finish typing before the next one starts", () => {
    const [first, second] = scheduleLines(notes, { startAt: 0, perLetter: 0.1, pause: 0.5 });
    expect(second.at).toBeCloseTo(first.endsAt + 0.5);
  });

  it("returns nothing when Malenia leaves no evidence", () => {
    expect(scheduleLines([], HUD_TIMING)).toEqual([]);
  });

  it("finishes the case file before CASE CLOSED stamps", () => {
    const lines = scheduleLines(HUD_LINES, HUD_TIMING);
    expect(lines.at(-1).endsAt).toBeLessThan(BEATS.closed);
  });
});

describe("BEATS", () => {
  it("plays the moment in order and inside the 3 to 7 second window", () => {
    const times = Object.values(BEATS);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(BEATS.end).toBeGreaterThanOrEqual(3);
    expect(BEATS.end).toBeLessThanOrEqual(7);
  });
});

describe("rainStreaks", () => {
  it("makes one streak per drop, all inside the screen", () => {
    const rain = rainStreaks(40);
    expect(rain).toHaveLength(40);
    rain.forEach(({ left }) => expect(left).toBeGreaterThanOrEqual(0));
    rain.forEach(({ left }) => expect(left).toBeLessThan(100));
  });

  it("falls the same way every time so the night never flickers between renders", () => {
    expect(rainStreaks(12)).toEqual(rainStreaks(12));
  });
});

describe("towerPath", () => {
  it("draws a plain tower as a single box", () => {
    expect(towerPath({ x: 10, width: 20, height: 50 })).toBe("M10 120 V70 H30 V120 Z");
  });

  it("puts a spire on top of the tall gothic ones", () => {
    expect(towerPath({ x: 10, width: 20, height: 50, spire: true })).toContain("L20 59");
  });
});
