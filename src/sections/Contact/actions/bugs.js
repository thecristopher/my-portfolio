/** How big a bug is drawn, three screen px per bug pixel. */
export const BUG_SIZE = { width: 36, height: 24 };

// the most bugs bothering her at once, so the corner never turns into a swarm
export const MAX_BUGS = 3;

// how far in front of her a bug stops, close enough for the punch to land, in px
const REACH = 58;

/**
 * How long until the next bug crawls in, so they show up now and then instead of on a beat.
 * @param {number} roll a random number from 0 to 1
 * @param {{ min?: number, max?: number }} options the shortest and longest wait in ms
 * @returns {number} milliseconds
 */
export const nextBugWait = (roll, { min = 7000, max = 14000 } = {}) => Math.round(min + roll * (max - min));

/**
 * Where a bug stops crawling: right in front of Jill, who stands at the far right of the stage facing left.
 * @param {number} cornerWidth the width of the stage the bugs crawl across, in px
 * @param {number} jillWidth the width of her sprite as drawn, in px
 * @param {number} bugWidth the width of a bug, in px
 * @param {number} scale how big Jill is drawn, since her reach grows with her
 * @returns {number} the bug's left edge in px, never past the start of the stage
 */
export const bugStop = (cornerWidth, jillWidth, bugWidth, scale = 1) => Math.max(0, cornerWidth - jillWidth / 2 - REACH * scale - bugWidth);

const isAlive = (bug) => bug.status !== "squashed";

/**
 * Which bug the combo lands on: the one clicked if it's still around, otherwise the first one to arrive.
 * @param {{ id: number, status: string }[]} bugs every bug on screen
 * @param {number | null} clickedId the bug that was clicked, null when Jill was
 * @returns {number | null} the bug's id, null when there's nothing left to hit
 */
export const pickTarget = (bugs, clickedId = null) => {
  const alive = bugs.filter(isAlive);
  const clicked = alive.find((bug) => bug.id === clickedId);
  return (clicked ?? alive[0])?.id ?? null;
};

/**
 * @param {{ status: string }[]} bugs every bug on screen
 * @returns {number} how many are still crawling or waiting
 */
export const aliveCount = (bugs) => bugs.filter(isAlive).length;

// how fast a bug crawls at 1x, in px a second. it scales with the stage so the walk in takes the same few seconds
const CRAWL_SPEED = 70;

/**
 * How a bug moves for what it's doing right now, scaled to the stage, so the crawl, the bob and the flight after the
 * roundhouse read the same at 1x on a phone and 2x on a wide screen.
 * @param {"crawling" | "rushing" | "waiting" | "squashed" | "fleeing"} status
 * @param {number} stopX where it stops in front of Jill, in px
 * @param {number} scale how big the stage is drawn
 * @returns {object} the framer motion target, transition included
 */
export const bugMotion = (status, stopX, scale = 1) => {
  if (status === "rushing") return { x: stopX, transition: { duration: 0.35, ease: "easeOut" } };
  if (status === "waiting") return { x: stopX, y: [0, -2 * scale, 0], transition: { y: { duration: 0.5, repeat: Infinity } } };
  if (status === "squashed") return { x: stopX - 150 * scale, y: -90 * scale, rotate: -540, opacity: 0, transition: { duration: 0.8, ease: "easeOut" } };
  if (status === "fleeing") return { x: -60 * scale, opacity: 0, transition: { duration: 0.9, ease: "easeIn" } };
  return { x: stopX, transition: { duration: Math.max(2.5, stopX / (CRAWL_SPEED * scale)), ease: "linear" } };
};

/**
 * The squash counter in words.
 * @param {number} count bugs squashed so far
 * @returns {string} like "1 bug squashed" or "4 bugs squashed"
 */
export const squashLine = (count) => `${count} ${count === 1 ? "bug" : "bugs"} squashed`;
