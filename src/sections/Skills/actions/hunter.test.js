import { describe, expect, it } from "vitest";
import {
  aimPoseFor,
  boardingShift,
  endingCues,
  endingLook,
  firePoseFor,
  endingStage,
  endingStart,
  facingToward,
  hunterPose,
  restFor,
  shipSideFor,
  spotUnder,
  strideFor,
  travel,
  wanderGoal,
} from ".";

// the box Claire's sprite takes on screen when she stands in for Samus on a date by the stars
const clairesBox = { left: 100, top: 400, width: 84, height: 99 };
const TRACK = 600;

describe("strideFor", () => {
  it("given a short way to Inde's bench, expect a roll in the morph ball", () => {
    expect(strideFor(100, 200, TRACK)).toMatchObject({ gait: "roll", facing: "right" });
  });

  it("given the far end of the track, expect a run", () => {
    expect(strideFor(500, 20, TRACK)).toMatchObject({ gait: "run", facing: "left" });
  });

  it("given a short way after the larva, expect a run anyway", () => {
    expect(strideFor(100, 150, TRACK, true).gait).toBe("run");
  });

  it("given Malenia's pace, expect a longer trip rolling than running the same way", () => {
    expect(strideFor(0, 200, TRACK).seconds).toBeGreaterThan(strideFor(0, 200, TRACK, true).seconds);
  });
});

describe("wanderGoal", () => {
  it("given a spot far from her, expect her to stroll there", () => {
    expect(wanderGoal(100, TRACK, () => 0.8)).toBe(480);
  });

  it("given a spot a step away while she's on the left half, expect a real stroll to the right instead", () => {
    expect(wanderGoal(100, TRACK, () => 0.2)).toBe(310);
  });

  it("given a spot a step away while she's on the right half, expect a real stroll to the left instead", () => {
    expect(wanderGoal(500, TRACK, () => 0.85)).toBe(290);
  });
});

describe("restFor", () => {
  it("given the shortest rest, expect a little under two seconds", () => {
    expect(restFor(() => 0)).toBe(1800);
  });

  it("given the longest rest, expect under four and a half seconds", () => {
    expect(restFor(() => 1)).toBe(4400);
  });
});

describe("spotUnder", () => {
  it("given the larva over the middle of the track, expect her centered under it", () => {
    expect(spotUnder(400, 50, 84, TRACK)).toBe(308);
  });

  it("given the larva past the track's end, expect her stopping at the end", () => {
    expect(spotUnder(2000, 50, 84, TRACK)).toBe(TRACK);
  });

  it("given the larva before the track starts, expect her at the start", () => {
    expect(spotUnder(0, 50, 84, TRACK)).toBe(0);
  });
});

describe("aimPoseFor", () => {
  const chest = { x: 0, y: 0 };

  it("given Malenia's tool level with her chest, expect the Paralyzer level", () => {
    expect(aimPoseFor(chest, { x: 200, y: -20 })).toBe("aim");
  });

  it("given the larva up and to her left, expect the Paralyzer on the diagonal", () => {
    expect(aimPoseFor(chest, { x: -200, y: -200 })).toBe("aimDiagonal");
  });

  it("given Inde's playlist right over her head, expect the Paralyzer straight up", () => {
    expect(aimPoseFor(chest, { x: 30, y: -400 })).toBe("aimUp");
  });
});

describe("hunterPose", () => {
  const strolling = { targetPose: null, sightingPose: null, gait: null };

  it("given a tool picked while she runs, expect her to stop and aim at it", () => {
    expect(hunterPose({ ...strolling, targetPose: "aimDiagonal", gait: "run" })).toBe("aimDiagonal");
  });

  it("given her running under the larva, expect the run until she gets there", () => {
    expect(hunterPose({ ...strolling, sightingPose: "aimUp", gait: "run" })).toBe("run");
  });

  it("given her under the peeking larva, expect her pointing up at it", () => {
    expect(hunterPose({ ...strolling, sightingPose: "aimUp" })).toBe("aimUp");
  });

  it("given a short way to Claire's spot, expect the morph ball", () => {
    expect(hunterPose({ ...strolling, gait: "roll" })).toBe("morph");
  });

  it("given nothing going on, expect her standing", () => {
    expect(hunterPose(strolling)).toBe("idle");
  });
});

describe("firePoseFor", () => {
  it("given her aiming level, expect the level shot", () => {
    expect(firePoseFor("aim")).toBe("fire");
  });

  it("given her aiming up at Inde's larva, expect the shot straight up", () => {
    expect(firePoseFor("aimUp")).toBe("fireUp");
  });
});

describe("endingStage", () => {
  it("given the moment the ending starts, expect her triumph", () => {
    expect(endingStage(0)).toBe("triumph");
  });

  it("given two seconds in, expect her thanking the visitor", () => {
    expect(endingStage(2000)).toBe("congrats");
  });

  it("given five seconds in, expect the ship landing", () => {
    expect(endingStage(5000)).toBe("landing");
  });

  it("given Claire and Inde watching the ship fly off, expect departing", () => {
    expect(endingStage(7000)).toBe("departing");
  });

  it("given the ship far away, expect nothing left but the orbit", () => {
    expect(endingStage(10000)).toBe("gone");
  });

  it("given every cue, expect each one to start a different stage, ending with gone", () => {
    expect(endingCues().map(endingStage)).toEqual(["triumph", "congrats", "landing", "boarding", "departing", "gone"]);
  });
});

describe("endingStart", () => {
  it("given the triumph, expect it to start at once", () => {
    expect(endingStart("triumph")).toBe(0);
  });

  it("given Inde waving the ship off, expect it to start once she's aboard", () => {
    expect(endingStart("departing")).toBe(6500);
  });
});

describe("endingLook", () => {
  it("given the triumph, expect the Power Suit facing you", () => {
    expect(endingLook("triumph")).toEqual({ suit: "power", pose: "forward" });
  });

  it("given her thanks, expect Malenia's favorite pose, the Zero Suit spinning the pistol", () => {
    expect(endingLook("congrats")).toEqual({ suit: "zero", pose: "victory" });
  });

  it("given the boarding, expect the Zero Suit's flip", () => {
    expect(endingLook("boarding")).toEqual({ suit: "zero", pose: "flip" });
  });
});

describe("facingToward", () => {
  it("given Malenia's favorite tool left of her, expect her facing left", () => {
    expect(facingToward(clairesBox, 40)).toBe("left");
  });

  it("given Inde's anniversary playlist right of her, expect her facing right", () => {
    expect(facingToward(clairesBox, 300)).toBe("right");
  });
});

describe("travel", () => {
  it("given a beam straight up at Claire's date, expect it pointing up", () => {
    expect(travel({ x: 0, y: 0 }, { x: 0, y: -300 })).toEqual({ dx: 0, dy: -300, angle: -90, length: 300 });
  });
});

describe("shipSideFor", () => {
  it("given Samus on the left half of her track, expect the ship landing on her right", () => {
    expect(shipSideFor(100, TRACK)).toBe("right");
  });

  it("given Samus on the right half, expect the ship landing on her left", () => {
    expect(shipSideFor(500, TRACK)).toBe("left");
  });
});

describe("boardingShift", () => {
  it("given the ship on her left, expect a flip left to its middle", () => {
    expect(boardingShift("left", 84, 184, 14)).toBe(-120);
  });

  it("given the ship on her right, expect a flip right to its middle", () => {
    expect(boardingShift("right", 84, 184, 14)).toBe(120);
  });
});
