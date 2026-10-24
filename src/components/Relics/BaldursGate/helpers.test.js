import { afterEach, describe, expect, it, vi } from "vitest";
import {
  D20_FACETS,
  D20_PALETTE,
  crackRows,
  d20Rows,
  facetRows,
  numberRows,
  outlineRows,
  CRITICAL_BONUS,
  FAILURE_LINE,
  SUCCESS_LINE,
  VERDICT_LOOKS,
  cleanFace,
  faceToShow,
  isValidRoll,
  nextFlickerFace,
  rollWithPatience,
} from "./helpers";

// Claire rolls Persuasion to ask Inde on a second date, and the API agrees
const claireAsksInde = { roll: 17, dc: 8, success: true, message: "Persuasion passed. See you Friday, Inde." };

describe("isValidRoll", () => {
  it("accepts Claire's 17 on her persuasion check", () => {
    expect(isValidRoll(claireAsksInde)).toBe(true);
  });

  it("rejects a 21, since the die stops at 20", () => {
    expect(isValidRoll({ ...claireAsksInde, roll: 21 })).toBe(false);
  });

  it("rejects a roll that arrives without a verdict", () => {
    expect(isValidRoll({ roll: 12 })).toBe(false);
  });

  it("rejects an empty answer", () => {
    expect(isValidRoll(null)).toBe(false);
  });
});

describe("rollWithPatience", () => {
  afterEach(() => vi.useRealTimers());

  it("uses the API's roll when it answers in time", async () => {
    await expect(rollWithPatience(async () => claireAsksInde)).resolves.toEqual(claireAsksInde);
  });

  it("rolls locally when the API is offline, and Malenia still gets her natural 20", async () => {
    const result = await rollWithPatience(() => Promise.reject(new Error("offline")), { random: () => 0.99 });
    expect(result.roll).toBe(20);
  });

  it("rolls locally when the API answers with words instead of a number", async () => {
    const result = await rollWithPatience(async () => ({ roll: "twenty" }), { random: () => 0 });
    expect(result.roll).toBe(1);
  });

  it("rolls locally once the patience runs out, so Inde gets their answer anyway", async () => {
    vi.useFakeTimers();
    const pending = rollWithPatience(() => new Promise(() => {}), { patienceMs: 1500, random: () => 0.5 });
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toMatchObject({ roll: 11, success: true });
  });
});

describe("nextFlickerFace", () => {
  it("moves on to a fresh face instead of showing the 20 again", () => {
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

  it("returns null for a saved face that isn't a real d20 number", () => {
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

  it("shows a 20 when there is no last face to bring back", () => {
    expect(faceToShow(true, null)).toBe(20);
  });
});

describe("VERDICT_LOOKS", () => {
  it("cheers every success with the party line", () => {
    expect(VERDICT_LOOKS.critical.line).toBe(SUCCESS_LINE);
    expect(VERDICT_LOOKS.success.line).toBe(SUCCESS_LINE);
  });

  it("brings the whole party along only on a natural 20", () => {
    const bonuses = Object.entries(VERDICT_LOOKS).filter(([, look]) => look.bonus);
    expect(bonuses).toEqual([["critical", expect.objectContaining({ bonus: CRITICAL_BONUS })]]);
  });

  it("points every missed check toward the email, so the conversation keeps going", () => {
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

describe("numberRows", () => {
  it("prints Inde's lucky 7 in the 3 by 5 pixel font", () => {
    expect(numberRows(7)).toEqual(["nnn", "..n", "..n", ".n.", ".n."]);
  });

  it("puts a one pixel gap between the digits of a 14", () => {
    expect(numberRows(14)[0]).toBe(".n..n.n");
  });
});

describe("facetRows", () => {
  const facets = facetRows(24);

  it("lights the front face in the middle of the die", () => {
    expect(facets[12][12]).toBe("H");
  });

  it("leaves the corners outside the hexagon empty", () => {
    expect(facets[0][0]).toBe(".");
    expect(facets[23][23]).toBe(".");
  });
});

describe("outlineRows", () => {
  it("wraps Malenia's rose in an outline without touching the rose itself", () => {
    expect(outlineRows(["...", ".R.", "..."])).toEqual([".K.", "KRK", ".K."]);
  });
});

describe("d20Rows", () => {
  it("draws the die on a square grid the size it was asked for", () => {
    const rows = d20Rows(24, 20);
    expect(rows).toHaveLength(24);
    rows.forEach((row) => expect(row).toHaveLength(24));
  });

  it("prints the face number on the die", () => {
    expect(d20Rows(24, 20).join("")).toContain("n");
  });

  it("only uses colors the die's palette knows", () => {
    const used = new Set(d20Rows(40, 18).join("").replaceAll(".", ""));
    used.forEach((char) => expect(D20_PALETTE).toHaveProperty(char));
  });
});

describe("crackRows", () => {
  it("splits the die from the top down to the bottom on a natural 1", () => {
    const rows = crackRows(40);
    expect(rows[1]).toContain("c");
    expect(rows[38]).toContain("c");
  });
});
