import { PERCEPTION_DC, localRoll } from "../../../lib/dice";
import { createStore } from "../../../lib/store";
import { overlaySprite } from "../../../actions";

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

export const SUCCESS_LINE = "Cristopher joins your party. Class: Engineering Manager. Level 9.";
export const CRITICAL_BONUS = "Natural 20. He brings the whole team.";
export const FAILURE_LINE = "The dice disagree. Roll again, or just send the email.";

// how each verdict looks once it's stamped: its color, the line under it, an optional bonus line, and whether it bursts or cracks
export const VERDICT_LOOKS = {
  critical: { color: D20_GOLD, line: SUCCESS_LINE, bonus: CRITICAL_BONUS, flourish: "burst" },
  success: { color: D20_GOLD, line: SUCCESS_LINE, flourish: "ring" },
  failure: { color: DULL_RED, line: FAILURE_LINE, flourish: "none" },
  fumble: { color: D20_CRIMSON, line: FAILURE_LINE, flourish: "crack" },
};

// an icosahedron seen face on, on a 100 box: the ten facets you can see, lit from the top left. each tone is a
// palette letter, so neighbors never share a shade and the edges read without drawing them
export const D20_FACETS = [
  { points: "50,4 10,27 50,30", tone: "L" },
  { points: "50,4 90,27 50,30", tone: "M" },
  { points: "10,27 28,66 50,30", tone: "M" },
  { points: "90,27 50,30 72,66", tone: "D" },
  { points: "10,27 10,73 28,66", tone: "L" },
  { points: "90,27 90,73 72,66", tone: "M" },
  { points: "10,73 50,96 28,66", tone: "M" },
  { points: "90,73 50,96 72,66", tone: "X" },
  { points: "28,66 72,66 50,96", tone: "D" },
  { points: "50,30 72,66 28,66", tone: "H" },
];

// the gold of the die in five shades, a dark outline, and "n" for the number so a fumble can paint it red
export const D20_PALETTE = { K: "#2a1806", H: "#fbe9b4", L: "#efd28a", M: "#d8b25a", D: "#a57f34", X: "#7a5a20", n: "#2a1806" };

// the split that runs down the die on a natural 1, as lines on the 100 box: the main crack and its two branches
export const CRACK_LINES = [
  [[52, 4], [46, 24], [56, 38], [43, 55], [55, 70], [47, 96]],
  [[56, 38], [68, 44]],
  [[43, 55], [30, 58]],
];

// a 3 by 5 pixel font for the face numbers, the size every 16 bit menu prints its digits in
export const DIGIT_FONT = {
  0: ["nnn", "n.n", "n.n", "n.n", "nnn"],
  1: [".n.", "nn.", ".n.", ".n.", "nnn"],
  2: ["nnn", "..n", "nnn", "n..", "nnn"],
  3: ["nnn", "..n", ".nn", "..n", "nnn"],
  4: ["n.n", "n.n", "nnn", "..n", "..n"],
  5: ["nnn", "n..", "nnn", "..n", "nnn"],
  6: ["nnn", "n..", "nnn", "n.n", "nnn"],
  7: ["nnn", "..n", "..n", ".n.", ".n."],
  8: ["nnn", "n.n", "nnn", "n.n", "nnn"],
  9: ["nnn", "n.n", "nnn", "..n", "nnn"],
};

/**
 * A face number in the pixel font, digits side by side with a one pixel gap.
 * @param {number} face the number to print
 * @returns {string[]} five rows, "n" where the number is
 */
export const numberRows = (face) => {
  const glyphs = [...String(face)].map((digit) => DIGIT_FONT[digit]);
  return glyphs[0].map((_, row) => glyphs.map((glyph) => glyph[row]).join("."));
};

const toPoints = (points) => points.split(" ").map((pair) => pair.split(",").map(Number));

// which side of the line from a to b a point sits on, the sign is all that matters
const sideOf = ([ax, ay], [bx, by], [px, py]) => (bx - ax) * (py - ay) - (by - ay) * (px - ax);

const isInTriangle = ([a, b, c], point) => {
  const sides = [sideOf(a, b, point), sideOf(b, c, point), sideOf(c, a, point)];
  return sides.every((side) => side >= 0) || sides.every((side) => side <= 0);
};

/**
 * Fills the die's facets on a pixel grid, each pixel taking the tone of the facet under its center.
 * @param {number} size width and height of the grid
 * @returns {string[]} sprite rows of facet tones, "." outside the die
 */
export const facetRows = (size) => {
  const facets = D20_FACETS.map(({ points, tone }) => ({ corners: toPoints(points), tone }));
  const toneAt = (x, y) => {
    const center = [((x + 0.5) / size) * 100, ((y + 0.5) / size) * 100];
    return facets.find(({ corners }) => isInTriangle(corners, center))?.tone ?? ".";
  };
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => toneAt(x, y)).join(""));
};

/**
 * Draws a dark outline around a sprite, on the empty pixels that touch it, the way every sprite on the site has one.
 * @param {string[]} rows sprite rows
 * @param {string} ink the outline's palette letter
 * @returns {string[]} the same rows with the outline added
 */
export const outlineRows = (rows, ink = "K") => {
  const isFilled = (x, y) => (rows[y]?.[x] ?? ".") !== ".";
  const touches = (x, y) => isFilled(x - 1, y) || isFilled(x + 1, y) || isFilled(x, y - 1) || isFilled(x, y + 1);
  return rows.map((row, y) => [...row].map((char, x) => (char === "." && touches(x, y) ? ink : char)).join(""));
};

/**
 * The whole d20 as a sprite: shaded facets, outline, and the face number on the front triangle.
 * @param {number} size width and height in pixels
 * @param {number} face the number on the front
 * @returns {string[]} sprite rows for D20_PALETTE
 */
export const d20Rows = (size, face) => {
  const number = numberRows(face);
  const left = Math.round(size * 0.5 - number[0].length / 2);
  const top = Math.round(size * 0.56 - number.length / 2);
  return overlaySprite(outlineRows(facetRows(size)), { left, top, rows: number });
};

/**
 * The crack of a natural 1 on the same grid as the die, so it can lie right on top of it.
 * @param {number} size width and height in pixels
 * @returns {string[]} sprite rows, "c" along the crack
 */
export const crackRows = (size) => {
  const cracked = new Set();
  const toPixel = (value) => Math.min(size - 1, Math.floor((value / 100) * size));
  CRACK_LINES.forEach((line) =>
    line.slice(1).forEach(([toX, toY], index) => {
      const [fromX, fromY] = line[index];
      const steps = Math.ceil((Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY)) / 100) * size * 2);
      for (let step = 0; step <= steps; step += 1) {
        const t = step / steps;
        cracked.add(`${toPixel(fromX + (toX - fromX) * t)},${toPixel(fromY + (toY - fromY) * t)}`);
      }
    })
  );
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => (cracked.has(`${x},${y}`) ? "c" : ".")).join(""));
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
