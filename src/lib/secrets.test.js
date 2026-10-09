import { describe, expect, it } from "vitest";
import { migrateFound } from "./secrets";

describe("migrateFound", () => {
  it("turns an old lit bonfire into a discovered grace", () => {
    expect(migrateFound(["triforce", "bonfire"])).toEqual(["triforce", "grace"]);
  });

  it("does not count the grace twice", () => {
    expect(migrateFound(["bonfire", "grace"])).toEqual(["grace"]);
  });
});
