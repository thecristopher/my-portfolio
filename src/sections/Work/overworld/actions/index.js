// the landscape is drawn in art pixels this many css px wide, and this many art pixels tall
export const ART_PIXEL = 3;
export const ART_HEIGHT = 80;

// rows of the scene, top to bottom: the sea starts at the horizon, buildings stand on the far shore, the path is the ground
export const HORIZON_ROW = 50;
export const SHORE_ROW = 66;
export const GROUND_ROW = 68;

// how far along the career a stop counts as reached, in steps
const AT_STOP = 0.08;

/**
 * A small seeded random generator, so the landscape comes out the same on every visit and in every test.
 * @param {number} seed any integer
 * @returns {() => number} a function returning the next number between 0 and 1
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
 * Which part of the trip a spot belongs to: the coast where it started, the city in the middle, the offices at the end.
 * @param {number} fraction how far along the landscape, from 0 to 1
 * @returns {"coast" | "city" | "offices"}
 */
export const zoneAt = (fraction) => {
  if (fraction < 0.34) return "coast";
  if (fraction < 0.68) return "city";
  return "offices";
};

/**
 * How wide a parallax layer has to be so it never runs out while the track slides past: the screen plus its share
 * of the slide.
 * @param {number} viewportWidth px
 * @param {number} trackWidth px, the whole row of titles
 * @param {number} factor how fast the layer moves next to the track, 1 moves with it
 * @returns {number} px
 */
export const layerWidth = (viewportWidth, trackWidth, factor) => Math.ceil(viewportWidth + Math.max(0, trackWidth - viewportWidth) * factor + 2 * ART_PIXEL);

/**
 * Where Link is along the row of titles. His position on the track moves from the first title to the last as the
 * scroll goes from 0 to 1, so the stop is just the progress spread across the steps.
 * @param {number} progress 0 to 1
 * @param {number} count how many titles
 * @returns {{ index: number, isAt: boolean }} the nearest stop, and whether he is standing at it
 */
export const stopAt = (progress, count) => {
  if (count <= 1) return { index: 0, isAt: true };
  const along = progress * (count - 1);
  const index = Math.round(along);
  return { index, isAt: Math.abs(along - index) <= AT_STOP };
};

// how much scroll Link spends standing at a chest, next to the scroll it takes to walk from one chest to the next
const DWELL_WEIGHT = 1.2;

// eases each walk in and out, so he slows into a chest instead of slamming into it
const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Turns the raw scroll into the trip: the row holds still at every chest for a stretch of scroll, long enough for the
 * lid to open and the text box to be read, then walks on to the next one.
 * @param {number} raw scroll progress from 0 to 1
 * @param {number} count how many chests
 * @param {number} dwell how much scroll a stop takes next to a walk of 1
 * @returns {number} progress along the row from 0 to 1, flat while he stands at a chest
 */
export const dwellProgress = (raw, count, dwell = DWELL_WEIGHT) => {
  if (count <= 1) return Math.min(1, Math.max(0, raw));
  let left = Math.min(1, Math.max(0, raw)) * (count * dwell + (count - 1));
  for (let stop = 0; stop < count - 1; stop += 1) {
    if (left <= dwell) return stop / (count - 1);
    left -= dwell;
    if (left < 1) return (stop + smoothstep(left)) / (count - 1);
    left -= 1;
  }
  return 1;
};

/**
 * How many chests Link has reached so far. A chest opens once and stays open while he walks on.
 * @param {number} progress 0 to 1
 * @param {number} count how many titles
 * @returns {number} chests open, counting from the first
 */
export const openedChests = (progress, count) => {
  if (count <= 1) return count;
  return Math.min(count, Math.floor(progress * (count - 1) + AT_STOP) + 1);
};

/**
 * The part of a line typed so far, one character at a time like an old game's text box.
 * @param {string} text the whole line
 * @param {number} elapsedMs since it started typing
 * @param {number} msPerChar how long each character takes
 * @returns {string}
 */
export const typedText = (text, elapsedMs, msPerChar = 32) => text.slice(0, Math.max(0, Math.floor(elapsedMs / msPerChar)));

