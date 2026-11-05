import { SKILL_CATEGORY_ORDER } from "../../../lib/resume/buildResume";
import { pointOnCircle } from "../../../lib/geometry";

export const MAX_LEVEL = 5;

/**
 * The tools grouped by category in the résumé's order, any tool without one at the end under "Other".
 * @param {{ name: string, category?: string }[]} tools the tools in the API's relevance order
 * @returns {{ category: string, tools: object[] }[]} only the categories that have tools
 */
export const groupByCategory = (tools = []) =>
  [...SKILL_CATEGORY_ORDER, "Other"]
    .map((category) => ({ category, tools: tools.filter((tool) => (tool.category ?? "Other") === category) }))
    .filter((group) => group.tools.length > 0);

/**
 * Which of the five dots a level lights.
 * @param {number} level from 0 to MAX_LEVEL
 * @returns {boolean[]} one entry per dot, true when lit
 */
export const levelDots = (level = 0) => Array.from({ length: MAX_LEVEL }, (_, index) => index < level);

/**
 * Lays the tools out in rings around a center, the deepest ones closest in: level 5 on the inner ring, level 4 on the
 * middle one and everything else on the outer one. Each ring spreads its tools evenly, starting at its own angle so
 * no two rings line up.
 * @param {{ name: string, level: number }[]} tools the tools
 * @returns {{ ring: number, tools: { name: string, level: number, angle: number }[] }[]} rings from inner to outer, empty ones left out
 */
export const orbitLayout = (tools = []) => {
  const ringOf = (level) => (level >= 5 ? 0 : level === 4 ? 1 : 2);
  return [0, 1, 2]
    .map((ring) => {
      const members = tools.filter((tool) => ringOf(tool.level) === ring);
      const start = ring * 23;
      return { ring, tools: members.map((tool, index) => ({ ...tool, angle: start + (index * 360) / members.length })) };
    })
    .filter((ring) => ring.tools.length > 0);
};

// the meter's arcs leave a gap at the bottom, like a gauge, so it reads as a dial and not a target
const GAUGE = { start: 225, sweep: 270 };
const METER = { center: 15, innerRadius: 3, gap: 2.75 };

/**
 * One arc of a circle as an SVG path, angles measured clockwise from the top.
 * @param {number} radius distance from the center
 * @param {{ x: number, y: number }} center where the circle sits
 * @param {number} start where the arc begins, in degrees
 * @param {number} sweep how far it runs clockwise, in degrees, under 360
 * @returns {string} the path's d attribute
 */
export const arcPath = (radius, center, start, sweep) => {
  const from = pointOnCircle(start, radius, center);
  const to = pointOnCircle(start + sweep, radius, center);
  const isLong = sweep > 180 ? 1 : 0;
  return `M${from.x} ${from.y}A${radius} ${radius} 0 ${isLong} 1 ${to.x} ${to.y}`;
};

/**
 * The level as concentric arcs, innermost first, lit from the center out, the way the orbit keeps the deepest tools
 * closest in.
 * @param {number} level from 0 to MAX_LEVEL
 * @returns {{ d: string, isLit: boolean }[]} one arc per possible level
 */
export const levelArcs = (level = 0) =>
  levelDots(level).map((isLit, index) => ({
    d: arcPath(METER.innerRadius + index * METER.gap, { x: METER.center, y: METER.center }, GAUGE.start, GAUGE.sweep),
    isLit,
  }));

/** The square the meter's arcs are drawn in. */
export const METER_SIZE = METER.center * 2;

/**
 * Where the core's circle ends inside a ring's own box, so a beam from a satellite stops at the core's edge.
 * @param {string} ringSize the ring's width as a share of the orbit, like "52%"
 * @param {number} coreShare the core's width as a share of the orbit, from 0 to 1
 * @returns {number} the core's radius in the ring's 0 to 100 box
 */
export const coreRadiusIn = (ringSize, coreShare) => (coreShare * 50 * 100) / parseFloat(ringSize);

/**
 * The line the core shows for a hovered tool: how many jobs shipped with it.
 * @param {number} matches jobs that used it
 * @param {number} total every job
 * @returns {string} like "Shipped at 3 of 5 jobs", or nothing when there are no jobs to count
 */
export const jobsLine = (matches, total) => {
  if (total === 0) return "";
  if (matches === 0) return "Not shipped at a job yet";
  return `Shipped at ${matches} of ${total} ${total === 1 ? "job" : "jobs"}`;
};

/**
 * A comet's pass over the orbit: in through one side, out the opposite one, never through the middle in a straight
 * vertical or horizontal line, so it always reads as a streak across the sky.
 * @param {number} roll a random number from 0 to 1
 * @returns {{ from: { x: number, y: number }, to: { x: number, y: number }, angle: number }} percent positions over the
 *   orbit and the heading in degrees, 0 pointing right
 */
