import { pixelsToPaths } from "../../../actions";

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
export const crackleBolts = ({ count = 8, floor, random = Math.random }) => crackleJoints({ count, floor, random }).map(toPolyline);

/**
 * The same crackle as crackleBolts, as joints instead of polyline text, so it can be drawn on a pixel grid.
 * @param {{ count?: number, floor: { cx: number, cy: number, rx: number, ry: number }, random?: () => number }} options
 * @returns {Array<Array<{ x: number, y: number }>>} one list of joints per bolt
 */
export const crackleJoints = ({ count = 8, floor, random = Math.random }) =>
  Array.from({ length: count }, (_, index) => {
    const angle = random() * Math.PI * 2;
    const from = pointOnFloor(floor, angle);
    const isRimArc = index % 2 === 0;
    const to = isRimArc
      ? pointOnFloor(floor, angle + 0.35 + random() * 0.6)
      : { x: round(from.x + (random() * 2 - 1) * 6), y: round(from.y - floor.ry * (0.6 + random() * 0.9)) };
    return lightningBolt(from, to, { segments: isRimArc ? 5 : 7, jitter: isRimArc ? 2.2 : 3.2, random });
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

// the circle seen lying on the floor, in the 100 by 60 box the crackle is drawn in
export const FLOOR = { cx: 50, cy: 36, rx: 46, ry: 19 };

/**
 * The pixels a straight line covers on a square grid, end to end, one per step like Bresenham draws them.
 * @param {{ x: number, y: number }} from where it starts, rounded to the nearest pixel
 * @param {{ x: number, y: number }} to where it ends, rounded to the nearest pixel
 * @returns {Array<{ x: number, y: number }>} the pixels in drawing order
 */
export const linePixels = (from, to) => {
  const start = { x: Math.round(from.x), y: Math.round(from.y) };
  const end = { x: Math.round(to.x), y: Math.round(to.y) };
  const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  return Array.from({ length: steps + 1 }, (_, step) => {
    const t = steps === 0 ? 0 : step / steps;
    return { x: Math.round(start.x + (end.x - start.x) * t), y: Math.round(start.y + (end.y - start.y) * t) };
  });
};

/**
 * The pixels of a line through every joint in turn, each pixel once, in the order a pen would draw them.
 * @param {Array<{ x: number, y: number }>} joints the corners of the line
 * @returns {Array<{ x: number, y: number }>}
 */
export const pathPixels = (joints) => {
  const seen = new Set();
  return joints.slice(1).flatMap((joint, index) =>
    linePixels(joints[index], joint).filter(({ x, y }) => {
      const key = `${x},${y}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
  );
};

/**
 * A pixel line with its four neighbors filled in, the hard edged halo a 16 bit glow gets instead of a blur.
 * @param {Array<{ x: number, y: number }>} pixels the line
 * @returns {Array<{ x: number, y: number }>} the halo, each pixel once, the line itself included
 */
export const haloPixels = (pixels) => {
  const halo = new Map();
  const NEIGHBORS = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const { x, y } of pixels) {
    for (const [dx, dy] of NEIGHBORS) halo.set(`${x + dx},${y + dy}`, { x: x + dx, y: y + dy });
  }
  return [...halo.values()];
};

/**
 * Cuts a list into a few runs of nearly the same size, so a line can trace itself in a handful of frames.
 * @param {Array} items what to cut, in order
 * @param {number} parts how many runs
 * @returns {Array<Array>} the runs, never empty ones
 */
export const splitRuns = (items, parts) => {
  const size = Math.ceil(items.length / parts);
  return Array.from({ length: parts }, (_, index) => items.slice(index * size, (index + 1) * size)).filter((run) => run.length > 0);
};

// the circle is designed on a 100 unit square with its outer ring 47 out from the middle
const DESIGN = { cx: 50, cy: 50, radius: 47 };

/**
 * Lays a point of the circle's 100 unit design down on the floor, squashed into the ellipse the perspective gives it.
 * @param {{ x: number, y: number }} point on the design
 * @param {{ cx: number, cy: number, rx: number, ry: number }} floor where the outer ring lands
 * @returns {{ x: number, y: number }}
 */
export const toFloor = ({ x, y }, floor) => ({
  x: round(floor.cx + ((x - DESIGN.cx) / DESIGN.radius) * floor.rx),
  y: round(floor.cy + ((y - DESIGN.cy) / DESIGN.radius) * floor.ry),
});

// rings get enough corners that the pixels can't tell them from a circle
const RING_CORNERS = 48;
const closed = (points) => [...points, points[0]];

/**
 * Every line of the transmutation circle as floor pixels, in the order they draw: outer ring, inner ring, the two
 * triangles of the hexagram and the core ring.
 * @param {{ cx: number, cy: number, rx: number, ry: number }} floor where the outer ring lands
 * @returns {Array<Array<{ x: number, y: number }>>} one pixel list per line, in drawing order
 */
export const floorCircleLines = (floor) => {
  const { cx, cy } = DESIGN;
  const shapes = [
    regularPolygon(cx, cy, 47, RING_CORNERS),
    regularPolygon(cx, cy, 39, RING_CORNERS),
    regularPolygon(cx, cy, 39, 3),
    regularPolygon(cx, cy, 39, 3, Math.PI),
    regularPolygon(cx, cy, 13, RING_CORNERS),
  ];
  return shapes.map((shape) => pathPixels(closed(shape).map((point) => toFloor(point, floor))));
};

/**
 * The glyphs in the band between the rings as single floor pixels, one per glyph.
 * @param {{ cx: number, cy: number, rx: number, ry: number }} floor where the outer ring lands
 * @param {number} count how many glyphs
 * @returns {Array<{ x: number, y: number }>}
 */
export const floorGlyphPixels = (floor, count = 12) =>
  glyphMarks(DESIGN.cx, DESIGN.cy, 43, count).map((mark) => {
    const { x, y } = toFloor(mark, floor);
    return { x: Math.round(x), y: Math.round(y) };
  });

/**
 * A set of same colored pixels as one svg path, so a whole line or bolt is a single element.
 * @param {Array<{ x: number, y: number }>} pixels where the pixels are
 * @returns {string} svg path data, empty when there are no pixels
 */
export const pixelPath = (pixels) => pixelsToPaths(pixels.map(({ x, y }) => ({ x, y, color: "ink" })))[0]?.d ?? "";
