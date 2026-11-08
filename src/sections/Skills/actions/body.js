// how she moves, in sprite px and seconds, so every screen size gets the same feel once it's scaled up
const MOTION = {
  run: 95,
  roll: 55,
  // how fast she speeds up and brakes
  accel: 520,
  gravity: 900,
};
// under this speed, in sprite px per second, she counts as standing, and a ball this slow is still curling or uncurling
const STILL_UNDER = 6;
const CURL_UNDER = 30;
// how long she crouches on landing, in seconds
const LANDING = 0.2;
// how close to her goal counts as there, in screen px
const ARRIVED_WITHIN = 0.5;

/**
 * Her body at rest on the ground.
 * @param {number} x where she stands, px from the track's left end
 * @returns {{ x: number, y: number, vx: number, vy: number, distance: number, landing: number, isSpinning: boolean }}
 *   y is her height off the ground and vy her climb, both growing upward, distance how far she has traveled in
 *   sprite px, landing the seconds of crouch left from her last landing, isSpinning whether her jump is a somersault
 */
export const restingBody = (x = 0) => ({ x, y: 0, vx: 0, vy: 0, distance: 0, landing: 0, isSpinning: false });

/**
 * The speed she should be at to reach a spot and stop right on it: her top speed while it's far, braking as it nears.
 * @param {number} gap how far the spot is, signed, screen px
 * @param {number} top her top speed, screen px per second
 * @param {number} accel how hard she brakes, screen px per second squared
 * @returns {number} signed screen px per second
 */
export const arrivalSpeed = (gap, top, accel) => Math.sign(gap) * Math.min(top, Math.sqrt(2 * accel * Math.abs(gap)));

/**
 * Moves a number toward another by at most a step.
 * @param {number} from where it is
 * @param {number} to where it wants to be
 * @param {number} step the most it moves
 * @returns {number}
 */
export const approach = (from, to, step) => (from < to ? Math.min(to, from + step) : Math.max(to, from - step));

const stepAcross = (body, intent, dt, scale) => {
  const accel = MOTION.accel * scale;
  if (intent.goal === null) return { ...body, vx: approach(body.vx, 0, accel * dt) };
  const gap = intent.goal - body.x;
  if (Math.abs(gap) < ARRIVED_WITHIN && body.y === 0) return { ...body, x: intent.goal, vx: 0 };
  const wanted = arrivalSpeed(gap, MOTION[intent.gait ?? "run"] * scale, accel);
  return { ...body, vx: approach(body.vx, wanted, accel * dt) };
};

const stepUp = (body, dt, scale) => {
  if (body.y === 0 && body.vy === 0) return { ...body, landing: Math.max(0, body.landing - dt) };
  const vy = body.vy - MOTION.gravity * scale * dt;
  const y = body.y + vy * dt;
  if (y > 0) return { ...body, y, vy };
  return { ...body, y: 0, vy: 0, landing: LANDING, isSpinning: false };
};

/**
 * Her body a moment later: running or rolling toward her goal and braking onto it, or slowing to a stop when she has
 * none, while gravity pulls her down from a jump.
 * @param {ReturnType<typeof restingBody>} body her body now
 * @param {{ goal: number | null, gait: "run" | "roll" | null }} intent where she's headed and how, goal null to stand
 * @param {number} dt seconds since the last step
 * @param {number} scale screen px per sprite px
 * @returns {ReturnType<typeof restingBody>}
 */
export const stepBody = (body, intent, dt, scale) => {
  const moving = stepAcross(body, intent, dt, scale);
  const x = moving.x + moving.vx * dt;
  const falling = stepUp({ ...moving, x }, dt, scale);
  return { ...falling, distance: falling.distance + Math.abs(x - body.x) / scale };
};

/**
 * Her body pushing off the ground into a jump that peaks at a given height. Only works from the ground.
 * @param {ReturnType<typeof restingBody>} body
 * @param {number} height how high the jump peaks, screen px
 * @param {number} scale screen px per sprite px
 * @param {boolean} isSpinning whether it's a somersault
 * @returns {ReturnType<typeof restingBody>}
 */
export const jumpFrom = (body, height, scale, isSpinning = false) => {
  if (body.y > 0) return body;
  return { ...body, vy: Math.sqrt(2 * MOTION.gravity * scale * height), isSpinning };
};

/**
 * Whether her body has come to rest on its goal.
 * @param {ReturnType<typeof restingBody>} body
 * @param {number | null} goal
 * @returns {boolean}
 */
export const hasArrived = (body, goal) => goal !== null && body.x === goal && body.vx === 0 && body.y === 0;

// the pose for each way she can aim, by what she's doing
const AIMS = {
  stand: { aim: "aim", aimDiagonal: "aimDiagonal", aimUp: "aimUp" },
  run: { aim: "runAim", aimDiagonal: "runDiagonal", aimUp: "runDiagonal" },
  jump: { aim: "jump", aimDiagonal: "jumpDiagonal", aimUp: "jumpUp" },
};

const groundPose = (speed, gait, aim) => {
  if (gait === "roll") return speed < CURL_UNDER ? "curl" : "morph";
  if (speed < STILL_UNDER) return AIMS.stand[aim ?? "aim"];
  return aim ? AIMS.run[aim] : "run";
};

/**
 * The animation her body plays: a somersault or an aimed jump in the air, a crouch as she lands, the morph ball
 * curling, rolling and uncurling, running with or without the arm cannon raised, or standing with it.
 * @param {ReturnType<typeof restingBody>} body
 * @param {{ gait: "run" | "roll" | null, aim: "aim" | "aimDiagonal" | "aimUp" | null, scale: number }} look
 *   gait how she's getting around, aim how high she holds the arm cannon at something, null when nothing
 * @returns {string} the animation's name on the Power Suit's sheet
 */
export const poseFor = (body, { gait, aim, scale }) => {
  if (body.y > 0) return body.isSpinning ? "somersault" : AIMS.jump[aim ?? "aim"];
  const speed = Math.abs(body.vx) / scale;
  if (body.landing > 0 && gait !== "roll") return "land";
  return groundPose(speed, gait, aim);
};

/**
 * Which way she faces: the way she's moving, else toward what she's looking at, else the way she already faced.
 * @param {ReturnType<typeof restingBody>} body
 * @param {"left" | "right" | null} lookingTo where the thing she's looking at is, null when nothing
 * @param {"left" | "right"} was the way she faced a moment ago
 * @param {number} scale screen px per sprite px
 * @returns {"left" | "right"}
 */
export const facingFor = (body, lookingTo, was, scale) => {
  if (Math.abs(body.vx) / scale >= STILL_UNDER) return body.vx < 0 ? "left" : "right";
  return lookingTo ?? was;
};
