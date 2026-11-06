// the stretch of the scroll she runs across, so she crosses under the orbit while it's on screen
const TRACK = { from: 0.2, to: 0.8 };
// how fast the charge shot flies, in screen px per second
const SHOT_SPEED = 1400;
// the shortest flight, so a tool right above her still shows a shot
const SHORTEST_FLIGHT = 0.12;

/**
 * How far along her track Samus stands for the section's scroll.
 * @param {number} progress the orbit's scroll progress, 0 as it comes up the page and 1 as it leaves
 * @returns {number} 0 at the left end of the track, 1 at the right
 */
export const trackSpot = (progress) => {
  const spot = (progress - TRACK.from) / (TRACK.to - TRACK.from);
  return Math.min(1, Math.max(0, spot));
};

// how steep a line has to climb before she raises the cannon to the diagonal, and then straight up, in degrees
const DIAGONAL_FROM = 22.5;
const UP_FROM = 67.5;

/**
 * How high she raises the cannon to point at something: level, diagonal or straight up, whichever is closest.
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
 * The animation Samus plays while she hunts. Aiming at a picked tool beats everything, running beats resting, a long
 * rest curls her into the morph ball, and standing she points the cannon at the larva whenever it peeks out. Curled up
 * she's resting, so a peek doesn't wake her, only a picked tool does.
 * @param {{ targetPose: string | null, sightingPose: string | null, isRunning: boolean, isCurled: boolean }} state
 *   targetPose is how she aims at the picked tool, sightingPose how she points at the peeking larva, null when there's none
 * @returns {string} the animation's name on the Power Suit's sheet
 */
export const hunterPose = ({ targetPose, sightingPose, isRunning, isCurled }) => {
  if (targetPose) return targetPose;
  if (isRunning) return "run";
  if (isCurled) return "morph";
  return sightingPose ?? "idle";
};

// the ending after the larva is defeated, each stage with the moment it ends, in ms after the last hit
const ENDING = [
  { stage: "triumph", until: 1200 },
  { stage: "unsuited", until: 2800 },
  { stage: "landing", until: 4300 },
  { stage: "boarding", until: 4900 },
  { stage: "departing", until: 7300 },
];

/**
 * Where the ending is a while after the last hit: the cannon raised in triumph, the suit off, the ship landing, her
 * leaping aboard, the ship flying off into the orbit, and then nothing left but the orbit.
 * @param {number} elapsed ms since the last hit
 * @returns {"triumph" | "unsuited" | "landing" | "boarding" | "departing" | "gone"}
 */
export const endingStage = (elapsed) => ENDING.find((part) => elapsed < part.until)?.stage ?? "gone";

/**
 * When each stage of the ending starts, so a timer can wake for every one.
 * @returns {number[]} ms after the last hit, the first stage starting at once
 */
export const endingCues = () => [0, ...ENDING.map((part) => part.until)];

/**
 * When a stage of the ending starts.
 * @param {ReturnType<typeof endingStage>} stage
 * @returns {number} ms after the last hit
 */
export const endingStart = (stage) => endingCues().find((at) => endingStage(at) === stage) ?? 0;

/**
 * How Samus looks in a stage of the ending: which suit and which animation.
 * @param {ReturnType<typeof endingStage>} stage
 * @returns {{ suit: "power" | "zero", pose: string } | null} null once she's aboard the ship
 */
export const endingLook = (stage) => {
  if (stage === "triumph") return { suit: "power", pose: "aimUp" };
  if (stage === "unsuited" || stage === "landing") return { suit: "zero", pose: "victory" };
  if (stage === "boarding") return { suit: "zero", pose: "leap" };
  return null;
};

/**
 * Which way she turns to face a point on the screen.
 * @param {{ left: number, width: number }} box her sprite's box on screen
 * @param {number} x the point's horizontal position on screen
 * @returns {"left" | "right"}
 */
export const facingToward = (box, x) => (x < box.left + box.width / 2 ? "left" : "right");

/**
 * Where the cannon ends, measured from her sprite's top left corner. Facing left mirrors it across the sprite.
 * @param {{ width: number }} box her sprite's box on screen
 * @param {{ x: number, y: number }} muzzle the cannon's end on the frame, in sprite px
 * @param {number} scale screen px per sprite px
 * @param {"left" | "right"} facing
 * @returns {{ x: number, y: number }}
 */
export const muzzleOffset = (box, muzzle, scale, facing) => {
  const x = muzzle.x * scale;
  return { x: facing === "left" ? box.width - x : x, y: muzzle.y * scale };
};

/**
 * The flight of a shot from one point to another: how far it travels, the angle it points along and how long it takes.
 * @param {{ x: number, y: number }} from where it leaves
 * @param {{ x: number, y: number }} to where it lands
 * @returns {{ dx: number, dy: number, angle: number, seconds: number }} angle in degrees, 0 flying right
 */
export const shotFlight = (from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const seconds = Math.max(SHORTEST_FLIGHT, Math.hypot(dx, dy) / SHOT_SPEED);
  return { dx, dy, angle, seconds };
};

/**
 * Which side of her the gunship lands on: whichever side of the screen has more room.
 * @param {{ left: number, width: number }} box her sprite's box on screen
 * @param {number} screenWidth the width of the screen
 * @returns {"left" | "right"}
 */
export const shipSideFor = (box, screenWidth) => (box.left + box.width / 2 < screenWidth / 2 ? "right" : "left");

/**
 * How far she moves sideways leaping from her spot into the middle of the landed gunship.
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
