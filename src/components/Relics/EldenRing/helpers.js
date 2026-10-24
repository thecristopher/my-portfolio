/**
 * A band of color that holds solid in the middle and fades out smoothly to both sides.
 * @param {string} color the color in the middle
 * @param {{ solid?: number, strength?: number }} options how much of the middle (in %) stays solid, and how opaque
 *   it is, 0 to 1
 * @returns {string} a css linear gradient, left to right
 */
export const edgeFade = (color, { solid = 40, strength = 1 } = {}) => {
  const tint = `color-mix(in oklab, ${color} ${Math.round(strength * 1000) / 10}%, transparent)`;
  const edge = (100 - solid) / 2;
  return `linear-gradient(to right, transparent 0%, ${tint} ${edge}%, ${tint} ${100 - edge}%, transparent 100%)`;
};

/**
 * Specks of gold rising up the whole screen, the way the air above a grace shimmers, spread so they never line up.
 * @param {number} count how many specks
 * @returns {{ left: number, delay: number, size: number }[]} left in %, delay in seconds, size in css pixels
 */
export const graceEmbers = (count) =>
  Array.from({ length: count }, (_, index) => ({ left: 4 + ((index * 37) % 92), delay: (index % 6) * 0.25, size: 4 + (index % 3) * 2 }));
