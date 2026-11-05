/**
 * When each beat of the opening plays, as slices of the pinned scroll from 0 to 1: the sun comes up out of the sea while
 * the name leaves, the photo grows into the stage, the page dims to the photo's green, the story lands on the photo, and
 * the stage's lower edge melts into the page before it scrolls away.
 */
export const HERO_BEATS = {
  title: [0, 0.3],
  sunrise: [0, 0.32],
  grow: [0, 0.55],
  stage: [0.25, 0.55],
  caption: [0.55, 0.8],
  exit: [0.88, 1],
};

/**
 * The story half of the API's headline, without the job title it opens with, since the title already sits above the name.
 * @param {string} headline like "Engineering Manager & Tech Lead. Nine years of shipping software..."
 * @returns {string} the sentences after the first, empty when there are none
 */
export const headlineStory = (headline = "") =>
  (headline ?? "")
    .split(". ")
    .slice(1)
    .join(". ")
    .trim();

// the first and last stretch of daylight count as sunrise and sunset, about an hour and a half each
const GOLDEN_SLICE = 0.12;

/**
 * Which light Rosarito is in at a given hour: sunrise, day, sunset or night.
 * @param {{ isDay: boolean, progress: number }} sky where the sun or moon is, from skyPosition
 * @returns {"sunrise" | "day" | "sunset" | "night"}
 */
export const skyPhase = ({ isDay, progress }) => {
  if (!isDay) return "night";
  if (progress < GOLDEN_SLICE) return "sunrise";
  if (progress > 1 - GOLDEN_SLICE) return "sunset";
  return "day";
};

/**
 * The three colors the aurora drifts in for each light. Sunset keeps the page's own sunset tokens, so the evening
 * aurora is the one the rest of the page is tinted with.
 */
export const AURORA_PALETTES = {
  sunrise: ["#ffb48a", "#ff7aa8", "#ffd27a"],
  day: ["#ffd166", "#5ab8ff", "#5fe0d0"],
  sunset: ["var(--color-sunset-1)", "var(--color-sunset-3)", "var(--color-sunset-2)"],
  night: ["#3b4bd8", "#8c5cf0", "#2fb8c8"],
};

/**
 * How heavy a letter of the name gets for a cursor this far from its center: full weight right under it, fading back
 * to the resting weight at the edge of the reach.
 * @param {number} distance px from the cursor to the letter's center
 * @param {{ reach: number, rest: number, peak: number }} weights how far the pull reaches, and the weights it moves between
 * @returns {number} a font weight, rounded to a whole number
 */
export const letterWeight = (distance, { reach, rest, peak }) => {
  const closeness = Math.max(0, 1 - distance / reach);
  // eased so the weight swells under the cursor instead of ramping in a straight line
  const eased = closeness * closeness * (3 - 2 * closeness);
  return Math.round(rest + (peak - rest) * eased);
};

// the stretch of the sunrise the lamps go out in
const LAMPS_OFF = [0.25, 0.75];

/**
 * Whether one of the pier's lamps is still on during the sunrise. They switch off one after the other as the day comes,
 * the one farthest out at sea first, so the dark walks back toward the shore.
 * @param {number} index which lamp, 0 is the one closest to the shore
 * @param {number} count how many lamps the pier has
 * @param {number} progress how far the sunrise has gone, from 0 to 1
 * @returns {boolean} true while the lamp is still lit
 */
export const isLampLit = (index, count, progress) => {
  const order = count - 1 - index;
  // the first lamp waits for a little light, the last one goes out with plenty of sun still to rise
  const step = (LAMPS_OFF[1] - LAMPS_OFF[0]) / Math.max(1, count - 1);
  return progress < LAMPS_OFF[0] + order * step;
};
