export const SCOTT_PINK = "#ff5ca8";
export const COMBO_HITS = 3;
export const COMBO_WINDOW_MS = 2500;

/**
 * Adds a poke to the running combo. Pokes older than the window fall off, and landing the last hit empties it.
 * @param {number[]} pokes times of the pokes still in the combo, in ms
 * @param {number} now time of this poke, in ms
 * @param {{ hits?: number, windowMs?: number }} options how many hits make a combo and how fast they have to land
 * @returns {{ pokes: number[], isCombo: boolean }} the combo after this poke, and whether it just landed
 */
export const registerPoke = (pokes, now, { hits = COMBO_HITS, windowMs = COMBO_WINDOW_MS } = {}) => {
  const recent = [...pokes, now].filter((at) => now - at < windowMs);
  const isCombo = recent.length >= hits;
  return { pokes: isCombo ? [] : recent, isCombo };
};

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
  "+": ["...", ".#.", "###", ".#.", "..."],
  0: [".##.", "#..#", "#..#", "#..#", ".##."],
  1: [".#.", "##.", ".#.", ".#.", "###"],
  "!": ["#", "#", "#", ".", "#"],
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
