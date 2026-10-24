import { describe, expect, it } from "vitest";
import { BEATS, HUD_LINES, HUD_TIMING, LIT_WINDOWS, SKYLINE, ovalRows, rainStreaks, scheduleLines, skylineRows, spriteAspect, stampCentered } from "./helpers";
import { BAT_ROWS, BOLT_ROWS, CLOUD_ROWS, LAMP_ROWS, SMALL_BAT_ROWS } from "./sprites";

describe("scheduleLines", () => {
  // Claire's case file is really a dinner invitation
  const notes = [
    { label: "TO", value: "Inde Navarrete" },
    { label: "FROM", value: "Claire Redfield" },
  ];

  it("starts typing Claire's note to Inde right on time", () => {
    const [first] = scheduleLines(notes, { startAt: 1, perLetter: 0.1, pause: 0.5 });
    expect(first.text).toBe("TO: Inde Navarrete");
    expect(first.at).toBe(1);
  });

  it("starts the next line once the first finishes typing, after a short pause", () => {
    const [first, second] = scheduleLines(notes, { startAt: 0, perLetter: 0.1, pause: 0.5 });
    expect(second.at).toBeCloseTo(first.endsAt + 0.5);
  });

  it("returns an empty schedule when there is nothing to type", () => {
    expect(scheduleLines([], HUD_TIMING)).toEqual([]);
  });

  it("finishes the case file before CASE CLOSED stamps", () => {
    const lines = scheduleLines(HUD_LINES, HUD_TIMING);
    expect(lines.at(-1).endsAt).toBeLessThan(BEATS.closed);
  });
});

describe("BEATS", () => {
  it("plays every beat in order inside the 3 to 7 second window", () => {
    const times = Object.values(BEATS);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(BEATS.end).toBeGreaterThanOrEqual(3);
    expect(BEATS.end).toBeLessThanOrEqual(7);
  });
});

describe("rainStreaks", () => {
  it("makes one streak per drop for Claire and Inde's rooftop walk, all inside the screen", () => {
    const rain = rainStreaks(40);
    expect(rain).toHaveLength(40);
    rain.forEach(({ left }) => expect(left).toBeGreaterThanOrEqual(0));
    rain.forEach(({ left }) => expect(left).toBeLessThan(100));
  });

  it("falls the same way on every render so the night stays steady", () => {
    expect(rainStreaks(12)).toEqual(rainStreaks(12));
  });
});

describe("skylineRows", () => {
  const skyline = skylineRows(SKYLINE, { scale: 2, windows: LIT_WINDOWS });

  it("draws Gotham at half the size of its 400 by 120 box", () => {
    expect(skyline).toHaveLength(60);
    skyline.forEach((row) => expect(row).toHaveLength(200));
  });

  it("leaves a gap between the towers in the middle, where the signal shines up", () => {
    expect(skyline.at(-1)[100]).toBe(".");
    expect(skyline.at(-1)[0]).toBe("B");
  });

  it("keeps a window lit for Claire, waiting up for Inde", () => {
    expect(skyline.join("")).toContain("w");
  });

  it("lights the roofline so the towers read against the night", () => {
    const roofRow = skyline.findIndex((row) => row[0] !== ".");
    expect(skyline[roofRow][0]).toBe("b");
    expect(skyline[roofRow + 1][0]).toBe("B");
  });

  it("raises a spire above the tallest tower's roof", () => {
    const tallest = skylineRows([{ x: 0, width: 40, height: 100, spire: true }], { scale: 2 });
    const plain = skylineRows([{ x: 0, width: 40, height: 100 }], { scale: 2 });
    expect(tallest[5]).not.toBe(".".repeat(200));
    expect(plain[5]).toBe(".".repeat(200));
  });
});

describe("ovalRows", () => {
  const oval = ovalRows(22, 14);

  it("burns hot white in the middle of the signal", () => {
    expect(oval[7][11]).toBe("y");
  });

  it("wraps the light in a dark outline and leaves the corners empty", () => {
    expect(oval[7][0]).toBe("K");
    expect(oval[0][0]).toBe(".");
  });

  it("keeps the size it was asked for", () => {
    expect(oval).toHaveLength(14);
    oval.forEach((row) => expect(row).toHaveLength(22));
  });
});

describe("stampCentered", () => {
  it("puts Malenia's rose right in the middle of the love letter", () => {
    expect(stampCentered(["....", "....", "...."], ["R"])).toEqual(["....", ".R..", "...."]);
  });

  it("lets the paper show through the see through pixels of the stamp", () => {
    expect(stampCentered(["xxx"], ["R.R"])).toEqual(["RxR"]);
  });
});

describe("sprites", () => {
  it.each([
    ["the bat", BAT_ROWS],
    ["the small bat", SMALL_BAT_ROWS],
    ["the cloud", CLOUD_ROWS],
    ["the bolt", BOLT_ROWS],
    ["the lamp", LAMP_ROWS],
  ])("draws %s on a clean rectangle", (_, rows) => {
    rows.forEach((row) => expect(row).toHaveLength(rows[0].length));
  });

  it("fits the bat inside the signal oval", () => {
    expect(BAT_ROWS[0].length).toBeLessThan(48);
    expect(SMALL_BAT_ROWS[0].length).toBeLessThan(22);
  });
});

describe("spriteAspect", () => {
  it("measures the bat as wide as its widest row and as tall as its rows", () => {
    expect(spriteAspect(BAT_ROWS)).toBe("34 / 12");
  });

  it("measures a sprite with ragged rows by its widest one", () => {
    expect(spriteAspect(["RR", "RRRR", "R"])).toBe("4 / 3");
  });
});
