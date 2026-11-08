import { describe, expect, it } from "vitest";
import {
  aliveCount,
  enemyMotion,
  enemyStop,
  cueFor,
  dripPoint,
  hitFor,
  isFarEnough,
  jillStart,
  jillStep,
  lineFor,
  lampWindows,
  nextEnemyWait,
  missionMarks,
  pickTarget,
  reflectionShift,
  reflectionStrength,
  rippleAt,
  takedownLine,
  starField,
  bodyWidth,
  finalePlan,
  firesRocket,
  jillFront,
  needsHandgun,
  pickKind,
  tyrantStep,
} from ".";

describe("starField", () => {
  it("given the same seed, puts Claire's stars in the same places every time", () => {
    expect(starField(5, { seed: 3 })).toEqual(starField(5, { seed: 3 }));
  });

  it("keeps every star Malenia wishes on inside the sky and inside the sunset", () => {
    for (const star of starField(40, { from: 0.5, to: 0.9 })) {
      expect(star.x).toBeGreaterThanOrEqual(0);
      expect(star.x).toBeLessThanOrEqual(100);
      expect(star.y).toBeLessThanOrEqual(85);
      expect(star.at).toBeGreaterThanOrEqual(0.5);
      expect(star.at).toBeLessThan(0.9);
    }
  });

  it("gives Inde as many stars as she asked for", () => {
    expect(starField(12)).toHaveLength(12);
  });
});

describe("lampWindows", () => {
  it("lights the pier lamps one after the other for Claire and Inde's walk", () => {
    expect(lampWindows(4, [0.4, 0.8]).map(([start, end]) => [start.toFixed(2), end.toFixed(2)])).toEqual([
      ["0.40", "0.50"],
      ["0.50", "0.60"],
      ["0.60", "0.70"],
      ["0.70", "0.80"],
    ]);
  });
});

describe("rippleAt", () => {
  const ripple = { x: 10, y: 20, size: 80, born: 1000 };

  it("given a ripple Claire just dropped, expect it tiny and fully visible", () => {
    expect(rippleAt(ripple, 1000)).toEqual({ x: 10, y: 20, radius: 0, alpha: 1 });
  });

  it("given half its life gone, expect Malenia's ripple wider than half and half faded", () => {
    const ring = rippleAt(ripple, 1900, 1800);
    expect(ring.radius).toBeGreaterThan(40);
    expect(ring.alpha).toBeCloseTo(0.5);
  });

  it("given its life is over, expect Inde's ripple gone", () => {
    expect(rippleAt(ripple, 2800, 1800)).toBeNull();
  });
});

describe("isFarEnough", () => {
  it("given no ripple yet, expect Claire's first touch to drop one", () => {
    expect(isFarEnough(null, { x: 0, y: 0 }, 24)).toBe(true);
  });

  it("given a cursor that barely moved, expect Inde's drag to wait for the next one", () => {
    expect(isFarEnough({ x: 0, y: 0 }, { x: 10, y: 5 }, 24)).toBe(false);
  });
});

describe("reflectionShift", () => {
  it("given no ripples, expect only a gentle sway on Malenia's sunset", () => {
    expect(Math.abs(reflectionShift({ x: 0, y: 0 }, 0, []))).toBeLessThanOrEqual(1.5);
  });

  it("given a ring passing right through a piece, expect it pushed away from the ripple's middle", () => {
    const ring = { x: 100, y: 50, radius: 30, alpha: 1 };
    expect(reflectionShift({ x: 130, y: 50 }, 0, [ring])).toBeGreaterThan(10);
    expect(reflectionShift({ x: 70, y: 50 }, 0, [ring])).toBeLessThan(-10);
  });
});

