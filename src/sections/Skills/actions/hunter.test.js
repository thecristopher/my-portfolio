import { describe, expect, it } from "vitest";
import {
  aimPoseFor,
  boardingShift,
  endingCues,
  endingLook,
  endingStage,
  endingStart,
  facingToward,
  hunterPose,
  muzzleOffset,
  shipSideFor,
  shotFlight,
  trackSpot,
} from ".";

// the box Claire's sprite takes on screen when she stands in for Samus on a date by the stars
const clairesBox = { left: 100, top: 400, width: 122, height: 112 };
const MUZZLE = { x: 58, y: 17 };

describe("trackSpot", () => {
  it("given Malenia scrolling in before the orbit is up, expect the left end of the track", () => {
    expect(trackSpot(0.05)).toBe(0);
  });

  it("given the middle of the scroll, expect the middle of the track", () => {
    expect(trackSpot(0.5)).toBeCloseTo(0.5);
  });

  it("given Inde scrolled past the orbit, expect the right end of the track", () => {
    expect(trackSpot(0.95)).toBe(1);
  });
});

describe("hunterPose", () => {
  const hunting = { targetPose: null, sightingPose: null, isRunning: false, isCurled: false };

  it("given a tool in her sights while running, expect her to stop and aim at it", () => {
    expect(hunterPose({ ...hunting, targetPose: "aimDiagonal", isRunning: true })).toBe("aimDiagonal");
  });

  it("given a tool picked while she's curled up, expect her out of the ball and aiming", () => {
    expect(hunterPose({ ...hunting, targetPose: "aim", isCurled: true })).toBe("aim");
  });

  it("given Inde scrolling while the larva peeks, expect her running past it", () => {
    expect(hunterPose({ ...hunting, sightingPose: "aimUp", isRunning: true })).toBe("run");
  });

  it("given the larva peeking while she stands, expect her pointing up at it", () => {
    expect(hunterPose({ ...hunting, sightingPose: "aimUp" })).toBe("aimUp");
  });

  it("given the larva peeking while she's curled up, expect her to stay a ball", () => {
    expect(hunterPose({ ...hunting, sightingPose: "aimUp", isCurled: true })).toBe("morph");
  });

  it("given a short rest, expect her standing", () => {
    expect(hunterPose(hunting)).toBe("idle");
  });
});

describe("aimPoseFor", () => {
  const chest = { x: 0, y: 0 };

  it("given Malenia's tool level with her chest, expect the cannon level", () => {
    expect(aimPoseFor(chest, { x: 200, y: -20 })).toBe("aim");
  });

  it("given the larva up and to her left, expect the cannon on the diagonal", () => {
    expect(aimPoseFor(chest, { x: -200, y: -200 })).toBe("aimDiagonal");
  });

  it("given Inde's playlist right over her head, expect the cannon straight up", () => {
    expect(aimPoseFor(chest, { x: 30, y: -400 })).toBe("aimUp");
  });
});

describe("endingStage", () => {
  it("given the moment the larva falls, expect the cannon raised in triumph", () => {
    expect(endingStage(0)).toBe("triumph");
  });

  it("given two seconds after, expect her out of the suit", () => {
    expect(endingStage(2000)).toBe("unsuited");
  });

  it("given the ship down and her leaping, expect boarding", () => {
    expect(endingStage(4500)).toBe("boarding");
  });

  it("given Claire and Inde watching the ship fly off, expect departing", () => {
    expect(endingStage(6000)).toBe("departing");
  });

  it("given the ship far away, expect nothing left but the orbit", () => {
    expect(endingStage(9000)).toBe("gone");
  });

  it("given every cue, expect each one to start a different stage, ending with gone", () => {
    expect(endingCues().map(endingStage)).toEqual(["triumph", "unsuited", "landing", "boarding", "departing", "gone"]);
  });
});

describe("endingStart", () => {
  it("given the triumph, expect it to start the moment the larva falls", () => {
    expect(endingStart("triumph")).toBe(0);
  });

  it("given Inde waving the ship off, expect it to start once she's aboard", () => {
    expect(endingStart("departing")).toBe(4900);
  });
});

describe("endingLook", () => {
  it("given the triumph, expect the Power Suit with the cannon straight up", () => {
    expect(endingLook("triumph")).toEqual({ suit: "power", pose: "aimUp" });
  });

  it("given the ship landing, expect Malenia's favorite pose, hands on her hips", () => {
    expect(endingLook("landing")).toEqual({ suit: "zero", pose: "victory" });
  });

  it("given her flying away, expect her out of sight", () => {
    expect(endingLook("departing")).toBeNull();
  });
});

describe("boardingShift", () => {
  it("given the ship on her left, expect a leap left to its middle", () => {
    expect(boardingShift("left", 76, 184, 20)).toBe(-110);
  });

  it("given the ship on her right, expect a leap right to its middle", () => {
    expect(boardingShift("right", 76, 184, 20)).toBe(110);
  });
});

describe("shipSideFor", () => {
  it("given Samus on the left half of the screen, expect the ship landing on her right", () => {
    expect(shipSideFor({ left: 100, width: 112 }, 1280)).toBe("right");
  });

  it("given Samus on the right half, expect the ship landing on her left", () => {
    expect(shipSideFor({ left: 1000, width: 112 }, 1280)).toBe("left");
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

describe("muzzleOffset", () => {
  it("given her facing right at 2x, expect the cannon's end scaled from the left edge", () => {
    expect(muzzleOffset(clairesBox, MUZZLE, 2, "right")).toEqual({ x: 116, y: 34 });
  });

  it("given her facing left at 2x, expect the cannon's end mirrored across the sprite", () => {
    expect(muzzleOffset(clairesBox, MUZZLE, 2, "left")).toEqual({ x: 6, y: 34 });
  });
});

describe("shotFlight", () => {
  it("given a shot straight up at Claire's date, expect it pointing up", () => {
    expect(shotFlight({ x: 0, y: 0 }, { x: 0, y: -700 })).toMatchObject({ dx: 0, dy: -700, angle: -90, seconds: 0.5 });
  });

  it("given a tool right beside the cannon, expect the shortest flight so the shot still shows", () => {
    expect(shotFlight({ x: 0, y: 0 }, { x: 10, y: 0 }).seconds).toBe(0.12);
  });
});
