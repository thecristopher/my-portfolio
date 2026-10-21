// svg numbers rounded to two decimals, more than that is just noise in the markup
const round = (value) => Math.round(value * 100) / 100;

// the moment's beats in seconds, one per line of the narration, shared with the jingle so the drums land on the words
export const BEATS = {
  firstElement: 0.55,
  elementGap: 0.7,
  together: 3.35,
  harmony: 3.65,
  roles: 4.9,
  master: 5.55,
  lastsMs: 6000,
};

/**
 * When an element gets its line: Water, Earth, Fire, Air, one beat apart like the narration.
 * @param {number} index 0 for water through 3 for air
 * @returns {number} seconds from the start of the moment
 */
export const elementBeat = (index) => round(BEATS.firstElement + index * BEATS.elementGap);

/**
 * The four corners of a diamond around a center: top, right, bottom, left.
 * @param {number} reach distance from the center to each corner
 * @returns {Array<{ x: number, y: number }>}
 */
export const diamondSpots = (reach) => [
  { x: 0, y: -reach },
  { x: reach, y: 0 },
  { x: 0, y: reach },
  { x: -reach, y: 0 },
];

/**
 * A rolling wave filled down to the bottom of its box, crest after crest across the whole width.
 * @param {{ width: number, height: number, level: number, swell: number, wavelength: number }} shape
 * @returns {string} svg path data
 */
export const wavePath = ({ width, height, level, swell, wavelength }) => {
  const half = wavelength / 2;
  const crests = Math.ceil(width / half);
  // the first hump sets the curve, every T after it mirrors the last one so the line stays smooth
  const rest = Array.from({ length: crests - 1 }, (_, index) => `T${round((index + 2) * half)} ${level}`).join(" ");
  return `M0 ${level} Q${round(half / 2)} ${level - swell} ${round(half)} ${level} ${rest} L${width} ${height} L0 ${height} Z`;
};

/**
 * An arc around the middle of the screen, the trail a gust of wind leaves when it circles.
 * @param {number} radius distance from the center
 * @param {number} fromDeg where the arc starts, 0 is straight up
 * @param {number} sweepDeg how far it goes clockwise
 * @returns {string} svg path data, centered on 0 0
 */
export const gustArc = (radius, fromDeg, sweepDeg) => {
  const point = (deg) => {
    const angle = (deg * Math.PI) / 180;
    return `${round(radius * Math.sin(angle))} ${round(-radius * Math.cos(angle))}`;
  };
  const isLong = sweepDeg > 180 ? 1 : 0;
  return `M${point(fromDeg)} A${radius} ${radius} 0 ${isLong} 1 ${point(fromDeg + sweepDeg)}`;
};

// the jagged skyline every rock shares, nudged per rock so no two look cut from the same stone
const ROCK_TOP = [
  [0, 40],
  [16, 14],
  [38, 0],
  [60, 16],
  [80, 6],
  [100, 36],
];

/**
 * The outline of one rock in a 100 by 100 box: a jagged top over a flat base.
 * @param {number} index which rock in the row, so each gets its own shape
 * @returns {string} polygon points
 */
export const rockOutline = (index) => {
  const top = ROCK_TOP.map(([x, y], corner) => `${x},${y + ((index * 13 + corner * 7) % 12)}`);
  return [...top, "100,100", "0,100"].join(" ");
};

/**
 * A row of rocks along the bottom of the screen, middle ones tallest, rising one after another.
 * @param {number} count how many rocks
 * @returns {Array<{ left: number, width: number, height: number, delay: number, outline: string }>} left and width in %, height in vh
 */
export const rockRow = (count) =>
  Array.from({ length: count }, (_, index) => {
    const fromMiddle = Math.abs(index - (count - 1) / 2) / ((count - 1) / 2 || 1);
    return {
      left: round((index / count) * 100 - 2),
      width: round(100 / count + 4),
      height: round(30 - fromMiddle * 14 + (index % 2) * 4),
      delay: round(fromMiddle * 0.12),
      outline: rockOutline(index),
    };
  });

/**
 * A row of flames along the bottom, each its own height and flicker speed so the fire never pulses in step.
 * @param {number} count how many tongues of fire
 * @returns {Array<{ left: number, height: number, flicker: number }>} left in %, height in vh, flicker in seconds
 */
export const flameRow = (count) =>
  Array.from({ length: count }, (_, index) => ({
    left: round((index / (count - 1)) * 100),
    height: 16 + ((index * 5) % 4) * 6,
    flicker: round(0.22 + (index % 3) * 0.07),
  }));

/**
 * One bowed note the way an erhu plays it: a scoop up from below, then a warm vibrato wobbling around the pitch.
 * @param {number} semitones the note, in semitones from A4
 * @param {number} start seconds
 * @param {number} length seconds
 * @param {{ depth?: number, wobble?: number }} options vibrato depth in semitones and seconds per wobble
 * @returns {Array} notes in the recipe format
 */
export const erhuNote = (semitones, start, length, { depth = 0.35, wobble = 0.11 } = {}) => {
  const scoop = Math.min(0.08, length / 3);
  const wobbles = Math.max(1, Math.round((length - scoop) / wobble));
  const step = (length - scoop) / wobbles;
  const held = Array.from({ length: wobbles }, (_, index) => {
    const isUp = index % 2 === 0;
    // each piece overlaps the next a hair so the envelopes don't leave gaps between them
    return [isUp ? semitones : semitones + depth, round(start + scoop + index * step), round(step + 0.03), { slideTo: isUp ? semitones + depth : semitones, attack: 0.015 }];
  });
  return [[semitones - 1, start, round(scoop + 0.02), { slideTo: semitones, attack: 0.03 }], ...held];
};
