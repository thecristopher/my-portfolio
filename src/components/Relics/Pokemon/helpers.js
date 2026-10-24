import { spriteToPixels } from "../../../actions";

/**
 * Groups sprite pixels by color into one svg path per color, so a big sprite is a handful of paths instead of
 * thousands of rects.
 * @param {{ x: number, y: number, color: string }[]} pixels as spriteToPixels returns them
 * @returns {{ color: string, d: string }[]} one path per color, in the order the colors first show up
 */
export const pixelsToPaths = (pixels = []) => {
  const byColor = new Map();
  for (const { x, y, color } of pixels) {
    byColor.set(color, `${byColor.get(color) ?? ""}M${x} ${y}h1v1h-1z`);
  }
  return [...byColor].map(([color, d]) => ({ color, d }));
};

/**
 * When a typed line finishes printing, so the next beat can wait for it like a real text box does.
 * @param {string} text the line
 * @param {number} startAt when the first letter lands, in s
 * @param {number} perLetter seconds between letters
 * @returns {number} when the last letter lands, in s
 */
export const typingEnds = (text, startAt, perLetter) => Math.round((startAt + [...text].length * perLetter) * 100) / 100;

/**
 * The rocking a ball does on the ground while the catch is decided: a tip to each side and back, once per wobble.
 * @param {number} wobbles how many times it rocks
 * @param {number} tilt how far it tips, in degrees
 * @returns {{ rotate: number[], times: number[] }} framer keyframes and their times, rests between wobbles
 */
export const wobbleKeyframes = (wobbles, tilt = 22) => {
  const rotate = [0];
  const times = [0];
  for (let index = 0; index < wobbles; index++) {
    const start = index / wobbles;
    const step = 1 / wobbles;
    rotate.push(-tilt, tilt * 0.7, 0, 0);
    times.push(start + step * 0.15, start + step * 0.35, start + step * 0.5, start + step);
  }
  return { rotate, times: times.map((time) => Math.round(time * 1000) / 1000) };
};

/**
 * Turns sprite rows into the paths a PixelPaths draws, worked out once at import instead of every render.
 * @param {string[]} rows one string per row, one character per pixel
 * @param {Record<string, string>} palette color for each character
 * @returns {{ color: string, d: string }[]} one path per color
 */
export const spritePaths = (rows, palette) => pixelsToPaths(spriteToPixels(rows, palette));

/**
 * Turns a sprite a quarter turn clockwise. A right angle is the only turn that keeps every pixel square.
 * @param {string[]} rows one string per row, all the same width
 * @returns {string[]} the turned rows
 */
export const turnRows = (rows) => {
  const width = rows[0]?.length ?? 0;
  return Array.from({ length: width }, (_, x) =>
    rows
      .map((row) => row[x])
      .reverse()
      .join("")
  );
};

/**
 * Leans a sprite to one side by sliding its rows, more at the top and none at the bottom, the 16 bit way to tip
 * something over without turning it.
 * @param {string[]} rows one string per row, all the same width
 * @param {number} lean pixels the top row slides, negative leans left
 * @returns {string[]} rows padded on both sides by the lean, so every frame keeps the same size
 */
export const leanRows = (rows, lean) => {
  const pad = Math.abs(lean);
  const last = Math.max(rows.length - 1, 1);
  return rows.map((row, y) => {
    const shift = Math.round((lean * (last - y)) / last);
    return ".".repeat(pad + shift) + row + ".".repeat(pad - shift);
  });
};

/**
 * A flat oval on a pixel grid with a one pixel outline, its bottom third in the shade color.
 * @param {number} width oval width in pixels
 * @param {number} height oval height in pixels
 * @returns {string[]} rows using K for the outline, G for the top and g for the shade
 */
export const ovalRows = (width, height) => {
  const center = { x: (width - 1) / 2, y: (height - 1) / 2 };
  const isInside = (x, y) => ((x - center.x) / (width / 2)) ** 2 + ((y - center.y) / (height / 2)) ** 2 <= 1;
  const isEdge = (x, y) => !isInside(x - 1, y) || !isInside(x + 1, y) || !isInside(x, y - 1) || !isInside(x, y + 1);
  const pixelAt = (x, y) => {
    if (!isInside(x, y)) return ".";
    if (isEdge(x, y)) return "K";
    return y >= (height * 2) / 3 ? "g" : "G";
  };
  return Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => pixelAt(x, y)).join(""));
};

/**
 * Which frame of a flipbook shows at a moment in time.
 * @param {Array<[number, string]>} schedule [when in s, frame name] pairs in time order
 * @param {number} seconds time since the flipbook started
 * @returns {string} the last frame that has started, the first one before anything has
 */
export const frameAt = (schedule, seconds) => {
  const started = schedule.filter(([at]) => at <= seconds);
  return (started.at(-1) ?? schedule[0])[1];
};

const SPIN_FRAMES = ["up", "right", "down", "left"];

/**
 * The flipbook of a ball spinning through the air, a quarter turn per frame.
 * @param {number} start when the spin starts, in s
 * @param {number} length how long it spins, in s
 * @param {number} turns how many full turns it makes
 * @returns {Array<[number, string]>} frames that end upright
 */
export const spinSchedule = (start, length, turns) => {
  const steps = turns * SPIN_FRAMES.length;
  const round = (value) => Math.round(value * 1000) / 1000;
  return Array.from({ length: steps + 1 }, (_, step) => [round(start + (length * step) / steps), SPIN_FRAMES[step % SPIN_FRAMES.length]]);
};

/**
 * The wobble keyframes as flipbook frames: tipped left, tipped right or sitting upright.
 * @param {number} start when the wobble starts, in s
 * @param {number} length how long it wobbles, in s
 * @param {{ rotate: number[], times: number[] }} keyframes as wobbleKeyframes gives them
 * @returns {Array<[number, string]>} frames in time order
 */
export const wobbleSchedule = (start, length, { rotate, times }) =>
  rotate.map((angle, index) => {
    const frame = angle < 0 ? "leanLeft" : angle > 0 ? "leanRight" : "up";
    return [Math.round((start + times[index] * length) * 1000) / 1000, frame];
  });
