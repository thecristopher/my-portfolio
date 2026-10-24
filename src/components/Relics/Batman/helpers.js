import { overlaySprite } from "../../../actions";

export const SIGNAL_YELLOW = "#ffd84a";
// detective mode paints the world in this blue, and whatever the scan locks on to in orange
export const DETECTIVE_BLUE = "#4fb6ff";
export const ARKHAM_ORANGE = "#ff9a3c";
export const GOTHAM_NIGHT = "#04060b";

// the beats of the moment in seconds. the picture and the sound both read from here so they never drift apart
export const BEATS = {
  thunder: 0.3,
  swing: 0.8,
  lit: 1.9,
  detective: 2.3,
  lock: 3.0,
  hud: 3.3,
  closed: 5.8,
  // the stamp has landed and the frame holds from here
  end: 6.3,
};

// what the case file types out once the scan locks on
export const HUD_LINES = [
  { label: "CASE FILE", value: "Cristopher Cervantes" },
  { label: "LOCATION", value: "Rosarito, Pacific Time" },
  { label: "SPECIALTY", value: "border apps to AI agents" },
  { label: "STATUS", value: "on call for teams that ship" },
];

export const HUD_TIMING = { startAt: BEATS.hud, perLetter: 0.015, pause: 0.12 };

/**
 * Gives each HUD line its start time, so a line only starts typing once the one above it is done.
 * @param {{ label: string, value: string }[]} lines what to type, top to bottom
 * @param {{ startAt: number, perLetter: number, pause: number }} timing when the first line starts, seconds per letter, and the breath between lines
 * @returns {{ label: string, value: string, text: string, at: number, endsAt: number }[]} the lines with their full text and timing
 */
export const scheduleLines = (lines, { startAt, perLetter, pause }) => {
  let cursor = startAt;
  return lines.map((line) => {
    const text = `${line.label}: ${line.value}`;
    const at = cursor;
    const endsAt = at + text.length * perLetter;
    cursor = endsAt + pause;
    return { ...line, text, at, endsAt };
  });
};

/**
 * Rain over Gotham, each streak in its own lane with its own pace so it never falls in rows.
 * @param {number} count how many streaks
 * @returns {{ left: number, delay: number, duration: number, length: number }[]} left in %, delay and duration in seconds, length in vh
 */
export const rainStreaks = (count) =>
  Array.from({ length: count }, (_, index) => ({
    left: (index * 37 + (index % 3) * 11) % 100,
    delay: (index * 0.13) % 0.9,
    duration: 0.45 + ((index * 7) % 5) * 0.07,
    length: 8 + ((index * 11) % 9),
  }));

// the Gotham skyline in a 400 by 120 box: x, width and height of each tower, the tall ones get gothic spires
export const SKYLINE = [
  { x: 0, width: 34, height: 62 },
  { x: 30, width: 26, height: 88, spire: true },
  { x: 54, width: 40, height: 54 },
  { x: 90, width: 22, height: 74 },
  { x: 110, width: 36, height: 46 },
  { x: 144, width: 28, height: 98, spire: true },
  { x: 228, width: 30, height: 92, spire: true },
  { x: 256, width: 42, height: 58 },
  { x: 296, width: 24, height: 80 },
  { x: 318, width: 38, height: 50 },
  { x: 354, width: 26, height: 104, spire: true },
  { x: 378, width: 22, height: 66 },
];


// a few windows still lit in the 400 by 120 box, somebody in Gotham is always awake
export const LIT_WINDOWS = [38, 62, 150, 158, 236, 262, 302, 360].map((x, index) => ({ x, y: 60 + (index % 3) * 14, width: 3, height: 4 }));

const SKYLINE_WIDTH = 400;
const SKYLINE_HEIGHT = 120;

// whether a point of the 400 by 120 box is part of a tower, spire included. spires narrow in steps up to their tip
const isInTower = ({ x, width, height, spire = false }, pointX, pointY) => {
  const roof = SKYLINE_HEIGHT - height;
  if (pointX < x || pointX >= x + width) return false;
  if (pointY >= roof) return true;
  if (!spire) return false;
  const rise = (roof - pointY) / (height * 0.22);
  return rise <= 1 && Math.abs(pointX - (x + width / 2)) <= width * 0.3 * (1 - rise);
};

const isInWindow = ({ x, y, width, height }, pointX, pointY) => pointX >= x && pointX < x + width && pointY >= y && pointY < y + height;

/**
 * The Gotham skyline as sprite rows, every pixel standing for a scale by scale square of the 400 by 120 box.
 * @param {{ x: number, width: number, height: number, spire?: boolean }[]} towers the towers to draw
 * @param {{ scale?: number, windows?: { x: number, y: number, width: number, height: number }[] }} options
 * @returns {string[]} rows with "B" for a tower, "b" for the roofline catching the light, "w" for a lit window and "." for sky
 */
export const skylineRows = (towers, { scale = 2, windows = [] } = {}) => {
  const isBuilding = (column, row) => row >= 0 && towers.some((tower) => isInTower(tower, (column + 0.5) * scale, (row + 0.5) * scale));
  const pixelAt = (column, row) => {
    if (!isBuilding(column, row)) return ".";
    if (windows.some((window) => isInWindow(window, (column + 0.5) * scale, (row + 0.5) * scale))) return "w";
    return isBuilding(column, row - 1) ? "B" : "b";
  };
  return Array.from({ length: SKYLINE_HEIGHT / scale }, (_, row) =>
    Array.from({ length: SKYLINE_WIDTH / scale }, (_, column) => pixelAt(column, row)).join("")
  );
};

// how far a pixel of a width by height oval sits from its middle: 0 at the center, 1 on the edge, more outside
const ovalReach = (width, height, x, y) => ((x + 0.5 - width / 2) / (width / 2)) ** 2 + ((y + 0.5 - height / 2) / (height / 2)) ** 2;

/**
 * The spotlight oval in flat bands, the way a 16 bit lamp glows: hot white in the middle, yellow, a deep rim and a dark outline.
 * @param {number} width oval width in pixels
 * @param {number} height oval height in pixels
 * @returns {string[]} rows with "y" hot center, "Y" yellow, "o" rim, "K" outline and "." outside
 */
export const ovalRows = (width, height) => {
  const isInside = (x, y) => ovalReach(width, height, x, y) <= 1;
  const isEdge = (x, y) => [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(([nextX, nextY]) => !isInside(nextX, nextY));
  const pixelAt = (x, y) => {
    if (!isInside(x, y)) return ".";
    if (isEdge(x, y)) return "K";
    const reach = ovalReach(width, height, x, y);
    if (reach > 0.75) return "o";
    return reach > 0.25 ? "Y" : "y";
  };
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => pixelAt(x, y)).join(""));
};

/**
 * Paints a smaller sprite right in the middle of a bigger one, like the bat on the signal.
 * @param {string[]} base the sprite underneath
 * @param {string[]} stamp the sprite on top, its "." pixels let the base show through
 * @returns {string[]} the combined rows, the size of the base
 */
export const stampCentered = (base, stamp) => {
  const stampWidth = Math.max(...stamp.map((row) => row.length));
  const left = Math.floor((base[0].length - stampWidth) / 2);
  const top = Math.floor((base.length - stamp.length) / 2);
  return overlaySprite(base, { left, top, rows: stamp });
};

/**
 * The css aspect ratio of a sprite, so it keeps square pixels at whatever height the screen gives it.
 * @param {string[]} rows sprite rows
 * @returns {string} like "34 / 12"
 */
export const spriteAspect = (rows) => `${Math.max(...rows.map((row) => row.length))} / ${rows.length}`;
