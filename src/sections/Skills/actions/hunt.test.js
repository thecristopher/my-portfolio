import { describe, expect, it } from "vitest";
import {
  HITS_TO_DEFEAT,
  encounterCues,
  encounterLine,
  encounterStage,
  energyLeft,
  hasLanded,
  huntLine,
  huntStart,
  huntStep,
  pickHideout,
} from ".";

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

  it("given the wrong tool opened, expect the hunt unchanged", () => {
    expect(huntStep(hiding, "Azure", RING, first)).toBe(hiding);
  });

  it("given Claire opening its hideout, expect a hit and the larva behind another tool", () => {
    expect(huntStep(hiding, "Docker", RING, first)).toEqual({ hideout: "Terraform", hits: 1, isDefeated: false });
  });

  it("given the last hit, expect it defeated with nowhere left to hide", () => {
    const worn = { ...hiding, hits: HITS_TO_DEFEAT - 1 };
    expect(huntStep(worn, "Docker", RING, first)).toEqual({ hideout: null, hits: HITS_TO_DEFEAT, isDefeated: true });
  });

  it("given a tool opened after it's defeated, expect the hunt over and unchanged", () => {
    const defeated = { hideout: null, hits: HITS_TO_DEFEAT, isDefeated: true };
    expect(huntStep(defeated, "Docker", RING, first)).toBe(defeated);
  });
});

describe("huntLine", () => {
  it("given a hit, expect silence, the card already shows it", () => {
    expect(huntLine({ hideout: "Terraform", hits: 1, isDefeated: false })).toBeNull();
  });

  it("given the defeat Malenia waited for, expect the mission complete", () => {
    expect(huntLine({ hideout: null, hits: 3, isDefeated: true })).toBe("Metroid defeated. Mission complete, Samus is heading home.");
  });
});

describe("encounterStage", () => {
  it("given the card still flying in, expect the fight to wait", () => {
    expect(encounterStage(500)).toBe("arriving");
  });

  it("given the card in place, expect Samus taking aim", () => {
    expect(encounterStage(1300)).toBe("aiming");
  });

  it("given the beam out, expect the larva hurt", () => {
    expect(encounterStage(2000)).toBe("hurt");
  });

  it("given Inde still looking at the card later, expect just the result", () => {
    expect(encounterStage(5000)).toBe("done");
  });

  it("given every cue, expect each part in order", () => {
    expect(encounterCues().map((at) => encounterStage(at))).toEqual(["arriving", "aiming", "firing", "hurt", "leaving", "done"]);
  });

  it("given the last hit on Malenia's watch, expect the screw attack tearing through it", () => {
    expect(encounterStage(2000, true)).toBe("striking");
  });

  it("given every cue of the last hit, expect the leap, the strike and the fall before it burns away", () => {
    const finisher = encounterCues(true).map((at) => encounterStage(at, true));
    expect(finisher).toEqual(["arriving", "leaping", "striking", "falling", "leaving", "done"]);
  });
});

describe("hasLanded", () => {
  it("given Claire's beam still flying toward Inde's tool, expect no result yet", () => {
    expect(hasLanded("firing")).toBe(false);
  });

  it("given the screw attack tearing through the larva, expect the result to show", () => {
    expect(hasLanded("striking")).toBe(true);
  });
});

describe("encounterLine", () => {
  it("given the second hit, expect the count", () => {
    expect(encounterLine({ hits: 2, isDefeated: false })).toBe("Hit 2 of 3");
  });

  it("given the last hit, expect the win", () => {
    expect(encounterLine({ hits: 3, isDefeated: true })).toBe("Metroid defeated");
  });
});

describe("energyLeft", () => {
  it("given one hit taken, expect two bars of energy left", () => {
    expect(energyLeft(1)).toEqual([false, true, true]);
  });

  it("given every hit taken, expect none left", () => {
    expect(energyLeft(3)).toEqual([false, false, false]);
  });
});
