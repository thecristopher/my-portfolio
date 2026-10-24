export const SCOTT_PINK = "#ff5ca8";

/**
 * The points of a comic book impact burst, spikes alternating long and short around the middle.
 * @param {number} spikes how many points the burst has
 * @param {number} outer radius of the long spikes
 * @param {number} inner radius of the dips between them
 * @param {number} center where the middle sits, on both axes
 * @returns {string} an svg polygon points list
 */
export const burstPoints = (spikes, outer, inner, center = 50) =>
  Array.from({ length: spikes * 2 }, (_, index) => {
    const angle = (index / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    // every other spike comes up a bit short, so it looks hand inked instead of a perfect star
    const reach = index % 2 === 1 ? inner : index % 4 === 0 ? outer : outer * 0.82;
    const x = Math.round((center + Math.cos(angle) * reach) * 10) / 10;
    const y = Math.round((center + Math.sin(angle) * reach) * 10) / 10;
    return `${x},${y}`;
  }).join(" ");

/**
 * Where each coin flies when the beaten enemy pays out: fanned left to right, the middle ones thrown highest.
 * @param {number} count how many coins
 * @returns {{ x: number, peak: number, delay: number }[]} sideways reach and peak height in vmin, plus a stagger in s
 */
export const coinSpray = (count) =>
  Array.from({ length: count }, (_, index) => {
    const spread = count === 1 ? 0 : index / (count - 1) - 0.5;
    return {
      x: Math.round(spread * 80),
      peak: Math.round(34 - Math.abs(spread) * 30),
      delay: Math.round(index * 0.05 * 100) / 100,
    };
  });

// a tiny 5 row bitmap font, the kind old arcade score counters used. # is a lit pixel
export const PIXEL_FONT = {
  L: ["#...", "#...", "#...", "#...", "####"],
  E: ["####", "#...", "###.", "#...", "####"],
  V: ["#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
  U: ["#..#", "#..#", "#..#", "#..#", ".##."],
  P: ["###.", "#..#", "###.", "#...", "#..."],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  F: ["####", "#...", "###.", "#...", "#..."],
  Y: ["#...#", ".#.#.", "..#..", "..#..", "..#.."],
  A: [".##.", "#..#", "####", "#..#", "#..#"],
  R: ["###.", "#..#", "###.", "#.#.", "#..#"],
  S: [".###", "#...", ".##.", "...#", "###."],
  X: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  "+": ["...", ".#.", "###", ".#.", "..."],
  0: [".##.", "#..#", "#..#", "#..#", ".##."],
  1: [".#.", "##.", ".#.", ".#.", "###"],
  9: [".##.", "#..#", ".###", "...#", ".##."],
  "!": ["#", "#", "#", ".", "#"],
  ".": [".", ".", ".", ".", "#"],
  O: [".##.", "#..#", "#..#", "#..#", ".##."],
  W: ["#...#", "#...#", "#.#.#", "##.##", "#...#"],
  B: ["###.", "#..#", "###.", "#..#", "###."],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"],
  K: ["#..#", "#.#.", "##..", "#.#.", "#..#"],
  " ": ["..", "..", "..", "..", ".."],
};

export const PIXEL_HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."];

/**
 * Turns pixel rows into one svg path, a square for every lit pixel.
 * @param {string[]} rows one string per row, # for a lit pixel
 * @param {number} left how far right to start drawing
 * @returns {string} svg path data
 */
export const rowsToPath = (rows, left = 0) =>
  rows
    .flatMap((row, y) => [...row].map((char, x) => (char === "#" ? `M${left + x} ${y}h1v1h-1z` : "")))
    .join("");

/**
 * Spells text in the pixel font as one svg path. Letters the font doesn't have are left as a gap.
 * @param {string} text what to spell, uppercase
 * @returns {{ d: string, width: number, height: number }} the path and the size of its viewBox
 */
export const textToPixelPath = (text) => {
  let left = 0;
  const parts = [...text].map((char) => {
    const glyph = PIXEL_FONT[char] ?? PIXEL_FONT[" "];
    const part = rowsToPath(glyph, left);
    left += glyph[0].length + 1;
    return part;
  });
  return { d: parts.join(""), width: Math.max(left - 1, 0), height: 5 };
};

// how far out the burst reaches at an angle: long spikes, every other one a bit short, dips in between
const burstReach = (angle, spikes, outer, inner) => {
  const slot = ((angle + Math.PI / 2) / (Math.PI * 2)) * spikes * 2;
  const wrapped = ((slot % (spikes * 2)) + spikes * 2) % (spikes * 2);
  const index = Math.floor(wrapped);
  const between = wrapped - index;
  const reachOf = (point) => {
    const at = point % (spikes * 2);
    if (at % 2 === 1) return inner;
    return at % 4 === 0 ? outer : outer * 0.82;
  };
  return reachOf(index) + (reachOf(index + 1) - reachOf(index)) * between;
};

/**
 * A comic impact burst on a pixel grid, the same star burstPoints draws, filled in with a one pixel ink outline and
 * its lower right half in the shade color.
 * @param {number} size width and height of the grid
 * @param {number} spikes how many points the burst has
 * @returns {string[]} rows using K for the outline, S for the star, s for its shade and . for empty
 */
export const burstRows = (size, spikes) => {
  const center = (size - 1) / 2;
  const isInside = (x, y) => {
    const dx = x - center;
    const dy = y - center;
    // the outer reach goes half a pixel past the edge so every spike tip keeps a pixel
    return Math.hypot(dx, dy) <= burstReach(Math.atan2(dy, dx), spikes, size / 2 + 0.5, size * 0.27);
  };
  const isEdge = (x, y) => !isInside(x - 1, y) || !isInside(x + 1, y) || !isInside(x, y - 1) || !isInside(x, y + 1);
  const pixelAt = (x, y) => {
    if (!isInside(x, y)) return ".";
    if (isEdge(x, y)) return "K";
    return x + y > size * 1.15 ? "s" : "S";
  };
  return Array.from({ length: size }, (_, y) => Array.from({ length: size }, (_, x) => pixelAt(x, y)).join(""));
};
