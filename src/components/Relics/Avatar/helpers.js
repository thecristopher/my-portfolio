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
