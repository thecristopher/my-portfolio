import { PERCEPTION_DC, localRoll } from "../../../lib/dice";
import { createStore } from "../../../lib/store";

export const D20_GOLD = "#d8b25a";
export const D20_CRIMSON = "#c8443c";
export const DULL_RED = "#8f4a42";

// the camp rolls the same DC the API rolls against
export const PERSUASION_DC = PERCEPTION_DC;

// the API gets this long to answer before the page rolls the check itself
export const ROLL_PATIENCE_MS = 1500;
// the die always tumbles at least this long, even when the answer is instant
export const TUMBLE_MS = 1600;
// once the die lands, the verdict, its line and the light rays all need this long to settle
export const VERDICT_SETTLE_MS = 1800;

export const SUCCESS_LINE = "Cristopher joins your party. Nine years of experience, all of it on your side.";
export const CRITICAL_BONUS = "Natural 20. He brings the whole team.";
export const FAILURE_LINE = "The dice disagree. Roll again, or just send the email.";

// how each verdict looks once it's stamped: its color, the line under it, an optional bonus line, and whether it bursts or cracks
export const VERDICT_LOOKS = {
  critical: { color: D20_GOLD, line: SUCCESS_LINE, bonus: CRITICAL_BONUS, flourish: "burst" },
  success: { color: D20_GOLD, line: SUCCESS_LINE, flourish: "ring" },
  failure: { color: DULL_RED, line: FAILURE_LINE, flourish: "none" },
  fumble: { color: D20_CRIMSON, line: FAILURE_LINE, flourish: "crack" },
};

/**
 * Checks a roll looks like a real d20 result before the page trusts it.
 * @param {*} result what came back
 * @returns {boolean} true for a whole number from 1 to 20 with a success flag
 */
export const isValidRoll = (result) =>
  Number.isInteger(result?.roll) && result.roll >= 1 && result.roll <= 20 && typeof result.success === "boolean";

/**
 * Rolls through the API, but never waits on it forever: a failed, slow or broken answer becomes a local roll.
 * @param {() => Promise<*>} request asks the API for a roll
 * @param {{ patienceMs?: number, random?: () => number }} options how long to wait, and the dice for the local roll
 * @returns {Promise<{ roll: number, dc: number, success: boolean, message: string }>} the roll that counts
 */
export const rollWithPatience = async (request, { patienceMs = ROLL_PATIENCE_MS, random = Math.random } = {}) => {
  let timer;
  const patience = new Promise((resolve) => {
    timer = setTimeout(() => resolve(null), patienceMs);
  });
  const fromApi = Promise.resolve()
    .then(request)
    .catch(() => null);
  const answer = await Promise.race([fromApi, patience]);
  clearTimeout(timer);
  return isValidRoll(answer) ? answer : localRoll(random);
};

/**
 * Picks the next face to flash while the die tumbles, never the same one twice in a row so it reads as spinning.
 * @param {number} previous the face showing now
 * @param {() => number} random 0 to 1
 * @returns {number} a face from 1 to 20
 */
export const nextFlickerFace = (previous, random = Math.random) => {
  const face = Math.floor(random() * 20) + 1;
  return face === previous ? (face % 20) + 1 : face;
};

/**
 * Cleans a saved face so a broken save never shows a 37 on the die.
 * @param {*} raw what was saved
 * @returns {number | null} a face from 1 to 20, or null
 */
export const cleanFace = (raw) => (Number.isInteger(raw) && raw >= 1 && raw <= 20 ? raw : null);

/**
 * The face the resting die shows: the last roll once it's been thrown, a proud 20 until then.
 * @param {boolean} isFound whether the die has been rolled before
 * @param {number | null} lastFace the last roll's face
 * @returns {number} the face to draw
 */
export const faceToShow = (isFound, lastFace) => (isFound && lastFace ? lastFace : 20);

// the last face the die landed on, kept between visits so the die on the page still shows it
export const lastFace = createStore(null, { storageKey: "d20-last-face", read: cleanFace });
