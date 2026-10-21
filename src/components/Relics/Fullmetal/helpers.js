// svg numbers rounded to two decimals, more than that is just noise in the markup
const round = (value) => Math.round(value * 100) / 100;

/**
 * A point on a circle, measured clockwise from the top like a clock hand.
 * @param {number} cx center x
 * @param {number} cy center y
 * @param {number} radius distance from the center
 * @param {number} angle radians, 0 is straight up
 * @returns {{ x: number, y: number }}
 */
export const pointOnCircle = (cx, cy, radius, angle) => ({
  x: round(cx + radius * Math.sin(angle)),
  y: round(cy - radius * Math.cos(angle)),
});

/**
 * A full circle as a path, so it can draw itself with pathLength like any other line.
 * @param {number} cx center x
 * @param {number} cy center y
 * @param {number} radius circle radius
 * @returns {string} svg path data
 */
export const circlePath = (cx, cy, radius) =>
  `M${cx} ${cy - radius} A${radius} ${radius} 0 1 1 ${cx} ${cy + radius} A${radius} ${radius} 0 1 1 ${cx} ${cy - radius}`;

/**
 * Joins points into a closed svg path.
 * @param {Array<{ x: number, y: number }>} points corners in drawing order
 * @returns {string} svg path data
 */
export const polygonPath = (points) => `M${points.map(({ x, y }) => `${x} ${y}`).join(" L")} Z`;

/**
 * Evenly spaced corners of a regular polygon, the first one straight up unless turned.
 * @param {number} cx center x
 * @param {number} cy center y
 * @param {number} radius distance from the center to each corner
 * @param {number} sides how many corners
 * @param {number} turn radians to rotate the whole shape
 * @returns {Array<{ x: number, y: number }>}
 */
export const regularPolygon = (cx, cy, radius, sides, turn = 0) =>
  Array.from({ length: sides }, (_, index) => pointOnCircle(cx, cy, radius, turn + (index / sides) * Math.PI * 2));

/**
 * The hexagram at the heart of a transmutation circle: one triangle up, one down.
 * @param {number} cx center x
 * @param {number} cy center y
 * @param {number} radius distance from the center to each point
 * @returns {string[]} two svg paths
 */
export const hexagramPaths = (cx, cy, radius) => [
  polygonPath(regularPolygon(cx, cy, radius, 3)),
  polygonPath(regularPolygon(cx, cy, radius, 3, Math.PI)),
];

/**
 * Where the little alchemy glyphs sit in the band between the two rings, each turned to face the center.
 * @param {number} cx center x
 * @param {number} cy center y
 * @param {number} radius the middle of the band
 * @param {number} count how many glyphs
 * @returns {Array<{ x: number, y: number, rotate: number, kind: "tick" | "dot" | "bar" }>}
 */
export const glyphMarks = (cx, cy, radius, count) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2 + Math.PI / count;
    const kinds = ["tick", "dot", "bar"];
    return { ...pointOnCircle(cx, cy, radius, angle), rotate: round((angle * 180) / Math.PI), kind: kinds[index % kinds.length] };
  });

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

// a point on the circle as it looks lying on the floor: squashed into an ellipse by the perspective
const pointOnFloor = ({ cx, cy, rx, ry }, angle) => ({ x: round(cx + rx * Math.cos(angle)), y: round(cy + ry * Math.sin(angle)) });

/**
 * One frame of crackle around a circle on the floor. Half the bolts skip along the rim, half jump up off it.
 * @param {{ count?: number, floor: { cx: number, cy: number, rx: number, ry: number }, random?: () => number }} options
 * @returns {string[]} polyline points, one per bolt
 */
export const crackleBolts = ({ count = 8, floor, random = Math.random }) =>
  Array.from({ length: count }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const from = pointOnFloor(floor, angle);
    const isRimArc = index % 2 === 0;
    const to = isRimArc
      ? pointOnFloor(floor, angle + 0.35 + random() * 0.6)
      : { x: round(from.x + (random() * 2 - 1) * 6), y: round(from.y - floor.ry * (0.6 + random() * 0.9)) };
    return toPolyline(lightningBolt(from, to, { segments: isRimArc ? 5 : 7, jitter: isRimArc ? 2.2 : 3.2, random }));
  });

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

// the moment's beats in seconds, shared with the jingle so the chord lands exactly when the cross stamps
export const BEATS = {
  clap: 0.25,
  drawCircle: 0.4,
  crackleFrom: 0.55,
  crackleTo: 3.3,
  pickup: 1.68,
  stamp: 1.84,
  title: 2.1,
  narration: 2.5,
  tagline: 3.85,
  lastsMs: 5300,
};

// the circle seen lying on the floor, in the 100 by 60 box the crackle is drawn in
export const FLOOR = { cx: 50, cy: 36, rx: 46, ry: 19 };