/**
 * What the text box says when Link holds a title up.
 * @param {{ title: string, isCurrent: boolean }} step
 * @returns {{ lead: string, item: string, tail: string }} the line split so the title can be colored
 */
export const dialogLine = ({ title, isCurrent }) => ({ lead: "You got ", item: title, tail: isCurrent ? "! Still holding this one." : "!" });

/**
 * The far hills as one height per art column, a few slow waves stacked so the ridge never looks repeated.
 * @param {number} width art columns
 * @param {number} seed
 * @returns {number[]} heights above the horizon, in art pixels
 */
export const ridgeHeights = (width, seed) => {
  const random = seededRandom(seed);
  const waves = [0, 1, 2].map((octave) => ({ length: 60 / (octave + 1), phase: random() * 100, height: 7 / (octave + 1) }));
  return Array.from({ length: width }, (_, x) => Math.round(9 + waves.reduce((sum, wave) => sum + Math.sin((x + wave.phase) / wave.length) * wave.height, 0)));
};

const BUILDING_SHAPES = {
  coast: { width: [6, 9], height: [5, 9], gap: [7, 16] },
  city: { width: [8, 12], height: [12, 22], gap: [1, 4] },
  offices: { width: [10, 16], height: [24, 40], gap: [1, 3] },
};

const between = (random, [min, max]) => min + Math.floor(random() * (max - min + 1));

/**
 * The skyline along the far shore: a few beach houses on the coast, then the city, then the office towers at the end.
 * @param {number} width art columns
 * @param {number} seed
 * @returns {{ x: number, width: number, height: number, zone: string }[]}
 */
export const skyline = (width, seed) => {
  const random = seededRandom(seed);
  const buildings = [];
  let x = between(random, [2, 10]);
  while (x < width) {
    const zone = zoneAt(x / width);
    const shape = BUILDING_SHAPES[zone];
    const building = { x, width: between(random, shape.width), height: between(random, shape.height), zone };
    buildings.push(building);
    x += building.width + between(random, shape.gap);
  }
  return buildings;
};

/**
 * The windows of one building, a lit pixel every other column and every third row, inside its walls.
 * @param {{ x: number, width: number, height: number }} building
 * @param {number} base the row the building stands on
 * @returns {{ x: number, y: number }[]}
 */
export const windowsOf = ({ x, width, height }, base) => {
  const windows = [];
  for (let column = x + 2; column < x + width - 1; column += 2) {
    for (let row = base - height + 3; row < base - 2; row += 3) windows.push({ x: column, y: row });
  }
  return windows;
};

const PROP_BY_ZONE = { coast: "palm", city: "tree", offices: "lamp" };

/**
 * What stands by the path, close to the walker: palms on the coast, trees in the city, lamps by the offices.
 * @param {number} width art columns
 * @param {number} seed
 * @returns {{ kind: "palm" | "tree" | "lamp", x: number }[]}
 */
export const roadside = (width, seed) => {
  const random = seededRandom(seed);
  const props = [];
  for (let x = between(random, [4, 20]); x < width - 12; x += between(random, [26, 54])) props.push({ kind: PROP_BY_ZONE[zoneAt(x / width)], x });
  return props;
};

/**
 * Clouds drifting across the sky.
 * @param {number} width art columns
 * @param {number} seed
 * @returns {{ x: number, y: number }[]}
 */
export const cloudsAlong = (width, seed) => {
  const random = seededRandom(seed);
  const clouds = [];
  for (let x = between(random, [0, 30]); x < width; x += between(random, [48, 96])) clouds.push({ x, y: between(random, [4, 22]) });
  return clouds;
};

/**
 * A rectangle as an svg path in art pixels.
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
export const rectPath = (x, y, width, height) => `M${x} ${y}h${width}v${height}h${-width}z`;

/**
 * Whether a chest just got opened for the first time this visit, so the fanfare plays once per chest.
 * @param {number} mostOpened the most chests that were ever open so far
 * @param {number} opened how many are open now
 * @returns {boolean}
 */
export const isNewChest = (mostOpened, opened) => opened > mostOpened;
