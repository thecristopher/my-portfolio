import { describe, expect, it, vi } from "vitest";
import { castMagic, hasBeenBuffed, onMagicCast } from "./magic";

describe("castMagic", () => {
  it("reaches whoever is listening", () => {
    const skills = new EventTarget();
    const handler = vi.fn();
    onMagicCast(handler, skills);
    castMagic(skills);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("stops reaching a listener that unsubscribed", () => {
    const skills = new EventTarget();
    const handler = vi.fn();
    const stopListening = onMagicCast(handler, skills);
    stopListening();
    castMagic(skills);
    expect(handler).not.toHaveBeenCalled();
  });

  it("does nothing when there is no window", () => {
    expect(() => castMagic(undefined)).not.toThrow();
  });
});

describe("hasBeenBuffed", () => {
  it("keeps the buff for anyone who already summoned her", () => {
    expect(hasBeenBuffed(["triforce", "magician"])).toBe(true);
  });

  it("waits for the first cast otherwise", () => {
    expect(hasBeenBuffed(["triforce"])).toBe(false);
    expect(hasBeenBuffed()).toBe(false);
  });
});
