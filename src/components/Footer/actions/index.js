// the end credits, in the order they roll. each block is a role and who filled it
export const CREDIT_BLOCKS = [
  { role: "Designed and built by", names: ["Cristopher Cervantes"] },
  { role: "Written in", names: ["Neovim"] },
  { role: "Built with", names: ["React", "Vite", "Tailwind CSS", "Framer Motion", "Lenis", "Redux Toolkit", "React PDF"] },
  { role: "Set in", names: ["Geist", "Geist Mono", "Pixelify Sans"] },
  { role: "Filmed on location in", names: ["Rosarito, Baja California"] },
  { role: "Guest stars", names: ["Link", "Samus Aran", "Jill Valentine", "A pixel Cristopher, drawn by hand"] },
];

/**
 * How the credits travel: the first lines already rising through the lower part of the frame, so the visitor never
 * stares at an empty sky waiting for them, and up until their last lines rest inside the frame, so the sprite credits
 * and the sign off stay on screen once the roll is over.
 * @param {number} frameHeight the window the credits roll through, in px
 * @param {number} listHeight every credit stacked, in px
 * @param {{ speed?: number, rest?: number, start?: number }} options px per second, the gap kept under the last line,
 *   and how far down the frame the first line starts, from 0 at the top to 1 under the bottom edge
 * @returns {{ from: number, to: number, seconds: number }}
 */
export const rollPath = (frameHeight, listHeight, { speed = 95, rest = 32, start = 0.55 } = {}) => {
  const from = Math.round(frameHeight * start);
  const to = Math.min(0, frameHeight - listHeight - rest);
  return { from, to, seconds: Math.max(1, (from - to) / speed) };
};

/**
 * A night sky's worth of stars, scattered the same way on every visit so the sky never jumps between renders.
 * @param {number} count how many
 * @param {number} seed any whole number
 * @returns {{ x: number, y: number, size: number, delay: number }[]} x and y in percent, size in px, delay in s
 */
export const scatterStars = (count, seed = 7) => {
  let state = seed;
  // a tiny linear congruential generator, plenty random for a sky
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: Math.round(next() * 1000) / 10,
    y: Math.round(next() * 700) / 10,
    size: next() < 0.15 ? 2 : 1,
    delay: Math.round(next() * 40) / 10,
  }));
};
