// a tiny seeded random, so the stars land in the same places on every visit and every render
const seeded = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

/**
 * Where the stars come out over the sea, and when: each one a spot in the sky and the point of the sunset it appears at.
 * @param {number} count how many stars
 * @param {{ seed?: number, from?: number, to?: number }} options from and to bound when they come out, from 0 to 1
 * @returns {{ x: number, y: number, size: number, at: number }[]} x and y in % of the sky, size in px
 */
export const starField = (count, { seed = 7, from = 0.4, to = 0.85 } = {}) => {
  const random = seeded(seed);
  return Array.from({ length: count }, () => ({
    x: Math.round(random() * 1000) / 10,
    y: Math.round(random() * 850) / 10,
    size: 4 + Math.round(random() * 6),
    at: from + random() * (to - from),
  }));
};

/**
 * When each lamp on the pier turns on: the one nearest the shore first, then down the pier one after the other.
 * @param {number} count how many lamps
 * @param {[number, number]} span the part of the sunset the lamps light up over, from 0 to 1
 * @returns {[number, number][]} the slice each lamp fades in over
 */
export const lampWindows = (count, [start, end]) => {
  const step = (end - start) / count;
  return Array.from({ length: count }, (_, index) => [start + index * step, start + (index + 1) * step]);
};

export * from "./sea";
export * from "./jill";
export * from "./enemies";
export * from "./finale";
export * from "./survival";
