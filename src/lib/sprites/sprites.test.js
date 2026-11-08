import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cwd } from "node:process";
import { describe, expect, it } from "vitest";
import { CERBERUS, TYRANT, ZOMBIE } from "./creatures";
import { BLAST, ECG, JILL, JILL_ROCKET, MISSILE } from "./jill";
import { METROID } from "./metroid";
import { SAMUS } from "./samus";

const SHEETS = { SAMUS, METROID, JILL, JILL_ROCKET, MISSILE, BLAST, ECG, ZOMBIE, CERBERUS, TYRANT };

// the atlas's real size, straight from its PNG header, since the sprite only knows the path vite gives it
const atlasSize = (src) => {
  const header = readFileSync(join(cwd(), src.split("?")[0]));
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
};

describe.each(Object.entries(SHEETS))("the %s sheet", (_, sheet) => {
  it("given its grid of cells, expect it to cover the whole atlas, so Claire never sees a frame stretched out of place", () => {
    const rows = Object.keys(sheet.animations).length;
    expect({ width: sheet.columns * sheet.cell.width, height: rows * sheet.cell.height }).toEqual(atlasSize(sheet.src));
  });

  it("given every animation, expect Malenia's frames to fit in its row and its rows to run in order", () => {
    Object.values(sheet.animations).forEach((animation, index) => {
      expect(animation.row).toBe(index);
      expect(animation.frames).toBeLessThanOrEqual(sheet.columns);
    });
  });

  it("given an anchor, expect it inside the cell, so Inde's character stands on the cell and not beside it", () => {
    if (!sheet.anchor) return;
    expect(sheet.anchor.x).toBeLessThan(sheet.cell.width);
    expect(sheet.anchor.y).toBeLessThan(sheet.cell.height);
  });
});