describe("dripPoint", () => {
  const reflection = { center: 700, span: 400, depth: 200 };

  it("drops Claire's idle drip right in the middle of the reflection on a middle roll", () => {
    expect(dripPoint(0.5, 0, reflection)).toEqual({ x: 700, y: 0 });
  });

  it("keeps Inde's drips inside the reflection even on the edge rolls", () => {
    const left = dripPoint(0, 1, reflection);
    const right = dripPoint(1, 1, reflection);
    expect(left.x).toBeGreaterThanOrEqual(500);
    expect(right.x).toBeLessThanOrEqual(900);
    expect(right.y).toBeLessThanOrEqual(200);
  });
});

describe("reflectionStrength", () => {
  it("given the sun still up on Claire and Inde's date, expect the full reflection", () => {
    expect(reflectionStrength(0)).toBe(1);
  });

  it("given the sun gone, expect only a trace left", () => {
    expect(reflectionStrength(1)).toBeCloseTo(0.1);
  });
});

describe("jillStep", () => {
  const pointing = jillStep(jillStep(jillStart(), { type: "arrive" }), { type: "ended" });
  const standing = jillStep(pointing, { type: "ended" });

  it("given Jill dashing in, expect her to ignore Claire's copy until she arrives", () => {
    expect(jillStep(jillStart(), { type: "cue", name: "happy" }).pose).toBe("dash");
  });

  it("given she reached her spot mid dash, expect the dash to finish instead of being cut", () => {
    expect(jillStep(jillStart(), { type: "arrive" }).pose).toBe("dash");
  });

  it("given the dash finished, expect her to point Inde to the email first", () => {
    expect(pointing.pose).toBe("point");
  });

  it("given she pointed, expect her standing ready", () => {
    expect(standing.pose).toBe("idle");
  });

  it("given the visitor asked for less movement, expect her already standing with nothing queued", () => {
    expect(jillStart(true)).toMatchObject({ pose: "idle", queue: [], hasArrived: true });
  });

  it("given a zombie still shambling in, expect her to draw the handgun instead of throwing the combo", () => {
    expect(jillStep(standing, { type: "combo", isFar: true }).pose).toBe("shoot");
  });

  it("given a shot underway, expect Malenia's radio cue to wait", () => {
    const shooting = jillStep(standing, { type: "combo", isFar: true });
    expect(jillStep(shooting, { type: "cue", name: "radio" }).pose).toBe("shoot");
  });

  it("given a zombie at her feet, expect a punch with the kick and roundhouse lined up", () => {
    const fighting = jillStep(standing, { type: "combo" });
    expect(fighting.pose).toBe("punch");
    expect(fighting.queue).toEqual(["kick", "roundhouse"]);
  });

  it("given a combo underway, expect Inde's happy cue not to cut into it", () => {
    const fighting = jillStep(standing, { type: "combo" });
    expect(jillStep(fighting, { type: "cue", name: "happy" }).pose).toBe("punch");
  });

  it("given the punch landed, expect the kick next", () => {
    const fighting = jillStep(standing, { type: "combo" });
    expect(jillStep(fighting, { type: "ended" }).pose).toBe("kick");
  });

  it("given the end of the page mid fight, expect the rocket launcher to come out once the combo is done", () => {
    let state = jillStep(standing, { type: "combo" });
    state = jillStep(state, { type: "missionComplete" });
    state = jillStep(jillStep(jillStep(state, { type: "ended" }), { type: "ended" }), { type: "ended" });
    expect(state.pose).toBe("rocketRaise");
  });

  it("given the mission complete, expect the launcher raised, aimed and then the beret off", () => {
    const raise = jillStep(standing, { type: "missionComplete" });
    const aim = jillStep(raise, { type: "ended" });
    const beret = jillStep(aim, { type: "ended" });
    expect([raise.pose, aim.pose, beret.pose]).toEqual(["rocketRaise", "rocketAim", "beret"]);
  });

  it("given the beret came off, expect Malenia to see her hair down from then on", () => {
    const beret = jillStep(jillStep(jillStep(standing, { type: "missionComplete" }), { type: "ended" }), { type: "ended" });
    const after = jillStep(beret, { type: "ended" });
    expect(after.pose).toBe("hairDown");
    expect(jillStep(after, { type: "missionComplete" })).toBe(after);
  });

  it("given the visitor asked for less movement, expect the beret right away with no Tyrant to fight", () => {
    expect(jillStep(jillStart(true), { type: "missionComplete" }).pose).toBe("beret");
  });

  it("given the launcher aimed at the Tyrant, expect Claire's combo request to wait", () => {
    const aim = jillStep(jillStep(standing, { type: "missionComplete" }), { type: "ended" });
    expect(jillStep(aim, { type: "combo" })).toBe(aim);
  });

  it("given the same cue twice, expect a new take so the move plays again", () => {
    const once = jillStep(standing, { type: "cue", name: "herb" });
    const herbDone = jillStep(once, { type: "ended" });
    expect(jillStep(herbDone, { type: "cue", name: "herb" }).take).toBeGreaterThan(once.take);
  });
});

