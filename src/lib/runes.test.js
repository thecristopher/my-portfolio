import { describe, expect, it } from "vitest";
import { RUNE_PAYOUTS, formatRunes, payOnce } from "./runes";

const empty = { total: 0, paid: [] };

describe("payOnce", () => {
  it("rewards Malenia with runes when she reaches the work section", () => {
    const { tally, earned } = payOnce(empty, "section", "section:work");
    expect(earned).toBe(RUNE_PAYOUTS.section);
    expect(tally.total).toBe(RUNE_PAYOUTS.section);
  });

  it("keeps Claire's tally steady when she scrolls back to reread the about section", () => {
    const first = payOnce(empty, "section", "section:about").tally;
    const second = payOnce(first, "section", "section:about");
    expect(second.earned).toBe(0);
    expect(second.tally).toBe(first);
  });

  it("adds the resume reward on top of the runes Inde already saved up", () => {
    const { tally } = payOnce({ total: 1000, paid: ["section:home"] }, "resume", "resume");
    expect(tally.total).toBe(1000 + RUNE_PAYOUTS.resume);
    expect(tally.paid).toEqual(["section:home", "resume"]);
  });

  it("pays nothing for a reward it has never heard of", () => {
    expect(payOnce(empty, "anniversary-bonus", "x").earned).toBe(0);
  });
});

describe("formatRunes", () => {
  it("groups thousands like the counter Melina watches in game", () => {
    expect(formatRunes(1234567)).toBe("1,234,567");
  });
});
