import { describe, expect, it } from "vitest";
import { AVATAR_PALETTE, AVATAR_ROWS, BLINK_SWAPS, SMILE, WAVE_FRAMES } from "./avatarSprite";

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

describe("wave frames", () => {
  it("fit inside the sprite", () => {
    for (const rows of WAVE_FRAMES.frames) {
      expect(WAVE_FRAMES.left + rows[0].length).toBeLessThanOrEqual(AVATAR_ROWS[0].length);
      expect(WAVE_FRAMES.top + rows.length).toBeLessThanOrEqual(AVATAR_ROWS.length);
    }
  });

  it("are all the same size so the hand never jumps between them", () => {
    const sizes = new Set(WAVE_FRAMES.frames.map((rows) => `${rows.length}x${rows[0].length}`));
    expect(sizes.size).toBe(1);
  });

  it("only use palette colors", () => {
    const used = new Set(WAVE_FRAMES.frames.flat().join(""));
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