describe("cueFor", () => {
  it("given Claire copying the address with the button, expect Jill happy and saying it's copied", () => {
    expect(cueFor("copy")).toEqual({ pose: "happy", line: expect.stringContaining("copied") });
  });

  it("given Inde copying the address by hand, expect a different line than the button gets", () => {
    expect(cueFor("handCopy").line).not.toBe(cueFor("copy").line);
  });

  it("given Malenia hovering GitHub, expect a herb for the road that names GitHub", () => {
    expect(cueFor("social", "GitHub")).toEqual({ pose: "herb", line: expect.stringContaining("GitHub") });
  });

  it("given Claire opening her mail app, expect Jill happy before the email is even written", () => {
    expect(cueFor("send").pose).toBe("happy");
  });

  it("given a plain move name, expect it played as that move with its own line", () => {
    expect(cueFor("radio")).toEqual({ pose: "radio", line: lineFor("radio") });
  });
});

describe("jillStep lines", () => {
  const standing = jillStep(jillStep(jillStep(jillStart(), { type: "arrive" }), { type: "ended" }), { type: "ended" });

  it("given Inde hovering LinkedIn, expect Jill to open the herb with a line about LinkedIn", () => {
    const state = jillStep(standing, { type: "cue", name: "social", detail: "LinkedIn" });
    expect(state.pose).toBe("herb");
    expect(state.said).toContain("LinkedIn");
  });

  it("given Claire's combo, expect the punch thrown in silence", () => {
    expect(jillStep(standing, { type: "combo" }).said).toBeNull();
  });

  it("given the dash done, expect her to point at the address and say so", () => {
    const pointing = jillStep(jillStep(jillStart(), { type: "arrive" }), { type: "ended" });
    expect(pointing.said).toBe(lineFor("point"));
  });
});

describe("lineFor", () => {
  it("given Jill pointing, expect her to tell Claire where the address is", () => {
    expect(lineFor("point")).toContain("address");
  });

  it("given the radio, expect her to call it in", () => {
    expect(lineFor("radio")).toMatch(/^Jill here/);
  });

  it("given a punch, expect her to fight in silence", () => {
    expect(lineFor("punch")).toBeNull();
  });
});

