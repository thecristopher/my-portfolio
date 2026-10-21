import { describe, expect, it } from "vitest";
import { RUNE_PAYOUTS, formatRunes, payOnce } from "./runes";

const empty = { total: 0, paid: [] };

describe("payOnce", () => {
  it("pays Malenia for reaching the work section", () => {
    const { tally, earned } = payOnce(empty, "section", "section:work");
    expect(earned).toBe(RUNE_PAYOUTS.section);
    expect(tally.total).toBe(RUNE_PAYOUTS.section);
  });

  it("never pays Claire twice for scrolling back past the same section", () => {
    const first = payOnce(empty, "section", "section:about").tally;
    const second = payOnce(first, "section", "section:about");
    expect(second.earned).toBe(0);
    expect(second.tally).toBe(first);
  });

  it("pays Inde for downloading the resume on top of what she already had", () => {
    const { tally } = payOnce({ total: 1000, paid: ["section:home"] }, "resume", "resume");
    expect(tally.total).toBe(1000 + RUNE_PAYOUTS.resume);
    expect(tally.paid).toEqual(["section:home", "resume"]);
  });

  it("ignores a payout it does not know", () => {
    expect(payOnce(empty, "umbrella-bonus", "x").earned).toBe(0);
  });
});

describe("formatRunes", () => {
  it("groups thousands like the in game counter", () => {
    expect(formatRunes(1234567)).toBe("1,234,567");
  });
});