export const cometPass = (roll = Math.random()) => {
  const goesRight = roll < 0.5;
  const startY = 5 + ((roll * 2) % 1) * 35;
  const from = { x: goesRight ? -10 : 110, y: startY };
  const to = { x: goesRight ? 110 : -10, y: startY + 45 };
  const angle = Math.round((Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI);
  return { from, to, angle };
};

/**
 * How long until the next comet, long enough that one always feels like luck.
 * @param {number} roll a random number from 0 to 1
 * @param {number} minMs the shortest wait
 * @param {number} maxMs the longest wait
 * @returns {number} milliseconds
 */
export const cometWait = (roll = Math.random(), minMs = 9000, maxMs = 20000) => Math.round(minMs + roll * (maxMs - minMs));

/**
 * How far the orbit leans toward the cursor: the side the cursor is on tips toward you.
 * @param {number} clientX cursor x on the screen
 * @param {number} clientY cursor y on the screen
 * @param {{ left: number, top: number, width: number, height: number }} rect the orbit's box on the screen
 * @param {number} maxDegrees the steepest lean, reached at the box's edge
 * @returns {{ rotateX: number, rotateY: number }} degrees
 */
export const pointerTilt = (clientX, clientY, rect, maxDegrees) => {
  const clamp = (value) => Math.max(-1, Math.min(1, value));
  const x = clamp(((clientX - rect.left) / rect.width) * 2 - 1);
  const y = clamp(((clientY - rect.top) / rect.height) * 2 - 1);
  return { rotateX: -y * maxDegrees, rotateY: x * maxDegrees };
};

// a tiny seeded random, so the sky is the same on every visit and in every test
const seededRandom = (seed) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * A sky of stars for one depth layer behind the orbit, the same every time for the same seed.
 * @param {number} count how many stars
 * @param {number} seed any whole number, one per layer
 * @returns {{ x: number, y: number, size: number, opacity: number, twinkles: boolean, delay: number }[]} x and y in percent
 */
export const starField = (count, seed) => {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: Math.round(random() * 1000) / 10,
    y: Math.round(random() * 1000) / 10,
    size: random() < 0.85 ? 1 : 2,
    opacity: Math.round((0.25 + random() * 0.65) * 100) / 100,
    twinkles: random() < 0.35,
    delay: Math.round(random() * 4000),
  }));
};

const TRAIL = { degreesPerSpeed: 0.35, maxDegrees: 16, minDegrees: 1 };

/**
 * How long a satellite's light trail is for how fast its ring is turning, signed with the turn.
 * @param {number} velocity the ring's turn speed in degrees per second
 * @returns {number} the trail's length in degrees, negative when the ring turns counterclockwise
 */
export const trailSweep = (velocity) => {
  const length = Math.min(TRAIL.maxDegrees, Math.abs(velocity) * TRAIL.degreesPerSpeed);
  return Math.sign(velocity) * length;
};

/**
 * The arc a satellite's trail draws on its ring, always behind it: counterclockwise of it when the ring turns clockwise.
 * @param {number} angle where the satellite sits on its ring, in degrees
 * @param {number} sweep the signed trail length from trailSweep
 * @returns {{ d: string, head: { x: number, y: number }, tail: { x: number, y: number } } | null} in the ring's 0 to 100
 *   box, or null when the ring is too still to leave a trail
 */
export const trailGeometry = (angle, sweep) => {
  const length = Math.abs(sweep);
  if (length < TRAIL.minDegrees) return null;
  const center = { x: 50, y: 50 };
  const tailAngle = sweep > 0 ? angle - length : angle + length;
  const start = sweep > 0 ? tailAngle : angle;
  return { d: arcPath(50, center, start, length), head: pointOnCircle(angle, 50, center), tail: pointOnCircle(tailAngle, 50, center) };
};

/**
 * The jobs that shipped with a tool, by company, for the planet card.
 * @param {{ title: string, technologies?: string[] }[]} projects every job
 * @param {(project: object, tool: string) => boolean} usesTool whether a job shipped with the tool
 * @param {string} tool the tool's name
 * @returns {string[]} company names, each once, in the jobs' order
 */
export const jobsWith = (projects, usesTool, tool) => [...new Set(projects.filter((project) => usesTool(project, tool)).map((project) => project.title))];

/**
 * Where the camera has to fly to put a satellite in the middle of the screen at a given zoom.
 * @param {{ x: number, y: number }} offset the satellite's distance from the orbit's center, in px
 * @param {number} zoom how far the camera zooms in
 * @returns {{ x: number, y: number, scale: number }} the camera's move
 */
export const diveCamera = (offset, zoom) => ({ x: -offset.x * zoom, y: -offset.y * zoom, scale: zoom });

/**
 * The level in words for the planet card.
 * @param {number} level from 0 to MAX_LEVEL
 * @param {boolean} isMain whether the tool is part of the main stack
 * @returns {string} like "Level 4 of 5, main stack"
 */
export const levelLine = (level, isMain) => `Level ${level} of ${MAX_LEVEL}${isMain ? ", main stack" : ""}`;
