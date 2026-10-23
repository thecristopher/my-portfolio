import { describe, expect, it, vi } from "vitest";
import { cardSetCode, castMagic, hasBeenBuffed, monsterLevel, onMagicCast } from "./magic";

describe("castMagic", () => {
  it("reaches the skills section that is listening", () => {
    const skills = new EventTarget();
    const handler = vi.fn();
    onMagicCast(handler, skills);
    castMagic(skills);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("leaves a listener in peace once it unsubscribed", () => {
    const skills = new EventTarget();
    const handler = vi.fn();
    const stopListening = onMagicCast(handler, skills);
    stopListening();
    castMagic(skills);
    expect(handler).not.toHaveBeenCalled();
  });

  it("casts calmly without throwing when there is no window", () => {
    expect(() => castMagic(undefined)).not.toThrow();
  });
});

describe("hasBeenBuffed", () => {
  it("keeps the buff for Inde, who summoned the magician on an earlier visit", () => {
    expect(hasBeenBuffed(["triforce", "magician"])).toBe(true);
  });

  it("waits for Claire's first cast before buffing", () => {
    expect(hasBeenBuffed(["triforce"])).toBe(false);
    expect(hasBeenBuffed()).toBe(false);
  });
});

describe("monsterLevel", () => {
  it("gives Malenia's 2500 ATK leadership card seven stars, like Dark Magician herself", () => {
    expect(monsterLevel(2500)).toBe(7);
  });

  it("keeps Claire's 1900 ATK quality card a level 5 tribute", () => {
    expect(monsterLevel(1900)).toBe(5);
  });

  it("never drops Inde's love note below one star", () => {
    expect(monsterLevel(0)).toBe(1);
    expect(monsterLevel()).toBe(1);
  });

  it("caps Radahn's absurd ATK at twelve stars", () => {
    expect(monsterLevel(9000)).toBe(12);
  });
});

describe("cardSetCode", () => {
  it("prints the first card of the deck as CRIS-EN001", () => {
    expect(cardSetCode(0)).toBe("CRIS-EN001");
  });

  it("numbers the anniversary card Inde slipped in twelfth as CRIS-EN012", () => {
    expect(cardSetCode(11)).toBe("CRIS-EN012");
  });
});
