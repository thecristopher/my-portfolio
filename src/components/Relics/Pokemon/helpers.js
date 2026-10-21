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
