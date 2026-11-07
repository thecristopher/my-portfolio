// how fast she walks and runs, in screen px per second
const WALK_SPEED = 70;
const RUN_SPEED = 260;
// past this share of the track a stroll turns into a run
const RUN_FROM = 0.4;
// how far a stroll goes at the least, as a share of the track, so she never shuffles in place
const SHORTEST_STROLL = 0.2;
// how long she stands between strolls, in ms
const REST = { least: 1800, spread: 2600 };

// how steep a line has to climb before she raises the Paralyzer to the diagonal, and then straight up, in degrees
const DIAGONAL_FROM = 22.5;
const UP_FROM = 67.5;

/**
 * How she gets from one spot on her track to another: walking a short way, running a long one or after the larva,
 * how long it takes and which way she faces.
 * @param {number} from where she stands, px from the track's left end
 * @param {number} to where she's going
 * @param {number} track how long the track is, px
 * @param {boolean} isChasing whether she's going after the larva, which is always a run
 * @returns {{ gait: "walk" | "run", seconds: number, facing: "left" | "right" }}
 */
export const strideFor = (from, to, track, isChasing = false) => {
  const distance = Math.abs(to - from);
  const gait = isChasing || distance > track * RUN_FROM ? "run" : "walk";
  const speed = gait === "run" ? RUN_SPEED : WALK_SPEED;
  return { gait, seconds: distance / speed, facing: to < from ? "left" : "right" };
};

/**
 * Where she strolls to next when there's nothing to chase: anywhere on the track, but never a step away.
 * @param {number} from where she stands, px from the track's left end
 * @param {number} track how long the track is, px
 * @param {() => number} random a number from 0 up to 1
 * @returns {number} px from the track's left end
 */
export const wanderGoal = (from, track, random = Math.random) => {
  const goal = random() * track;
  if (Math.abs(goal - from) >= track * SHORTEST_STROLL) return goal;
  const away = track * (SHORTEST_STROLL + 0.15);
  return from < track / 2 ? from + away : from - away;
};

/**
 * How long she stands before her next stroll.
 * @param {() => number} random a number from 0 up to 1
 * @returns {number} ms
 */
export const restFor = (random = Math.random) => Math.round(REST.least + random() * REST.spread);

/**
 * The spot on her track right under something on the screen, so she can stand beneath it.
 * @param {number} x the thing's horizontal center on screen
 * @param {number} trackLeft where the track starts on screen
 * @param {number} width her sprite's width
 * @param {number} track how long the track is, px
 * @returns {number} px from the track's left end, kept on the track
 */
export const spotUnder = (x, trackLeft, width, track) => Math.min(track, Math.max(0, x - trackLeft - width / 2));

/**
 * How high she raises the Paralyzer to point at something: level, diagonal or straight up, whichever is closest.
 * @param {{ x: number, y: number }} from where she points from
 * @param {{ x: number, y: number }} to what she points at, screen y growing downward
 * @returns {"aim" | "aimDiagonal" | "aimUp"}
 */
export const aimPoseFor = (from, to) => {
  const climb = (Math.atan2(from.y - to.y, Math.abs(to.x - from.x)) * 180) / Math.PI;
  if (climb >= UP_FROM) return "aimUp";
  if (climb >= DIAGONAL_FROM) return "aimDiagonal";
  return "aim";
};

/**
 * The animation Samus plays while she hunts. Aiming at a picked tool beats everything, then walking or running, then
 * pointing at the larva when it peeks out, and otherwise she stands.
 * @param {{ targetPose: string | null, sightingPose: string | null, gait: "walk" | "run" | null }} state
 *   targetPose is how she aims at the picked tool, sightingPose how she points at the peeking larva, gait how she's
 *   moving, null when she isn't
 * @returns {string} the animation's name on the Zero Suit's sheet
 */
export const hunterPose = ({ targetPose, sightingPose, gait }) => targetPose ?? gait ?? sightingPose ?? "idle";

// the ending after the larva is defeated, each stage with the moment it ends, in ms after it starts
const ENDING = [
  { stage: "victory", until: 1800 },
  { stage: "landing", until: 3400 },
  { stage: "boarding", until: 4000 },
  { stage: "departing", until: 6400 },
];

/**
 * Where the ending is a while after it starts: her victory spin, the ship landing beside her, her flip aboard, the
 * ship flying off into the orbit, and then nothing left but the orbit.
 * @param {number} elapsed ms since the ending started
 * @returns {"victory" | "landing" | "boarding" | "departing" | "gone"}
 */
export const endingStage = (elapsed) => ENDING.find((part) => elapsed < part.until)?.stage ?? "gone";

/**
 * When each stage of the ending starts, so a timer can wake for every one.
 * @returns {number[]} ms after the ending starts, the first stage starting at once
 */
export const endingCues = () => [0, ...ENDING.map((part) => part.until)];

/**
 * When a stage of the ending starts.
 * @param {ReturnType<typeof endingStage>} stage
 * @returns {number} ms after the ending starts
 */
export const endingStart = (stage) => endingCues().find((at) => endingStage(at) === stage) ?? 0;

/**
 * Her animation in a stage of the ending: the victory spin until the ship is down, then the flip aboard, which she
 * keeps out of sight while the ship flies her away.
 * @param {ReturnType<typeof endingStage>} stage
 * @returns {"victory" | "flip"}
 */
export const endingPose = (stage) => (stage === "victory" || stage === "landing" ? "victory" : "flip");

/**
 * Which way she turns to face a point on the screen.
 * @param {{ left: number, width: number }} box her sprite's box on screen
 * @param {number} x the point's horizontal position on screen
 * @returns {"left" | "right"}
 */
export const facingToward = (box, x) => (x < box.left + box.width / 2 ? "left" : "right");

/**
 * How far and along which angle something travels from one point to another.
 * @param {{ x: number, y: number }} from where it leaves
 * @param {{ x: number, y: number }} to where it arrives
 * @returns {{ dx: number, dy: number, angle: number, length: number }} angle in degrees, 0 pointing right
 */
export const travel = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return { dx, dy, angle: (Math.atan2(dy, dx) * 180) / Math.PI, length: Math.hypot(dx, dy) };
};

/**
 * Which side of her the gunship lands on: whichever side of the track has more room.
 * @param {number} at where she stands, px from the track's left end
 * @param {number} track how long the track is, px
 * @returns {"left" | "right"}
 */
export const shipSideFor = (at, track) => (at < track / 2 ? "right" : "left");

/**
 * How far she moves sideways flipping from her spot into the middle of the landed gunship.
 * @param {"left" | "right"} side which side of her the ship landed on
 * @param {number} width her sprite's width on screen
 * @param {number} shipWidth the ship's width on screen
 * @param {number} tuck how far the ship tucks in behind her, on screen
 * @returns {number} px, negative to the left
 */
export const boardingShift = (side, width, shipWidth, tuck) => {
  const reach = shipWidth / 2 + width / 2 - tuck;
  return side === "left" ? -reach : reach;
};
