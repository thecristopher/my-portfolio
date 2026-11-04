// svg numbers rounded to two decimals, more than that is just noise in the markup
const round = (value) => Math.round(value * 100) / 100;

/**
 * A tiny seeded random, so a bolt pattern can be replayed in a test and still look random on screen.
 * @param {number} seed any whole number
 * @returns {() => number} a function returning 0 to 1
 */
export const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * A jagged lightning bolt between two points: the ends stay put and every joint in between kicks sideways.
 * @param {{ x: number, y: number }} from where the bolt starts
 * @param {{ x: number, y: number }} to where it lands
 * @param {{ segments?: number, jitter?: number, random?: () => number }} options how many kinks and how wild
 * @returns {Array<{ x: number, y: number }>} the bolt's joints, from first to last
 */
export const lightningBolt = (from, to, { segments = 6, jitter = 4, random = Math.random } = {}) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  // kicks go across the bolt, never along it, so it zigzags instead of bunching up
  const across = { x: -dy / length, y: dx / length };

  return Array.from({ length: segments + 1 }, (_, index) => {
    const t = index / segments;
    const isEnd = index === 0 || index === segments;
    const kick = isEnd ? 0 : (random() * 2 - 1) * jitter;
    return { x: round(from.x + dx * t + across.x * kick), y: round(from.y + dy * t + across.y * kick) };
  });
};

/**
 * Bolt joints as the points attribute of an svg polyline.
 * @param {Array<{ x: number, y: number }>} points the joints
 * @returns {string}
 */
export const toPolyline = (points) => points.map(({ x, y }) => `${x},${y}`).join(" ");

/**
 * When the little sparks of a crackle go off: spread across a stretch but never on an even beat, so it sounds electric.
 * @param {number} start seconds
 * @param {number} end seconds
 * @param {number} count how many sparks
 * @returns {number[]} start times in seconds, in order
 */
export const crackleTimes = (start, end, count) =>
  Array.from({ length: count }, (_, index) => {
    // the golden ratio spreads the offsets so no two gaps match
    const wobble = ((index * 0.618) % 1) * 0.7;
    return Math.round((start + ((end - start) * (index + wobble)) / count) * 1000) / 1000;
  });

// the moment's beats in seconds, shared with the jingle so the chord lands exactly when the cross stamps.
// lastsMs is when the tagline has settled and the circle, cross and text just hold
export const BEATS = {
  clap: 0.25,
  drawCircle: 0.4,
  crackleFrom: 0.55,
  crackleTo: 3.3,
  pickup: 1.68,
  stamp: 1.84,
  title: 2.1,
  narration: 2.5,
  payoff: 3.75,
  tagline: 4.35,
  lastsMs: 4900,
};
