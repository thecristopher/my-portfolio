// the avatar's combo, in the order it lands: a jab, a kick, then the rising uppercut that finishes it
export const COMBO_MOVES = ["punch", "kick", "shoryuken"];
// how long a click still counts as part of the same combo
export const COMBO_WINDOW_MS = 2500;

/**
 * Lands the next hit of the combo. Clicks older than the window fall off, and the finisher starts a fresh combo.
 * @param {number[]} clicks times of the clicks still in the combo, in ms
 * @param {number} now time of this click, in ms
 * @param {number} windowMs how fast the hits have to follow each other
 * @returns {{ clicks: number[], hit: number, move: string }} the combo after this click, which hit it was (1 based)
 *   and the move it throws
 */
export const landHit = (clicks, now, windowMs = COMBO_WINDOW_MS) => {
  const recent = [...clicks, now].filter((at) => now - at < windowMs);
  const hit = recent.length;
  const isFinisher = hit >= COMBO_MOVES.length;
  return { clicks: isFinisher ? [] : recent, hit, move: COMBO_MOVES[hit - 1] };
};

/**
 * Whether this move finishes the combo.
 * @param {string} move a move from COMBO_MOVES
 * @returns {boolean}
 */
export const isFinisher = (move) => move === COMBO_MOVES[COMBO_MOVES.length - 1];
