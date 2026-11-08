import { describe, expect, it } from "vitest";
import { approach, arrivalSpeed, facingFor, hasArrived, jumpFrom, poseFor, restingBody, stepBody } from ".";

const SCALE = 3;
const FRAME = 1 / 60;

// runs her body for a while toward a goal, the way the page does one frame at a time
const runFor = (body, intent, seconds) => {
  let next = body;
  for (let left = seconds; left > 0; left -= FRAME) next = stepBody(next, intent, FRAME, SCALE);
  return next;
};

describe("approach", () => {
  it("given Claire short of Inde's door, expect one step closer", () => {
    expect(approach(10, 20, 3)).toBe(13);
  });

  it("given a step longer than the way left, expect her right at the door and not past it", () => {
    expect(approach(18, 20, 5)).toBe(20);
  });
});

describe("arrivalSpeed", () => {
  it("given Malenia far from her goal, expect her top speed", () => {
    expect(arrivalSpeed(5000, 300, 1000)).toBe(300);
  });

  it("given the goal just ahead, expect her braking below her top speed", () => {
    expect(arrivalSpeed(10, 300, 1000)).toBeLessThan(300);
  });

  it("given the goal behind her, expect a speed heading back", () => {
    expect(arrivalSpeed(-5000, 300, 1000)).toBe(-300);
  });
});

describe("stepBody", () => {
  it("given Claire running to Inde across the track, expect her stopped right on the spot", () => {
    const body = runFor(restingBody(0), { goal: 400, gait: "run" }, 4);
    expect(hasArrived(body, 400)).toBe(true);
  });

  it("given a run, expect the distance counted in sprite px so the stride matches every scale", () => {
    const body = runFor(restingBody(0), { goal: 300, gait: "run" }, 4);
    expect(body.distance).toBeCloseTo(100, 0);
  });

  it("given no goal while she runs, expect her slowing down instead of stopping dead", () => {
    const running = { ...restingBody(0), vx: 200 };
    const next = stepBody(running, { goal: null, gait: null }, FRAME, SCALE);
    expect(next.vx).toBeGreaterThan(0);
    expect(next.vx).toBeLessThan(200);
  });

  it("given the morph ball, expect a slower trip than running the same way", () => {
    const rolled = runFor(restingBody(0), { goal: 400, gait: "roll" }, 2);
    const ran = runFor(restingBody(0), { goal: 400, gait: "run" }, 2);
    expect(rolled.x).toBeLessThan(ran.x);
  });

  it("given a jump, expect her back on the ground with a crouch to land on", () => {
    const leaping = jumpFrom(restingBody(100), 60, SCALE);
    const landed = runFor(leaping, { goal: null, gait: null }, 0.6);
    expect(landed.y).toBe(0);
    expect(landed.landing).toBeGreaterThan(0);
  });
});

describe("jumpFrom", () => {
  it("given Malenia on the ground, expect her leaving it", () => {
    expect(jumpFrom(restingBody(0), 60, SCALE).vy).toBeGreaterThan(0);
  });

  it("given her already in the air, expect no second jump", () => {
    const midair = { ...restingBody(0), y: 30, vy: 10 };
    expect(jumpFrom(midair, 60, SCALE)).toBe(midair);
  });

  it("given a somersault, expect the body to remember the spin", () => {
    expect(jumpFrom(restingBody(0), 60, SCALE, true).isSpinning).toBe(true);
  });
});

describe("poseFor", () => {
  const look = { gait: null, aim: null, scale: SCALE };

  it("given nothing going on, expect her standing with the arm cannon out", () => {
    expect(poseFor(restingBody(0), look)).toBe("aim");
  });

  it("given the larva right over her head, expect the arm cannon straight up", () => {
    expect(poseFor(restingBody(0), { ...look, aim: "aimUp" })).toBe("aimUp");
  });

  it("given Claire sprinting to Inde's date, expect the run", () => {
    expect(poseFor({ ...restingBody(0), vx: 250 }, { ...look, gait: "run" })).toBe("run");
  });

  it("given her running after the larva up high, expect the run with the cannon raised", () => {
    expect(poseFor({ ...restingBody(0), vx: 250 }, { ...look, gait: "run", aim: "aimDiagonal" })).toBe("runDiagonal");
  });

  it("given the morph ball at full roll, expect it rolling", () => {
    expect(poseFor({ ...restingBody(0), vx: 160 }, { ...look, gait: "roll" })).toBe("morph");
  });

  it("given the ball barely moving, expect her curling in or out of it", () => {
    expect(poseFor({ ...restingBody(0), vx: 20 }, { ...look, gait: "roll" })).toBe("curl");
  });

  it("given a somersault, expect her spinning", () => {
    expect(poseFor({ ...restingBody(0), y: 40, isSpinning: true }, look)).toBe("somersault");
  });

  it("given a straight jump at Malenia's larva overhead, expect the jump aimed up", () => {
    expect(poseFor({ ...restingBody(0), y: 40 }, { ...look, aim: "aimUp" })).toBe("jumpUp");
  });

  it("given her just landed, expect the crouch", () => {
    expect(poseFor({ ...restingBody(0), landing: 0.1 }, look)).toBe("land");
  });
});

describe("facingFor", () => {
  it("given Inde running left, expect her facing left whatever she looks at", () => {
    expect(facingFor({ ...restingBody(0), vx: -200 }, "right", "right", SCALE)).toBe("left");
  });

  it("given her standing with the larva on her left, expect her turning to it", () => {
    expect(facingFor(restingBody(0), "left", "right", SCALE)).toBe("left");
  });

  it("given her standing with nothing to look at, expect the way she already faced", () => {
    expect(facingFor(restingBody(0), null, "left", SCALE)).toBe("left");
  });
});
