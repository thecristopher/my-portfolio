import { describe, expect, it } from "vitest";
import { RELICS, RELIC_IDS, isComplete, migrateFound, relicCount, relicsIn } from "./relics";

describe("migrateFound", () => {
  it("lets Malenia keep the bonfire she lit, now as a grace", () => {
    expect(migrateFound(["bonfire"])).toEqual(["grace"]);
  });

  it("keeps Claire's umbrella and quietly lets go of a relic that moved away", () => {
    expect(migrateFound(["umbrella", "hollow-knight"])).toEqual(["umbrella"]);
  });

  it("counts Inde's d20 once even when it was saved twice", () => {
    expect(migrateFound(["d20", "d20"])).toEqual(["d20"]);
  });
});

describe("relicCount", () => {
  it("shows two found relics as a quest log score", () => {
    expect(relicCount(["grace", "triforce"])).toBe(`2/${RELIC_IDS.length} relics`);
  });
});

describe("isComplete", () => {
  it("keeps the collection open while one relic is still out there", () => {
    expect(isComplete(RELIC_IDS.slice(1))).toBe(false);
  });

  it("celebrates once Inde and Claire have found every relic", () => {
    expect(isComplete([...RELIC_IDS])).toBe(true);
  });
});

describe("relicsIn", () => {
  it("leaves only the grace in contact, where Malenia waits for her date", () => {
    expect(relicsIn("contact")).toEqual(["grace"]);
  });

  it("spreads the relics over at least eight places to explore", () => {
    expect(new Set(RELIC_IDS.map((id) => RELICS[id].section)).size).toBeGreaterThanOrEqual(8);
  });
});

describe("RELICS", () => {
  it("keeps Inde's One Wish Willow from Obsession in the collection", () => {
    expect(RELICS.willow.franchise).toBe("Obsession");
  });

  it("includes the Zelda, Elden Ring, Yu-Gi-Oh and Resident Evil relics", () => {
    expect(RELIC_IDS).toEqual(expect.arrayContaining(["triforce", "grace", "magician", "umbrella"]));
  });

  it("gives every relic a franchise, a color, a riddle and a quip without em dashes", () => {
    Object.values(RELICS).forEach((relic) => {
      expect(relic.franchise).toBeTruthy();
      expect(relic.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(relic.quip).not.toContain("\u2014");
      expect(relic.riddle).toBeTruthy();
    });
  });
});
