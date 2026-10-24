import { describe, expect, it } from "vitest";
import { GCPD_ROWS, LAMP_ROWS } from "./sprites";

describe("GCPD tower", () => {
  it("keeps every floor the same width, so the roof Claire waits on for Leon stands straight", () => {
    expect(new Set(GCPD_ROWS.map((row) => row.length)).size).toBe(1);
  });

  it("is wider than the searchlight, so the lamp always has a roof under it", () => {
    expect(GCPD_ROWS[0].length).toBeGreaterThan(LAMP_ROWS[0].length);
  });

  it("only paints skyline colors, the same night Malenia watches the city in", () => {
    expect(GCPD_ROWS.join("").replace(/[Bbw.]/g, "")).toBe("");
  });
});