describe("jillStep after the mission", () => {
  const standing = jillStep(jillStep(jillStep(jillStart(), { type: "arrive" }), { type: "ended" }), { type: "ended" });

  it("given Claire's copy just made her happy, expect the finale to wait for the happy to finish", () => {
    const happy = jillStep(standing, { type: "cue", name: "copy" });
    const done = jillStep(happy, { type: "missionComplete" });
    expect(done.pose).toBe("happy");
    expect(jillStep(done, { type: "ended" }).pose).toBe("rocketRaise");
  });

  it("given the launcher coming out, expect her to call out the Tyrant", () => {
    expect(jillStep(standing, { type: "missionComplete" }).said).toContain("Tyrant");
  });

  it("given the beret queued, expect Inde hovering a social not to wipe it out", () => {
    const pointing = jillStep(standing, { type: "cue", name: "address" });
    const queued = jillStep(pointing, { type: "missionComplete" });
    expect(jillStep(queued, { type: "cue", name: "social", detail: "GitHub" })).toBe(queued);
  });

  it("given her hair down, expect Malenia's cues and combos to leave her standing down", () => {
    let hairDown = jillStep(standing, { type: "missionComplete" });
    for (let step = 0; step < 3; step++) hairDown = jillStep(hairDown, { type: "ended" });
    expect(hairDown.pose).toBe("hairDown");
    expect(jillStep(hairDown, { type: "cue", name: "radio" })).toBe(hairDown);
    expect(jillStep(hairDown, { type: "combo" })).toBe(hairDown);
  });
});

describe("hitFor", () => {
  it("given the punch and the kick, expect sparks on the zombie", () => {
    expect(hitFor("punch")).toBe("spark");
    expect(hitFor("kick")).toBe("spark");
  });

  it("given the roundhouse, expect the zombie down for Claire", () => {
    expect(hitFor("roundhouse")).toBe("down");
  });

  it("given the shot from across the stage, expect the enemy down", () => {
    expect(hitFor("shoot")).toBe("down");
  });

  it("given Jill just showing Inde the herb, expect no hit at all", () => {
    expect(hitFor("herb")).toBeNull();
  });
});

describe("enemyMotion", () => {
  it("given the 2x stage, expect a walk across twice the floor to take as long as Claire's 1x walk", () => {
    const small = enemyMotion("coming", 280, 1, "zombie").transition.duration;
    const big = enemyMotion("coming", 560, 2, "zombie").transition.duration;
    expect(big).toBeCloseTo(small);
  });

  it("given a zombie shambling across Inde's lawn, expect it to keep its own slow pace", () => {
    expect(enemyMotion("coming", 70, 2, "zombie").transition.duration).toBe(1);
  });

  it("given a Cerberus, expect it to cover the same ground far faster than a zombie", () => {
    expect(enemyMotion("coming", 600, 1, "cerberus").transition.duration).toBeLessThan(enemyMotion("coming", 600, 1, "zombie").transition.duration);
  });

  it("given a zombie waiting at Claire's door, expect it to sway in place instead of standing frozen", () => {
    expect(enemyMotion("waiting", 500, 2, "zombie").x).toEqual([500, 506, 500]);
  });

  it("given a zombie taken down, expect it to drop right where it stood", () => {
    expect(enemyMotion("down", 500, 2, "zombie").x).toBe(500);
  });
});

describe("the showdown", () => {
  const enemies = [
    { id: 1, status: "down" },
    { id: 2, status: "waiting" },
    { id: 3, status: "coming" },
  ];

  it("given a clicked enemy still up, expect the combo to land on it", () => {
    expect(pickTarget(enemies, 3)).toBe(3);
  });

  it("given Jill clicked instead, expect the first enemy still up", () => {
    expect(pickTarget(enemies)).toBe(2);
  });

  it("given every enemy down, expect nothing left for Malenia to hit", () => {
    expect(pickTarget([{ id: 1, status: "down" }])).toBeNull();
  });

  it("counts only the enemies still bothering Claire", () => {
    expect(aliveCount(enemies)).toBe(2);
  });

  it("stops an enemy right in front of Jill, never past the start of the corner", () => {
    expect(enemyStop(400, 85, 30)).toBe(227);
    expect(enemyStop(60, 85, 30)).toBe(0);
  });

  it("stops enemies further out when Jill is drawn twice as big, so her kick still reaches the zombie at Claire's door", () => {
    expect(enemyStop(800, jillFront(2), 70, 2)).toBe(800 - 170 - 116 - 70);
  });

  it("stops a Cerberus further out than a zombie, since its body is longer", () => {
    expect(enemyStop(800, 85, bodyWidth("cerberus"))).toBeLessThan(enemyStop(800, 85, bodyWidth("zombie")));
  });

  it("sends the next enemy within a few seconds, so Inde always has something to shoot", () => {
    expect(nextEnemyWait(0)).toBe(2500);
    expect(nextEnemyWait(1)).toBe(4000);
  });

  it("says the takedown count in plain words for Inde", () => {
    expect(takedownLine(1)).toBe("1 enemy down");
    expect(takedownLine(3)).toBe("3 enemies down");
  });
});

