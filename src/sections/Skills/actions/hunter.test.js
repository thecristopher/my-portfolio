import { describe, expect, it } from "vitest";
import {
  aimPoseFor,
  boardingArc,
  endingCues,
  endingPose,
  endingStage,
  endingStart,
  flipSpotFor,
  fromAnchor,
  gaitFor,
  hasPassed,
  restFor,
  shipSideFor,
  sideOf,
  spotUnder,
  travel,
  wanderGoal,
} from ".";

const TRACK = 600;

describe("gaitFor", () => {
  it("given a short way to Inde's bench, expect a roll in the morph ball", () => {
    expect(gaitFor(100, 200, TRACK)).toBe("roll");
  });

  it("given the far end of the track, expect a run", () => {
    expect(gaitFor(500, 20, TRACK)).toBe("run");
  });

  it("given a short way after the larva, expect a run anyway", () => {
    expect(gaitFor(100, 150, TRACK, true)).toBe("run");
  });
});

describe("flipSpotFor", () => {
  it("given a roll, expect no somersault", () => {
    expect(flipSpotFor(0, 100, "roll", () => 0)).toBeNull();
  });

  it("given Claire running to Inde on a lucky roll, expect a leap partway there", () => {
    const spot = flipSpotFor(0, 400, "run", () => 0);
    expect(spot).toBeGreaterThan(0);
    expect(spot).toBeLessThan(400);
  });

  it("given an unlucky roll, expect her to just run", () => {
    expect(flipSpotFor(0, 400, "run", () => 0.9)).toBeNull();
  });
});

describe("hasPassed", () => {
  it("given Malenia running right over the spot, expect it passed", () => {
    expect(hasPassed(90, 110, 100)).toBe(true);
  });

  it("given her running left over the spot, expect it passed too", () => {
    expect(hasPassed(110, 90, 100)).toBe(true);
  });

  it("given her still short of it, expect not yet", () => {
    expect(hasPassed(80, 90, 100)).toBe(false);
  });

  it("given no spot, expect never", () => {
    expect(hasPassed(80, 120, null)).toBe(false);
  });
});

describe("wanderGoal", () => {
  it("given a spot far from her, expect her to stroll there", () => {
    expect(wanderGoal(100, TRACK, () => 0.9)).toBe(540);
  });

  it("given a spot a step away while she's on the left half, expect a real stroll to the right instead", () => {
    expect(wanderGoal(100, TRACK, () => 0.18)).toBe(310);
  });

  it("given a spot a step away while she's on the right half, expect a real stroll to the left instead", () => {
    expect(wanderGoal(500, TRACK, () => 0.82)).toBe(290);
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
    expect(spotUnder(400, 100, 60, TRACK)).toBe(270);
  });

  it("given the larva past the track's end, expect her stopping at the end", () => {
    expect(spotUnder(2000, 100, 60, TRACK)).toBe(TRACK);
  });

  it("given the larva before the track starts, expect her at the start", () => {
    expect(spotUnder(0, 100, 60, TRACK)).toBe(0);
  });
});

describe("aimPoseFor", () => {
  const chest = { x: 100, y: 400 };

  it("given Malenia's tool level with her chest, expect the arm cannon level", () => {
    expect(aimPoseFor(chest, { x: 300, y: 390 })).toBe("aim");
  });

  it("given the larva up and to her left, expect the arm cannon on the diagonal", () => {
    expect(aimPoseFor(chest, { x: -100, y: 200 })).toBe("aimDiagonal");
  });

  it("given Inde's playlist right over her head, expect the arm cannon straight up", () => {
    expect(aimPoseFor(chest, { x: 110, y: 100 })).toBe("aimUp");
  });
});

describe("sideOf", () => {
  it("given Malenia's favorite tool left of her, expect left", () => {
    expect(sideOf(140, 50)).toBe("left");
  });

  it("given Inde's anniversary playlist right of her, expect right", () => {
    expect(sideOf(140, 300)).toBe("right");
  });
});

describe("travel", () => {
  it("given a beam straight up at Claire's date, expect it pointing up", () => {
    expect(travel({ x: 10, y: 100 }, { x: 10, y: 0 })).toEqual({ dx: 0, dy: -100, angle: -90, length: 100 });
  });
});

describe("fromAnchor", () => {
  const anchor = { x: 20, y: 47 };

  it("given the arm cannon facing right, expect it ahead of her anchor", () => {
    expect(fromAnchor({ x: 37, y: 19 }, anchor, "right")).toEqual({ x: 17, y: 19 });
  });

  it("given Claire turned left to face Inde, expect the cannon mirrored behind the anchor", () => {
    expect(fromAnchor({ x: 37, y: 19 }, anchor, "left")).toEqual({ x: -17, y: 19 });
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

describe("endingStage", () => {
  it("given the moment the ending starts, expect her thanking the visitor", () => {
    expect(endingStage(0)).toBe("triumph");
  });

  it("given four seconds in, expect the ship landing", () => {
    expect(endingStage(4000)).toBe("landing");
  });

  it("given Claire and Inde watching the ship fly off, expect departing", () => {
    expect(endingStage(7000)).toBe("departing");
  });

  it("given the ship far away, expect nothing left but the orbit", () => {
    expect(endingStage(20000)).toBe("gone");
  });

  it("given every cue, expect each one to start a different stage, ending with gone", () => {
    expect(endingCues().map((at) => endingStage(at))).toEqual(["triumph", "landing", "boarding", "departing", "gone"]);
  });
});

describe("endingStart", () => {
  it("given the triumph, expect it to start at once", () => {
    expect(endingStart("triumph")).toBe(0);
  });

  it("given Inde waving the ship off, expect it to start once she's aboard", () => {
    expect(endingStart("departing")).toBe(6000);
  });
});

describe("endingPose", () => {
  it("given the thanks, expect her facing you", () => {
    expect(endingPose("triumph")).toBe("forward");
  });

  it("given Malenia boarding, expect the space jump", () => {
    expect(endingPose("boarding")).toBe("spaceJump");
  });

  it("given the ship flying off, expect her out of sight aboard it", () => {
    expect(endingPose("departing")).toBeNull();
  });
});

describe("boardingArc", () => {
  it("given the ship on her left, expect the leap ending on its middle to the left", () => {
    expect(boardingArc("left", 100, 80).x.at(-1)).toBe(-100);
  });

  it("given the ship on her right, expect the leap peaking above her before dropping in", () => {
    const arc = boardingArc("right", 100, 80);
    expect(arc.x.at(-1)).toBe(100);
    expect(Math.min(...arc.y)).toBe(-80);
  });
});
