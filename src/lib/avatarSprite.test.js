import { describe, expect, it } from "vitest";
import {
  AVATAR_PALETTE,
  AVATAR_ROWS,
  BLINK_SWAPS,
  KICK_CHAMBER,
  KICK_EXTEND,
  LEG_ERASE,
  SMILE,
  UPPERCUT_ARM,
  WAVE_FRAMES,
} from "./avatarSprite";

describe("avatar sprite", () => {
  it("keeps every row the same width, so Claire sees him standing straight", () => {
    const widths = new Set(AVATAR_ROWS.map((row) => row.length));
    expect(widths.size).toBe(1);
  });

  it("paints every pixel from the palette, the way Inde mixed it", () => {
    const used = new Set(AVATAR_ROWS.join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });

  it("blinks into colors the palette knows, even when Malenia catches him mid wink", () => {
    for (const color of Object.values(BLINK_SWAPS)) expect(AVATAR_PALETTE).toHaveProperty(color);
  });
});

describe("wave frames", () => {
  it("fit inside the sprite, so his hello reaches Inde in one piece", () => {
    for (const rows of WAVE_FRAMES.frames) {
      expect(WAVE_FRAMES.left + rows[0].length).toBeLessThanOrEqual(AVATAR_ROWS[0].length);
      expect(WAVE_FRAMES.top + rows.length).toBeLessThanOrEqual(AVATAR_ROWS.length);
    }
  });

  it("are all the same size, so the hand glides from one frame to the next", () => {
    const sizes = new Set(WAVE_FRAMES.frames.map((rows) => `${rows.length}x${rows[0].length}`));
    expect(sizes.size).toBe(1);
  });

  it("only use palette colors, like the rest of him", () => {
    const used = new Set(WAVE_FRAMES.frames.flat().join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });
});

describe("smile", () => {
  it("grins in colors from the palette when he waves at Malenia", () => {
    const used = new Set(SMILE.rows.join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });

  it("keeps every row the same width", () => {
    expect(new Set(SMILE.rows.map((row) => row.length)).size).toBe(1);
  });
});

describe("combo poses", () => {
  const POSES = { KICK_CHAMBER, KICK_EXTEND, UPPERCUT_ARM };

  it("fit inside the sprite, from the knee Claire sees rise to the fist above his head", () => {
    for (const pose of Object.values(POSES)) {
      expect(pose.left + pose.rows[0].length).toBeLessThanOrEqual(AVATAR_ROWS[0].length);
      expect(pose.top + pose.rows.length).toBeLessThanOrEqual(AVATAR_ROWS.length);
    }
  });

  it("keep every row of a pose the same width, so nothing shears mid move", () => {
    for (const pose of Object.values(POSES)) expect(new Set(pose.rows.map((row) => row.length)).size).toBe(1);
  });

  it("only use palette colors, the same ones Inde mixed for the rest of him", () => {
    const used = new Set(Object.values(POSES).flatMap((pose) => pose.rows).join(""));
    used.delete(".");
    for (const char of used) expect(AVATAR_PALETTE).toHaveProperty(char);
  });

  it("draw the kicking leg from where the idle leg gets wiped", () => {
    expect(KICK_CHAMBER.left).toBeGreaterThanOrEqual(LEG_ERASE.minX);
    expect(KICK_EXTEND.left).toBeGreaterThanOrEqual(LEG_ERASE.minX);
  });
});
