import { describe, expect, it } from "vitest";
import { RELICS, RELIC_IDS, isComplete, migrateFound, relicCount, relicsIn } from "./relics";

describe("migrateFound", () => {
  it("lets Malenia keep the bonfire she lit before it became a grace", () => {
    expect(migrateFound(["bonfire"])).toEqual(["grace"]);
  });

  it("drops a relic Claire found that no longer exists", () => {
    expect(migrateFound(["umbrella", "hollow-knight"])).toEqual(["umbrella"]);
  });

  it("counts Inde's find once even if it was saved twice", () => {
    expect(migrateFound(["d20", "d20"])).toEqual(["d20"]);
  });
});

describe("relicCount", () => {
  it("reads like the quest log score", () => {
    expect(relicCount(["grace", "triforce"])).toBe(`2/${RELIC_IDS.length} relics`);
  });
});

describe("isComplete", () => {
  it("is false until every relic is found", () => {
    expect(isComplete(RELIC_IDS.slice(1))).toBe(false);
  });

  it("is true once Inde has found them all", () => {
    expect(isComplete([...RELIC_IDS])).toBe(true);
  });
});

describe("relicsIn", () => {
  it("leaves only the grace in contact, Malenia's respawn point", () => {
    expect(relicsIn("contact")).toEqual(["grace"]);
  });

  it("spreads the relics over at least eight places", () => {
    expect(new Set(RELIC_IDS.map((id) => RELICS[id].section)).size).toBeGreaterThanOrEqual(8);
  });
});

describe("RELICS", () => {
  it("keeps the Zelda, Elden Ring, Yu-Gi-Oh and Resident Evil relics", () => {
    expect(RELIC_IDS).toEqual(expect.arrayContaining(["triforce", "grace", "magician", "umbrella"]));
  });

  it("gives every relic a franchise, a color and a line for the quest log", () => {
    Object.values(RELICS).forEach((relic) => {
      expect(relic.franchise).toBeTruthy();
      expect(relic.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(relic.quip).not.toContain("\u2014");
      expect(relic.riddle).toBeTruthy();
    });
  });
});
