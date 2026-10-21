import { afterEach, describe, expect, it, vi } from "vitest";
import {
  D20_FACETS,
  FAILURE_LINE,
  SUCCESS_LINE,
  VERDICT_LOOKS,
  cleanFace,
  faceToShow,
  isValidRoll,
  nextFlickerFace,
  rollWithPatience,
} from "./helpers";

// Claire persuades Inde to a second date, and the API agrees
const claireAsksInde = { roll: 17, dc: 8, success: true, message: "Check passed. Nice roll." };

describe("isValidRoll", () => {
  it("trusts Claire's 17", () => {
    expect(isValidRoll(claireAsksInde)).toBe(true);
  });

  it("refuses a face the die doesn't have", () => {
    expect(isValidRoll({ ...claireAsksInde, roll: 21 })).toBe(false);
  });

  it("refuses an answer with no verdict", () => {
    expect(isValidRoll({ roll: 12 })).toBe(false);
  });

  it("refuses nothing at all", () => {
    expect(isValidRoll(null)).toBe(false);
  });
});

describe("rollWithPatience", () => {
  afterEach(() => vi.useRealTimers());

  it("uses the API's roll when it answers in time", async () => {
    await expect(rollWithPatience(async () => claireAsksInde)).resolves.toEqual(claireAsksInde);
  });

  it("rolls locally when the API fails, so Malenia still gets her natural 20", async () => {
    const result = await rollWithPatience(() => Promise.reject(new Error("offline")), { random: () => 0.99 });
    expect(result.roll).toBe(20);
  });

  it("rolls locally when the API answers nonsense", async () => {
    const result = await rollWithPatience(async () => ({ roll: "twenty" }), { random: () => 0 });
    expect(result.roll).toBe(1);
  });

  it("stops waiting once the patience runs out", async () => {
    vi.useFakeTimers();
    const pending = rollWithPatience(() => new Promise(() => {}), { patienceMs: 1500, random: () => 0.5 });
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toMatchObject({ roll: 11, success: true });
  });
});

describe("nextFlickerFace", () => {
  it("never shows the same face twice in a row", () => {
    expect(nextFlickerFace(20, () => 0.99)).toBe(1);
  });

  it("shows whatever the dice say otherwise", () => {
    expect(nextFlickerFace(3, () => 0.5)).toBe(11);
  });
});

describe("cleanFace", () => {
  it("keeps the 14 Inde rolled on their anniversary", () => {
    expect(cleanFace(14)).toBe(14);
  });

  it("drops a broken save", () => {
    expect(cleanFace(37)).toBeNull();
    expect(cleanFace("20")).toBeNull();
  });
});

describe("faceToShow", () => {
  it("shows a proud 20 before the first roll", () => {
    expect(faceToShow(false, 6)).toBe(20);
  });

  it("shows the last face once it has been rolled", () => {
    expect(faceToShow(true, 6)).toBe(6);
  });

  it("falls back to 20 when the last face was lost", () => {
    expect(faceToShow(true, null)).toBe(20);
  });
});

describe("VERDICT_LOOKS", () => {
  it("cheers every success with the party line", () => {
    expect(VERDICT_LOOKS.critical.line).toBe(SUCCESS_LINE);
    expect(VERDICT_LOOKS.success.line).toBe(SUCCESS_LINE);
  });

  it("nudges every failure toward the email", () => {
    expect(VERDICT_LOOKS.failure.line).toBe(FAILURE_LINE);
    expect(VERDICT_LOOKS.fumble.line).toBe(FAILURE_LINE);
  });

  it("cracks only on a natural 1", () => {
    const cracks = Object.entries(VERDICT_LOOKS).filter(([, look]) => look.flourish === "crack");
    expect(cracks.map(([tone]) => tone)).toEqual(["fumble"]);
  });
});

describe("D20_FACETS", () => {
  it("draws the ten faces you can see from the front", () => {
    expect(D20_FACETS).toHaveLength(10);
  });
});
