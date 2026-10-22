import { describe, expect, it, vi } from "vitest";
import { castMagic, hasBeenBuffed, onMagicCast } from "./magic";

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
