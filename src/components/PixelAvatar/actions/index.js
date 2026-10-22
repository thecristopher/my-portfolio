export const JAB_REACH = 4;

// snaps motion to a few frames, so a move reads like sprite frames instead of a smooth tween
const stepped = (frames) => (progress) => Math.round(progress * frames) / frames;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// when each move connects, so the spark, the sound and the combo counter all land on the same frame
export const IMPACT_MS = { punch: 70, kick: 90, shoryuken: 400 };

// the shoryuken in beats: a dip to load up, the rising uppercut, a hang at the top, then the fall and a dip on
// landing. the pose frames do the acting, the body only travels, so the pixels never stretch
const SHORYUKEN = {
  y: [0, 4, -50, -58, -52, 0, 3, 0],
  transition: {
    duration: 1,
    times: [0, 0.14, 0.36, 0.48, 0.6, 0.84, 0.9, 1],
    ease: ["easeOut", "easeOut", "easeOut", "easeIn", "easeIn", "easeOut", "easeOut"],
  },
};
// the rising pose takes over as he leaves the ground and lets go as he starts to fall
export const SHORYUKEN_ARM_UP_MS = 140;
export const SHORYUKEN_ARM_DOWN_MS = 720;
// the kick in frames: knee up, leg out and held so it reads, knee back, foot down
const KICK_FRAMES = [
  ["kickChamber", 70],
  ["kickExtend", 220],
  ["kickChamber", 80],
];
export const SHORYUKEN_LANDS_MS = 840;

/**
 * One straight jab: the fist snaps out and back while the chest leans into it.
 * @param {{ arm: object, chest: object }} controls framer animation controls for each layer
 * @returns {Promise<void>} resolves once the fist is back on guard
 */
export const throwPunch = async ({ arm, chest }) => {
  const snap = { duration: 0.24, ease: stepped(4) };
  chest.start({ x: [0, 1, 0], transition: snap });
  await arm.start({ x: [0, JAB_REACH, 0], transition: snap });
};

/**
 * A front kick: the knee chambers, the leg snaps out and holds, then folds back, while the body shifts back a
 * couple of pixels to balance it.
 * @param {{ body: object, setPose: (pose: string | null) => void }} controls body controls and the pose switch
 * @returns {Promise<void>} resolves once the foot is planted again
 */
export const throwKick = async ({ body, setPose }) => {
  body.start({ x: [0, -2, -2, 0], transition: { duration: 0.37, times: [0, 0.2, 0.8, 1], ease: stepped(2) } });
  for (const [pose, holdMs] of KICK_FRAMES) {
    setPose(pose);
    await wait(holdMs);
  }
  setPose(null);
};

/**
 * The finisher: dip, rise with the fist up and the knee high, hang for a beat and land.
 * @param {{ body: object, setPose: (pose: string | null) => void }} controls body controls and the pose switch
 * @returns {Promise<void>} resolves once he is back in his stance
 */
export const throwShoryuken = async ({ body, setPose }) => {
  const rise = body.start(SHORYUKEN);
  await wait(SHORYUKEN_ARM_UP_MS);
  setPose("shoryuken");
  await wait(SHORYUKEN_ARM_DOWN_MS - SHORYUKEN_ARM_UP_MS);
  setPose(null);
  await rise;
};

/**
 * Groups sprite pixels by color into one svg path each, a unit square per pixel.
 * @param {{ x: number, y: number, color: string }[]} pixels the pixels of one layer
 * @returns {{ color: string, d: string }[]} one path per color, in the order the colors first appear
 */
export const pixelsToPaths = (pixels = []) => {
  const byColor = new Map();
  for (const { x, y, color } of pixels) byColor.set(color, `${byColor.get(color) ?? ""}M${x} ${y}h1v1h-1z`);
  return [...byColor].map(([color, d]) => ({ color, d }));
};
