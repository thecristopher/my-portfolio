import { describe, expect, it } from "vitest";
import { BOWGUN_ROWS, HANDGUN_ROWS, ITEM_PALETTE, LAUNCHER_ROWS, LIGHTER_ROWS, SPRAY_ROWS } from "./items";

const ITEMS = { LAUNCHER_ROWS, HANDGUN_ROWS, BOWGUN_ROWS, SPRAY_ROWS, LIGHTER_ROWS };

describe("Claire's inventory items", () => {
  it("keep every row of an item the same width, so nothing in her bag comes out bent", () => {
    for (const rows of Object.values(ITEMS)) expect(new Set(rows.map((row) => row.length)).size).toBe(1);
  });

  it("only paint colors from the item palette, the same ones Malenia would polish her blade with", () => {
    const used = new Set(Object.values(ITEMS).flat().join(""));
    used.delete(".");
    for (const char of used) expect(ITEM_PALETTE).toHaveProperty(char);
  });
});
