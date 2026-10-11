import { describe, expect, it } from "vitest";
import { SECRET_IDS, migrateFound, secretCount } from "./secrets";

describe("migrateFound", () => {
  it("turns an old lit bonfire into a discovered grace", () => {
    expect(migrateFound(["triforce", "bonfire"])).toEqual(["triforce", "grace"]);
  });

  it("does not count the grace twice", () => {
    expect(migrateFound(["bonfire", "grace"])).toEqual(["grace"]);
  });
});

describe("secretCount", () => {
  it("keeps score out of every secret on the page", () => {
    expect(secretCount(["triforce", "grace"])).toBe(`2/${SECRET_IDS.length} secrets found`);
  });
});
