import { describe, expect, it } from "vitest";
import { BEATS, diamondSpots, elementBeat, erhuNote, flameRow, gustArc, gustRows, mirrorRows, rockOutline, rockRow, rockRows, shadeSilhouette, wavePath, waveRows } from "./helpers";

describe("elementBeat", () => {
  it("gives Water, Earth, Fire and Air one beat each, in order", () => {
    const beats = [0, 1, 2, 3].map(elementBeat);
    expect(beats[0]).toBe(BEATS.firstElement);
    beats.slice(1).forEach((beat, index) => expect(beat - beats[index]).toBeCloseTo(BEATS.elementGap));
  });

  it("lets Air finish before the four nations come together", () => {
    expect(elementBeat(3)).toBeLessThan(BEATS.together);
  });
});

describe("BEATS", () => {
  it("speaks the harmony line before Claire and Inde's roles, names the one who masters all four, and settles inside six seconds", () => {
    expect(BEATS.together).toBeLessThan(BEATS.harmony);
    expect(BEATS.harmony).toBeLessThan(BEATS.roles);
    expect(BEATS.roles).toBeLessThan(BEATS.master);
    expect(BEATS.master * 1000).toBeLessThan(BEATS.lastsMs);
    expect(BEATS.lastsMs).toBeGreaterThanOrEqual(3000);
    expect(BEATS.lastsMs).toBeLessThanOrEqual(6000);
  });
});

describe("diamondSpots", () => {
  it("puts the four nations at top, right, bottom and left", () => {
    expect(diamondSpots(10)).toEqual([
      { x: 0, y: -10 },
      { x: 10, y: 0 },
      { x: 0, y: 10 },
      { x: -10, y: 0 },
    ]);
  });
});

describe("wavePath", () => {
  const wave = wavePath({ width: 100, height: 40, level: 14, swell: 6, wavelength: 25 });

  it("starts on the waterline at the left edge", () => {
    expect(wave.startsWith("M0 14 Q6.25 8 12.5 14")).toBe(true);
  });

  it("reaches the right edge and fills down to the bottom like the sea Malenia swam in on their anniversary", () => {
    expect(wave).toContain("T100 14");
    expect(wave.endsWith("L100 40 L0 40 Z")).toBe(true);
  });
});

describe("gustArc", () => {
  it("starts straight up and sweeps clockwise to the right", () => {
    expect(gustArc(10, 0, 90)).toBe("M0 -10 A10 10 0 0 1 10 0");
  });

  it("takes the long way round past half a circle", () => {
    expect(gustArc(10, 0, 270)).toContain("A10 10 0 1 1");
  });
});

describe("rockOutline", () => {
  it("closes along a flat base", () => {
    expect(rockOutline(0).endsWith("100,100 0,100")).toBe(true);
  });

  it("cuts each rock differently so Inde never sees the same stone twice", () => {
    expect(rockOutline(1)).not.toBe(rockOutline(2));
  });
});

describe("rockRow", () => {
  const rocks = rockRow(7);

  it("lines the rocks up from left to right", () => {
    expect(rocks).toHaveLength(7);
    rocks.slice(1).forEach((rock, index) => expect(rock.left).toBeGreaterThan(rocks[index].left));
  });

  it("raises the middle rock first and tallest", () => {
    const middle = rocks[3];
    expect(middle.delay).toBe(0);
    rocks.forEach((rock) => expect(middle.height).toBeGreaterThanOrEqual(rock.height));
  });
});

describe("flameRow", () => {
  it("spreads the flames edge to edge with flickers that never all match", () => {
    const flames = flameRow(9);
    expect(flames[0].left).toBe(0);
    expect(flames.at(-1).left).toBe(100);
    expect(new Set(flames.map(({ flicker }) => flicker)).size).toBeGreaterThan(1);
  });
});

describe("erhuNote", () => {
  const notes = erhuNote(12, 1, 0.5);

  it("scoops up into the note from a semitone below", () => {
    const [scoop] = notes;
    expect(scoop[0]).toBe(11);
    expect(scoop[1]).toBe(1);
    expect(scoop[3].slideTo).toBe(12);
  });

  it("wobbles around the pitch for the rest of the note, like the love song Claire plays for Inde", () => {
    const held = notes.slice(1);
    expect(held.length).toBeGreaterThan(1);
    held.forEach(([pitch, , , { slideTo }]) => {
      expect([12, 12.35]).toContain(pitch);
      expect([12, 12.35]).toContain(slideTo);
      expect(pitch).not.toBe(slideTo);
    });
  });

  it("finishes about when the note should", () => {
    const [, start, length] = notes.at(-1);
    expect(start + length).toBeCloseTo(1.53, 1);
  });
});

describe("shadeSilhouette", () => {
  it("outlines Claire's love note in the dark and lights its top left edge", () => {
    expect(shadeSilhouette([".....", ".###.", ".###.", ".###.", "....."])).toEqual([".KKK.", "K++#K", "K+#-K", "K#--K", ".KKK."]);
  });

  it("leaves the empty space around Inde's sticker alone", () => {
    expect(shadeSilhouette(["...", "...", "..."])).toEqual(["...", "...", "..."]);
  });
});

describe("mirrorRows", () => {
  it("flips Malenia's candle flame left to right for its second frame", () => {
    expect(mirrorRows(["K+.", "#-K"])).toEqual([".+K", "K-#"]);
  });
});

describe("rockRows", () => {
  const rock = rockRows(2, { width: 10, height: 12 });

  it("draws a rock as wide as asked plus its outline, rising from the bottom row", () => {
    expect(rock).toHaveLength(13);
    rock.forEach((row) => expect(row).toHaveLength(12));
    expect(rock.at(-1)).toMatch(/^K[#+-]{10}K$/);
  });

  it("only uses the shaded silhouette characters, so the palette Claire picked paints all of it", () => {
    expect(rock.join("")).toMatch(/^[.K+#-]+$/);
  });

  it("gives every rock in the row its own skyline, like the cliffs on Inde's hiking date", () => {
    expect(rockRows(0)).not.toEqual(rockRows(1));
  });
});

describe("waveRows", () => {
  const wave = waveRows({ width: 20, height: 10, level: 5, swell: 2, wavelength: 10 });

  it("fills a strip exactly as big as asked", () => {
    expect(wave).toHaveLength(10);
    wave.forEach((row) => expect(row).toHaveLength(20));
  });

  it("sits an outline right on top of every lit crest", () => {
    [...wave[0]].forEach((_, x) => {
      const crest = wave.findIndex((row) => row[x] === "+");
      expect(wave[crest - 1][x]).toBe("K");
    });
  });

  it("darkens the deep water at the bottom, where Claire and Leon never swim", () => {
    expect(wave.at(-1)).toBe("-".repeat(20));
  });
});

describe("gustRows", () => {
  const arcs = [{ radius: 6, from: 0, sweep: 90, fill: "w" }];

  it("draws a quarter gust in the top right on a square grid", () => {
    const rows = gustRows(16, arcs);
    expect(rows).toHaveLength(16);
    expect(rows[1].slice(8)).toContain("w");
    expect(rows[14]).not.toContain("w");
  });

  it("turns the gust by redrawing it, so a half turn lands it in the bottom left for Malenia's dance", () => {
    const rows = gustRows(16, arcs, 180);
    expect(rows[14].slice(0, 8)).toContain("w");
    expect(rows[1]).not.toContain("w");
  });
});
