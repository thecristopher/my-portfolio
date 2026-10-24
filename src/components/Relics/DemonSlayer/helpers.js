export const WATER_BLUE = "#3fa9f5";
export const SUN_RED = "#d8342c";
// Tanjiro's haori: a deep forest green against near black
export const HAORI_GREEN = "#1f7a4d";
export const HAORI_BLACK = "#121212";
// the Prussian blue every Hokusai print is soaked in
export const PRUSSIAN_BLUE = "#1d3f73";
export const SUMI_INK = "#141414";

// svg numbers rounded to one decimal, plenty for a wave and much easier to read in the devtools
const round = (value) => Math.round(value * 10) / 10;

/**
 * The ichimatsu checker from Tanjiro's haori as a css background.
 * @param {{ green?: string, black?: string, size?: string }} options colors and the size of one 2x2 tile
 * @returns {string} a css background shorthand
 */
export const ichimatsu = ({ green = HAORI_GREEN, black = HAORI_BLACK, size = "2.5rem" } = {}) =>
  `repeating-conic-gradient(${green} 0 25%, ${black} 0 50%) 0 0 / ${size} ${size}`;

/**
 * Lays out the crests along a wave, every other one a little lower so the water never looks stamped.
 * @param {{ start?: number, count: number, crestWidth: number, height: number }} options where the wave starts and how its crests are sized
 * @returns {Array<{ x: number, width: number, height: number }>} one entry per crest, left to right
 */
export const waveCrests = ({ start = 0, count, crestWidth, height }) =>
  Array.from({ length: count }, (_, index) => ({
    x: start + index * crestWidth,
    width: crestWidth,
    height: index % 2 === 0 ? height : round(height * 0.72),
  }));

// one crest's top edge: it climbs, rolls over forward, hooks back under its own lip and drops into the trough
const crestEdge = ({ x, width: w, height: h }, baseline) => {
  const at = (dx, dy) => `${round(x + dx * w)} ${round(baseline - dy * h)}`;
  return [
    `C${at(0.25, 0.2)} ${at(0.45, 1)} ${at(0.7, 1)}`,
    `C${at(0.9, 1)} ${at(1, 0.8)} ${at(0.95, 0.55)}`,
    `C${at(0.88, 0.62)} ${at(0.8, 0.55)} ${at(0.82, 0.4)}`,
    `C${at(0.85, 0.2)} ${at(0.95, 0.05)} ${at(1, 0)}`,
  ].join(" ");
};

// the underside rolls gently back from right to left, one soft swell per crest
const bottomEdge = (crests, bottom) =>
  [...crests]
    .reverse()
    .map(({ x, width }) => `Q${round(x + width / 2)} ${round(bottom + 3)} ${round(x)} ${round(bottom)}`)
    .join(" ");

/**
 * The filled outline of a wave: curling crests on top, a soft swell underneath.
 * @param {Array<{ x: number, width: number, height: number }>} crests from waveCrests
 * @param {{ baseline: number, thickness: number }} options where the crests sit and how deep the water runs below them
 * @returns {string} a closed svg path
 */
export const waveBodyPath = (crests, { baseline, thickness }) => {
  const first = crests[0];
  const last = crests[crests.length - 1];
  const end = last.x + last.width;
  const bottom = baseline + thickness;
  const top = crests.map((crest) => crestEdge(crest, baseline)).join(" ");
  return `M${round(first.x)} ${round(baseline)} ${top} L${round(end)} ${round(bottom)} ${bottomEdge(crests, bottom)} Z`;
};

/**
 * Where a crest's curl ends, the spot the foam claws hang from.
 * @param {{ x: number, width: number, height: number }} crest from waveCrests
 * @param {number} baseline where the crests sit
 * @returns {[number, number]} the tip as x, y
 */
export const crestTip = ({ x, width, height }, baseline) => [round(x + 0.95 * width), round(baseline - 0.55 * height)];

/**
 * The white foam fingers that claw off the lip of a crest, the signature of a Hokusai wave.
 * @param {{ x: number, width: number, height: number }} crest from waveCrests
 * @param {number} baseline where the crests sit
 * @param {number} fingers how many claws hang off the lip
 * @returns {string[]} one open svg path per claw, meant to be stroked
 */
export const foamClaws = (crest, baseline, fingers = 4) => {
  const [tipX, tipY] = crestTip(crest, baseline);
  const lipX = crest.x + 0.62 * crest.width;
  const lipY = baseline - crest.height;
  const reach = crest.width * 0.16;
  return Array.from({ length: fingers }, (_, index) => {
    const along = fingers === 1 ? 1 : index / (fingers - 1);
    const startX = round(lipX + (tipX - lipX) * along);
    const startY = round(lipY + (tipY - lipY) * along);
    // the claws further along the lip hang lower, the way foam falls off the front of the curl
    const drop = reach * (0.6 + along * 0.6);
    return `M${startX} ${startY} Q${round(startX + reach * 0.9)} ${round(startY + drop * 0.1)} ${round(startX + reach * 0.55)} ${round(startY + drop)}`;
  });
};

/**
 * When each glyph of the calligraphy gets painted: one after another, with a breath between columns.
 * @param {string[]} columns the text of each column, in the order they're written
 * @param {{ startAt?: number, perGlyph?: number, columnPause?: number }} options timing in seconds
 * @returns {number[][]} a delay per glyph, grouped by column. spaces take a beat but are never painted
 */
export const brushDelays = (columns, { startAt = 0, perGlyph = 0.085, columnPause = 0.12 } = {}) => {
  let clock = startAt;
  return columns.map((column, columnIndex) => {
    if (columnIndex > 0) clock += columnPause;
    return [...column].map(() => {
      // adding floats drifts, so the delays are rounded to the millisecond
      const delay = Math.round(clock * 1000) / 1000;
      clock += perGlyph;
      return delay;
    });
  });
};

/**
 * A Google Fonts stylesheet url that ships only the glyphs a piece of text needs, so a font with thousands of kanji stays tiny.
 * @param {string} family the font family, as Google Fonts names it
 * @param {string} text every character that will be drawn in it
 * @returns {string} the stylesheet url
 */
export const googleFontHref = (family, text) =>
  `https://fonts.googleapis.com/css2?family=${family.replaceAll(" ", "+")}&text=${encodeURIComponent([...new Set(text.replaceAll(" ", ""))].join(""))}&display=swap`;
