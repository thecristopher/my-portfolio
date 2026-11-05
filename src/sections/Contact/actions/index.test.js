import { describe, expect, it } from "vitest";
import {
  aliveCount,
  bugMotion,
  bugStop,
  dripPoint,
  hitFor,
  isFarEnough,
  jillStart,
  jillStep,
  lineFor,
  lampWindows,
  missionDelay,
  nextBugWait,
  pickTarget,
  reflectionShift,
  reflectionStrength,
  rippleAt,
  squashLine,
  starField,
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

  it("given a bug still crawling, expect her to draw the handgun instead of throwing the combo", () => {
    expect(jillStep(standing, { type: "combo", isFar: true }).pose).toBe("shoot");
  });

  it("given a shot underway, expect Malenia's radio cue to wait", () => {
    const shooting = jillStep(standing, { type: "combo", isFar: true });
    expect(jillStep(shooting, { type: "cue", name: "radio" }).pose).toBe("shoot");
  });

  it("given a bug to fight, expect a punch with the kick and roundhouse lined up", () => {
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

  it("given the end of the page mid fight, expect the beret to come off once the combo is done", () => {
    let state = jillStep(standing, { type: "combo" });
    state = jillStep(state, { type: "missionComplete" });
    state = jillStep(jillStep(jillStep(state, { type: "ended" }), { type: "ended" }), { type: "ended" });
    expect(state.pose).toBe("beret");
  });

  it("given the beret came off, expect Malenia to see her hair down from then on", () => {
    const beret = jillStep(standing, { type: "missionComplete" });
    const after = jillStep(beret, { type: "ended" });
    expect(after.pose).toBe("hairDown");
    expect(jillStep(after, { type: "missionComplete" })).toBe(after);
  });

  it("given the same cue twice, expect a new take so the move plays again", () => {
    const once = jillStep(standing, { type: "cue", name: "herb" });
    const herbDone = jillStep(once, { type: "ended" });
    expect(jillStep(herbDone, { type: "cue", name: "herb" }).take).toBeGreaterThan(once.take);
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

describe("missionDelay", () => {
  it("given Jill on stage for a while already, expect Claire's mission to end right away", () => {
    expect(missionDelay(1000, 20000, 10000)).toBe(0);
  });

  it("given Jill only just arrived, expect Inde to see her fight out the rest of her time first", () => {
    expect(missionDelay(1000, 4000, 10000)).toBe(7000);
  });
});

describe("hitFor", () => {
  it("given the punch and the kick, expect sparks on the bug", () => {
    expect(hitFor("punch")).toBe("spark");
    expect(hitFor("kick")).toBe("spark");
  });

  it("given the roundhouse, expect the bug squashed for Claire", () => {
    expect(hitFor("roundhouse")).toBe("squash");
  });

  it("given the shot from across the stage, expect the bug squashed", () => {
    expect(hitFor("shoot")).toBe("squash");
  });

  it("given Jill just showing Inde the herb, expect no hit at all", () => {
    expect(hitFor("herb")).toBeNull();
  });
});

describe("bugMotion", () => {
  it("given the 2x stage, expect a crawl across twice the floor to take about as long as Claire's 1x crawl", () => {
    const small = bugMotion("crawling", 280, 1).transition.duration;
    const big = bugMotion("crawling", 560, 2).transition.duration;
    expect(big).toBeCloseTo(small);
  });

  it("given a short crawl, expect Inde's bug to still take a moment to arrive", () => {
    expect(bugMotion("crawling", 20, 2).transition.duration).toBe(2.5);
  });

  it("given the roundhouse at 2x, expect Malenia's bug to fly twice as far", () => {
    const small = bugMotion("squashed", 500, 1);
    const big = bugMotion("squashed", 500, 2);
    expect(500 - big.x).toBe(2 * (500 - small.x));
    expect(big.y).toBe(2 * small.y);
  });
});

describe("bug hunt", () => {
  const bugs = [
    { id: 1, status: "squashed" },
    { id: 2, status: "waiting" },
    { id: 3, status: "crawling" },
  ];

  it("given a clicked bug still around, expect the combo to land on it", () => {
    expect(pickTarget(bugs, 3)).toBe(3);
  });

  it("given Jill clicked instead, expect the first bug still around", () => {
    expect(pickTarget(bugs)).toBe(2);
  });

  it("given every bug squashed, expect nothing left for Malenia to hit", () => {
    expect(pickTarget([{ id: 1, status: "squashed" }])).toBeNull();
  });

  it("counts only the bugs still bothering Claire", () => {
    expect(aliveCount(bugs)).toBe(2);
  });

  it("stops a bug right in front of Jill, never past the start of the corner", () => {
    expect(bugStop(400, 154, 30)).toBe(235);
    expect(bugStop(60, 154, 30)).toBe(0);
  });

  it("stops the bugs further out when Jill is drawn twice as big, so her kick still reaches Claire's pest", () => {
    expect(bugStop(800, 308, 36, 2)).toBe(800 - 154 - 116 - 36);
  });

  it("waits between the shortest and longest gap for the next bug", () => {
    expect(nextBugWait(0)).toBe(7000);
    expect(nextBugWait(1)).toBe(14000);
  });

  it("says the squash count in plain words for Inde", () => {
    expect(squashLine(1)).toBe("1 bug squashed");
    expect(squashLine(4)).toBe("4 bugs squashed");
  });
});
