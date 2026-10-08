import { describe, expect, it } from "vitest";
import { AVATAR_PALETTE, AVATAR_ROWS, BLINK_SWAPS, SMILE, WAVE_HAND } from "./avatarSprite";

describe("avatar sprite", () => {
  it("keeps every row the same width so nothing shears sideways", () => {
    const widths = new Set(AVATAR_ROWS.map((row) => row.length));
    expect(widths.size).toBe(1);
  });

  it("only uses characters from the palette or transparent dots", () => {
    const used = new Set(AVATAR_ROWS.join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });

  it("blinks into colors the palette knows", () => {
    for (const color of Object.values(BLINK_SWAPS)) expect(AVATAR_PALETTE).toHaveProperty(color);
  });
});

describe("wave hand", () => {
  it("fits inside the sprite", () => {
    expect(WAVE_HAND.left + WAVE_HAND.rows[0].length).toBeLessThanOrEqual(AVATAR_ROWS[0].length);
    expect(WAVE_HAND.top + WAVE_HAND.rows.length).toBeLessThanOrEqual(AVATAR_ROWS.length);
  });

  it("only uses palette colors", () => {
    const used = new Set(WAVE_HAND.rows.join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });
});

describe("smile", () => {
  it("only uses palette colors", () => {
    const used = new Set(SMILE.rows.join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });

  it("keeps every row the same width", () => {
    expect(new Set(SMILE.rows.map((row) => row.length)).size).toBe(1);
  });
});
