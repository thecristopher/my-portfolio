import { describe, expect, it } from "vitest";
import { seededRandom, lightningBolt, toPolyline, crackleTimes, BEATS } from "./helpers";

describe("seededRandom", () => {
  it("gives Claire and Inde the same sequence when they share a seed", () => {
    const claire = seededRandom(1998);
    const inde = seededRandom(1998);
    expect([claire(), claire(), claire()]).toEqual([inde(), inde(), inde()]);
  });

  it("stays between 0 and 1", () => {
    const random = seededRandom(7);
    Array.from({ length: 50 }, random).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });
});

describe("lightningBolt", () => {
  it("keeps both ends exactly where the bolt starts and lands", () => {
    const bolt = lightningBolt({ x: 0, y: 0 }, { x: 60, y: 0 }, { segments: 6, random: seededRandom(3) });
    expect(bolt).toHaveLength(7);
    expect(bolt[0]).toEqual({ x: 0, y: 0 });
    expect(bolt.at(-1)).toEqual({ x: 60, y: 0 });
  });

  it("kicks the joints sideways, never past the jitter", () => {
    const bolt = lightningBolt({ x: 0, y: 0 }, { x: 60, y: 0 }, { jitter: 4, random: seededRandom(11) });
    const kicks = bolt.slice(1, -1).map(({ y }) => Math.abs(y));
    expect(Math.max(...kicks)).toBeGreaterThan(0);
    kicks.forEach((kick) => expect(kick).toBeLessThanOrEqual(4));
  });

  it("runs straight when the random sits in the middle", () => {
    const bolt = lightningBolt({ x: 0, y: 0 }, { x: 0, y: 30 }, { segments: 3, random: () => 0.5 });
    expect(bolt).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 0, y: 20 },
      { x: 0, y: 30 },
    ]);
  });
});

describe("toPolyline", () => {
  it("writes the joints the way an svg polyline reads them", () => {
    expect(toPolyline([{ x: 1, y: 2 }, { x: 3, y: 4 }])).toBe("1,2 3,4");
  });
});

describe("crackleTimes", () => {
  it("keeps every spark inside the stretch and in order", () => {
    const times = crackleTimes(0.4, 1.6, 14);
    expect(times).toHaveLength(14);
    expect(times[0]).toBeGreaterThanOrEqual(0.4);
    expect(times.at(-1)).toBeLessThan(1.6);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("never spaces two sparks evenly in a row", () => {
    const times = crackleTimes(0, 1, 10);
    const gaps = times.slice(1).map((time, index) => Math.round((time - times[index]) * 1000));
    expect(new Set(gaps).size).toBeGreaterThan(1);
  });
});

describe("BEATS", () => {
  it("claps, stamps, speaks, then transmutes the gift, all inside six seconds", () => {
    expect(BEATS.clap).toBeLessThan(BEATS.stamp);
    expect(BEATS.stamp).toBeLessThan(BEATS.title);
    expect(BEATS.title).toBeLessThan(BEATS.narration);
    expect(BEATS.narration).toBeLessThan(BEATS.payoff);
    expect(BEATS.payoff).toBeLessThan(BEATS.tagline);
    expect(BEATS.tagline * 1000).toBeLessThan(BEATS.lastsMs);
    expect(BEATS.lastsMs).toBeGreaterThanOrEqual(3000);
    expect(BEATS.lastsMs).toBeLessThanOrEqual(6000);
  });
});
