import { describe, expect, it } from "vitest";
import { HITS_TO_DEFEAT, huntLine, huntStart, huntStep, pickHideout } from ".";

// the outer ring on the night Claire and Inde hunt the larva together
const RING = ["Docker", "Terraform", "Azure"];
const first = () => 0;
const last = () => 0.99;

describe("pickHideout", () => {
  it("given Malenia's first look at the ring, expect any of its tools", () => {
    expect(pickHideout(RING, null, last)).toBe("Azure");
  });

  it("given the larva fleeing Docker, expect it never hiding behind Docker again", () => {
    expect(pickHideout(RING, "Docker", first)).toBe("Terraform");
  });

  it("given a ring with only the tool it's fleeing, expect nowhere to go", () => {
    expect(pickHideout(["Docker"], "Docker", first)).toBeNull();
  });
});

describe("huntStart", () => {
  it("given the start of Inde's anniversary hunt, expect the larva hidden and never hit", () => {
    expect(huntStart(RING, first)).toEqual({ hideout: "Docker", hits: 0, isDefeated: false });
  });
});

describe("huntStep", () => {
  const hiding = { hideout: "Docker", hits: 0, isDefeated: false };

  it("given a shot on the wrong tool, expect the hunt unchanged", () => {
    expect(huntStep(hiding, "Azure", RING, first)).toBe(hiding);
  });

  it("given Claire's shot on its hideout, expect a hit and the larva behind another tool", () => {
    expect(huntStep(hiding, "Docker", RING, first)).toEqual({ hideout: "Terraform", hits: 1, isDefeated: false });
  });

  it("given the last hit, expect it defeated with nowhere left to hide", () => {
    const worn = { ...hiding, hits: HITS_TO_DEFEAT - 1 };
    expect(huntStep(worn, "Docker", RING, first)).toEqual({ hideout: null, hits: HITS_TO_DEFEAT, isDefeated: true });
  });

  it("given a shot after it's defeated, expect the hunt over and unchanged", () => {
    const defeated = { hideout: null, hits: HITS_TO_DEFEAT, isDefeated: true };
    expect(huntStep(defeated, "Docker", RING, first)).toBe(defeated);
  });
});

describe("huntLine", () => {
  it("given the first hit, expect the count and where it went", () => {
    expect(huntLine({ hideout: "Terraform", hits: 1, isDefeated: false })).toBe("Metroid hit, 1 of 3. It fled behind another tool.");
  });

  it("given a hit between the first and the last, expect silence so the messages don't pile up", () => {
    expect(huntLine({ hideout: "Azure", hits: 2, isDefeated: false })).toBeNull();
  });

  it("given the defeat Malenia waited for, expect the mission complete", () => {
    expect(huntLine({ hideout: null, hits: 3, isDefeated: true })).toBe("Metroid defeated. Mission complete, Samus is heading home.");
  });
});
