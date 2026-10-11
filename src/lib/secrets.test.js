import { describe, expect, it } from "vitest";
import { SECRETS, SECRET_IDS, isComplete, migrateFound, secretCount, secretTooltip } from "./secrets";

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

describe("secretTooltip", () => {
  it("pairs the secret's own quip with the score", () => {
    const tooltip = secretTooltip("pokeball", ["pokeball"]);
    expect(tooltip.quip).toMatch(/Gotcha!/);
    expect(tooltip.count).toBe(`1/${SECRET_IDS.length} secrets found`);
  });

  it("gives every secret a quip and a pip color", () => {
    SECRET_IDS.forEach((id) => {
      expect(SECRETS[id].quip).toBeTruthy();
      expect(SECRETS[id].color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  it("swaps to the victory line once every secret is found", () => {
    expect(isComplete(SECRET_IDS)).toBe(true);
    expect(secretTooltip("grace", SECRET_IDS).quip).toMatch(/100% completion/);
    expect(secretTooltip("grace", ["grace"]).quip).not.toMatch(/100% completion/);
  });
});
