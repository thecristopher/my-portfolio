import { pixelSteps } from "../../../lib/motion";

export const JAB_REACH = 4;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// when each move connects, so the spark, the sound and the combo counter all land on the same frame
export const IMPACT_MS = { punch: 70, kick: 90, shoryuken: 400 };

// the shoryuken in beats: a deep dip to load up, the rising uppercut, a hang at the top, then the fall and a dip on
// landing. the pose frames do the acting, the body only travels, so the pixels never stretch. on the way up he spins
// round once, the sprite flipping to his back and to the front again like the corkscrew in the arcade
const SHORYUKEN = {
  x: [0, -4, 12, 16, 16, 6, 0, 0],
  y: [0, 5, -50, -58, -52, 0, 4, 0],
  scaleX: [1, 1, 1, 0.35, -1, 0.35, 1, 1],
  transition: {
    x: { duration: 1, times: [0, 0.14, 0.36, 0.48, 0.6, 0.84, 0.9, 1], ease: pixelSteps(2) },
    y: {
      duration: 1,
      times: [0, 0.14, 0.36, 0.48, 0.6, 0.84, 0.9, 1],
      ease: ["easeOut", "easeOut", "easeOut", "easeIn", "easeIn", "easeOut", "easeOut"],
    },
    // a whole turn while rising, back to the front by the time the fist connects
    scaleX: { duration: 1, times: [0, 0.14, 0.18, 0.22, 0.27, 0.32, 0.36, 1], ease: pixelSteps(1) },
  },
};
// each beat of the shoryuken as the pose it holds and for how long: wind up, rise, fall, then back in his stance
const SHORYUKEN_FRAMES = [
  ["shoryukenWindup", 140],
  ["shoryuken", 580],
  ["shoryukenFall", 120],
];
// the kick in frames: knee up, leg out and held so it reads, knee back, foot down
const KICK_FRAMES = [
  ["kickChamber", 80],
  ["kickExtend", 220],
  ["kickRecoil", 90],
];
export const SHORYUKEN_LANDS_MS = 840;

/**
 * One straight jab: the fist snaps out and back while the chest leans into it.
 * @param {{ arm: object, chest: object }} controls framer animation controls for each layer
 * @returns {Promise<void>} resolves once the fist is back on guard
 */
export const throwPunch = async ({ arm, chest }) => {
  const snap = { duration: 0.24, ease: pixelSteps(4) };
  chest.start({ x: [0, 1, 0], transition: snap });
  await arm.start({ x: [0, JAB_REACH, 0], transition: snap });
};

/**
 * Plays pose frames one after the other, each held for its time, then hands the sprite back to his stance.
 * @param {(pose: string | null) => void} setPose the pose switch
 * @param {[string, number][]} frames pose names from COMBO_POSES and how long each one holds, in ms
 * @returns {Promise<void>} resolves once the last frame is done
 */
const playFrames = async (setPose, frames) => {
  for (const [pose, holdMs] of frames) {
    setPose(pose);
    await wait(holdMs);
  }
  setPose(null);
};

/**
 * A front kick: the knee chambers, the leg snaps out and holds, then folds back, while the body leans back against
 * it and slides forward a couple of pixels behind the kick.
 * @param {{ body: object, setPose: (pose: string | null) => void }} controls body controls and the pose switch
 * @returns {Promise<void>} resolves once the foot is planted again
 */
export const throwKick = async ({ body, setPose }) => {
  body.start({ x: [0, 4, 10, 10, 0], transition: { duration: 0.39, times: [0, 0.2, 0.3, 0.78, 1], ease: pixelSteps(2) } });
  await playFrames(setPose, KICK_FRAMES);
};

/**
 * The finisher: sink into the knees, spin up with the fist high and the knee up, hang for a beat and land tucked.
 * @param {{ body: object, setPose: (pose: string | null) => void }} controls body controls and the pose switch
 * @returns {Promise<void>} resolves once he is back in his stance
 */
export const throwShoryuken = async ({ body, setPose }) => {
  const rise = body.start(SHORYUKEN);
  await playFrames(setPose, SHORYUKEN_FRAMES);
  await rise;
};

/**
 * The svg transform that shifts one layer of the sprite by whole pixels.
 * @param {[number, number]} shift pixels right and down, [0, 0] when the layer stays put
 * @returns {string | undefined} a translate, or nothing when there's nothing to move
 */
export const shiftTransform = ([dx, dy] = [0, 0]) => (dx === 0 && dy === 0 ? undefined : `translate(${dx} ${dy})`);