describe("pickKind", () => {
  it("given the first enemy of Claire's visit, expect a slow zombie to learn on", () => {
    expect(pickKind(0)).toBe("zombie");
  });

  it("given the second, expect a Cerberus", () => {
    expect(pickKind(1)).toBe("cerberus");
  });

  it("given the third, expect them to keep taking turns", () => {
    expect(pickKind(2)).toBe("zombie");
  });
});

describe("missionMarks", () => {
  it("given Malenia's first takedown, expect one mark of three lit", () => {
    expect(missionMarks(1, 3)).toEqual([true, false, false]);
  });

  it("given more takedowns than the goal, expect every mark lit and no extra ones", () => {
    expect(missionMarks(5, 3)).toEqual([true, true, true]);
  });
});

describe("needsHandgun", () => {
  it("given Malenia's zombie still shambling in, expect the handgun", () => {
    expect(needsHandgun({ kind: "zombie", status: "coming" })).toBe(true);
  });

  it("given a zombie already at Jill's feet, expect the combo", () => {
    expect(needsHandgun({ kind: "zombie", status: "waiting" })).toBe(false);
  });

  it("given a Cerberus at her feet, expect the handgun anyway", () => {
    expect(needsHandgun({ kind: "cerberus", status: "waiting" })).toBe(true);
  });

  it("given nothing to fight, expect no handgun", () => {
    expect(needsHandgun(undefined)).toBe(false);
  });
});

describe("firesRocket", () => {
  it("given the launcher aimed, expect the rocket to leave from that aim", () => {
    expect(firesRocket("rocketAim")).toBe(true);
  });

  it("given her still hoisting it, expect no rocket yet", () => {
    expect(firesRocket("rocketRaise")).toBe(false);
  });
});

describe("tyrantStep", () => {
  it("given the finale starting, expect the Tyrant climbing out", () => {
    expect(tyrantStep(null, "start")).toBe("emerge");
  });

  it("given him all the way out, expect the roar", () => {
    expect(tyrantStep("emerge", "risen")).toBe("roar");
  });

  it("given the rocket landing on Malenia's nemesis, expect him hit", () => {
    expect(tyrantStep("roar", "hit")).toBe("hit");
  });

  it("given him hit, expect nothing to bring him back", () => {
    expect(tyrantStep("hit", "start")).toBe("hit");
  });

  it("given the finale asked to start twice, expect him to keep roaring", () => {
    expect(tyrantStep("roar", "start")).toBe("roar");
  });
});

describe("finalePlan", () => {
  const plan = finalePlan(1000, 2);

  it("given a wide stage, expect the Tyrant out on the left and the muzzle on Jill's side", () => {
    expect(plan.tyrant).toBeLessThan(plan.muzzle.x);
  });

  it("given the launcher on her shoulder, expect the muzzle above the ground", () => {
    expect(plan.muzzle.up).toBeGreaterThan(0);
  });

  it("given the rocket's target, expect it on the Tyrant", () => {
    expect(plan.target.x).toBe(plan.tyrant);
  });

  it("given Inde's phone, expect the Tyrant still standing on the stage", () => {
    expect(finalePlan(340, 1).tyrant).toBeGreaterThan(0);
  });
});
