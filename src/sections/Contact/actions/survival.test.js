import { describe, expect, it } from "vitest";
import { MAX_HEALTH, TAKEDOWNS_TO_WIN, biteDamage, conditionFor, jillStart, jillStep, missionLine, survivalStart, survivalStep } from ".";

const fighting = survivalStep(survivalStart(), { type: "start" });
const takeDowns = (state, count) => Array.from({ length: count }).reduce((next) => survivalStep(next, { type: "takedown" }), state);

describe("survivalStep", () => {
  it("given Claire just arrived at the beach, expect it calm with full health until she asks for the fight", () => {
    expect(survivalStart()).toEqual({ phase: "calm", health: MAX_HEALTH, takedowns: 0, life: 0 });
  });

  it("given a bite before the fight started, expect Inde's evening to stay calm and untouched", () => {
    expect(survivalStep(survivalStart(), { type: "bite", damage: 30 })).toEqual(survivalStart());
  });

  it("given Malenia starts the fight, expect it on", () => {
    expect(fighting.phase).toBe("fight");
  });

  it("given a bite in the fight, expect it taken off her health", () => {
    expect(survivalStep(fighting, { type: "bite", damage: 12 }).health).toBe(MAX_HEALTH - 12);
  });

  it("given a bite bigger than what's left, expect her down at zero instead of below it", () => {
    const down = survivalStep({ ...fighting, health: 5 }, { type: "bite", damage: 12 });
    expect(down).toMatchObject({ health: 0, phase: "down" });
  });

  it("given the takedowns the mission asks for, expect it won", () => {
    expect(takeDowns(fighting, TAKEDOWNS_TO_WIN).phase).toBe("won");
  });

  it("given one short of it, expect Claire still fighting", () => {
    expect(takeDowns(fighting, TAKEDOWNS_TO_WIN - 1).phase).toBe("fight");
  });

  it("given a retry after Inde's Jill went down, expect a new life at full health with nothing taken down", () => {
    const down = { ...fighting, health: 0, takedowns: 2, phase: "down" };
    expect(survivalStep(down, { type: "retry" })).toEqual({ phase: "fight", health: MAX_HEALTH, takedowns: 0, life: 1 });
  });

  it("given a retry while she's still standing, expect nothing to change", () => {
    expect(survivalStep(fighting, { type: "retry" })).toBe(fighting);
  });
});

describe("biteDamage", () => {
  it("given only enemies still on their way to Malenia, expect no bite", () => {
    expect(biteDamage([{ kind: "zombie", status: "coming" }])).toBe(0);
  });

  it("given a dog and a zombie at her feet, expect the dog to bite harder", () => {
    const zombie = biteDamage([{ kind: "zombie", status: "waiting" }]);
    const dog = biteDamage([{ kind: "cerberus", status: "waiting" }]);
    expect(dog).toBeGreaterThan(zombie);
    expect(biteDamage([{ kind: "zombie", status: "waiting" }, { kind: "cerberus", status: "waiting" }])).toBe(zombie + dog);
  });
});

describe("conditionFor", () => {
  it("given full health on a date night with Claire, expect Fine", () => {
    expect(conditionFor(MAX_HEALTH)).toBe("fine");
  });

  it("given half of it, expect Caution", () => {
    expect(conditionFor(50)).toBe("caution");
  });

  it("given almost none left, expect Danger", () => {
    expect(conditionFor(10)).toBe("danger");
  });
});

describe("missionLine", () => {
  it("given a calm beach, expect Inde told how to start the mission", () => {
    expect(missionLine({ phase: "calm", tyrant: null })).toBe("Click Jill to start the mission");
  });

  it("given the fight on, expect what draws out the Tyrant", () => {
    expect(missionLine({ phase: "fight", tyrant: null })).toBe(`Take down ${TAKEDOWNS_TO_WIN} to draw out the Tyrant`);
  });

  it("given Jill down, expect the old game's verdict", () => {
    expect(missionLine({ phase: "down", tyrant: null })).toBe("You died");
  });

  it("given him climbing out for Malenia, expect the warning, then the all clear once the rocket lands", () => {
    expect(missionLine({ phase: "won", tyrant: "roar" })).toBe("Tyrant incoming");
    expect(missionLine({ phase: "won", tyrant: "hit" })).toBe("Mission complete");
  });
});

describe("jillStep in a fight for her life", () => {
  const standing = jillStep(jillStep(jillStep(jillStart(), { type: "arrive" }), { type: "ended" }), { type: "ended" });

  it("given a bite while she stands there, expect her to flinch", () => {
    expect(jillStep(standing, { type: "hurt" }).pose).toBe("hurt");
  });

  it("given a bite in the middle of her combo for Claire, expect her to keep swinging", () => {
    const punching = jillStep(standing, { type: "combo" });
    expect(jillStep(punching, { type: "hurt" })).toBe(punching);
  });

  it("given her health gone, expect her on the floor saying the email still has to go out", () => {
    const down = jillStep(standing, { type: "die" });
    expect(down).toMatchObject({ pose: "down", isDown: true });
    expect(down.said).toContain("email");
  });

  it("given her on the floor, expect her to stay there through Inde's cues and her own last frame", () => {
    const down = jillStep(standing, { type: "die" });
    expect(jillStep(down, { type: "ended" })).toBe(down);
    expect(jillStep(down, { type: "cue", name: "copy" })).toBe(down);
  });

  it("given another life, expect her dashing back in with every move still counted", () => {
    const down = jillStep(standing, { type: "die" });
    const revived = jillStep(down, { type: "revive" });
    expect(revived).toMatchObject({ pose: "dash", isDown: false, hasArrived: false });
    expect(revived.take).toBeGreaterThan(down.take);
  });

  it("given the radio cue that starts the mission, expect her to call it in", () => {
    expect(jillStep(standing, { type: "cue", name: "start" })).toMatchObject({ pose: "radio" });
  });
});
