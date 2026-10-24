/**
 * A band of color that fades out to both sides in a few flat steps instead of a smooth gradient, like a 16 bit title bar.
 * @param {string} color the color in the middle
 * @param {{ bands?: number, solid?: number, strength?: number }} options how many steps each side takes, how much of
 *   the middle (in %) stays solid, and how opaque the solid middle is, 0 to 1
 * @returns {string} a css linear gradient, left to right
 */
export const bandedFade = (color, { bands = 4, solid = 40, strength = 1 } = {}) => {
  const stepWidth = (100 - solid) / 2 / bands;
  const tint = (amount) => `color-mix(in oklab, ${color} ${Math.round(amount * strength * 1000) / 10}%, transparent)`;
  const side = Array.from({ length: bands }, (_, index) => ({
    tint: tint((index + 1) / (bands + 1)),
    from: Math.round(index * stepWidth * 10) / 10,
    to: Math.round((index + 1) * stepWidth * 10) / 10,
  }));
  const left = side.map(({ tint: shade, from, to }) => `${shade} ${from}% ${to}%`);
  const right = [...side].reverse().map(({ tint: shade, from, to }) => `${shade} ${100 - to}% ${100 - from}%`);
  const middle = `${tint(1)} ${side.at(-1).to}% ${100 - side.at(-1).to}%`;
  return `linear-gradient(to right, ${[...left, middle, ...right].join(", ")})`;
};

/**
 * Specks of gold rising up the whole screen, the way the air above a grace shimmers, spread so they never line up.
 * @param {number} count how many specks
 * @returns {{ left: number, delay: number, size: number }[]} left in %, delay in seconds, size in css pixels
 */
export const graceEmbers = (count) =>
  Array.from({ length: count }, (_, index) => ({ left: 4 + ((index * 37) % 92), delay: (index % 6) * 0.25, size: 4 + (index % 3) * 2 }));
