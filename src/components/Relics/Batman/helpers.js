export const SIGNAL_YELLOW = "#ffd84a";
// detective mode paints the world in this blue, and whatever the scan locks on to in orange
export const DETECTIVE_BLUE = "#4fb6ff";
export const ARKHAM_ORANGE = "#ff9a3c";
export const GOTHAM_NIGHT = "#04060b";

// the Arkham bat: wide wings that hook up into horns, short square ears and two scallops a side, sized for a 100 by 50 box
export const BAT_PATH =
  "M50.0 46.3 C53.1 39.7 58.9 34.3 65.1 33.2 C69.7 32.7 73.8 33.9 75.9 35.6 C75.9 29.8 82.1 26.3 88.7 26.1 C92.9 26.0 97.0 26.6 100.0 27.3 C99.5 22.3 95.4 16.5 91.2 13.0 C85.4 8.2 79.6 4.9 74.5 3.7 C76.7 5.9 77.6 7.0 77.4 9.1 C77.2 14.0 72.2 16.9 69.3 17.6 C64.7 19.0 59.8 19.2 56.0 19.2 L54.2 9.2 L52.1 14.2 L47.9 14.2 L45.8 9.2 L44.0 19.2 C40.2 19.2 35.3 19.0 30.7 17.6 C27.8 16.9 22.8 14.0 22.6 9.1 C22.4 7.0 23.3 5.9 25.5 3.7 C20.4 4.9 14.6 8.2 8.8 13.0 C4.6 16.5 0.5 22.3 0 27.3 C3.0 26.6 7.1 26.0 11.3 26.1 C17.9 26.3 24.1 29.8 24.1 35.6 C26.2 33.9 30.3 32.7 34.9 33.2 C41.1 34.3 46.9 39.7 50.0 46.3 Z";

// the beats of the moment in seconds. the picture and the sound both read from here so they never drift apart
export const BEATS = {
  thunder: 0.3,
  swing: 0.8,
  lit: 1.9,
  detective: 2.3,
  lock: 3.0,
  hud: 3.3,
  closed: 5.3,
  end: 6.2,
};

// what the case file types out once the scan locks on
export const HUD_LINES = [
  { label: "CASE FILE", value: "contact.sh" },
  { label: "EVIDENCE", value: "every bug leaves some" },
  { label: "STATUS", value: "on call at 3 a.m." },
];

export const HUD_TIMING = { startAt: BEATS.hud, perLetter: 0.02, pause: 0.12 };

/**
 * Gives each HUD line its start time, so a line only starts typing once the one above it is done.
 * @param {{ label: string, value: string }[]} lines what to type, top to bottom
 * @param {{ startAt: number, perLetter: number, pause: number }} timing when the first line starts, seconds per letter, and the breath between lines
 * @returns {{ label: string, value: string, text: string, at: number, endsAt: number }[]} the lines with their full text and timing
 */
export const scheduleLines = (lines, { startAt, perLetter, pause }) => {
  let cursor = startAt;
  return lines.map((line) => {
    const text = `${line.label}: ${line.value}`;
    const at = cursor;
    const endsAt = at + text.length * perLetter;
    cursor = endsAt + pause;
    return { ...line, text, at, endsAt };
  });
};

/**
 * Rain over Gotham, each streak in its own lane with its own pace so it never falls in rows.
 * @param {number} count how many streaks
 * @returns {{ left: number, delay: number, duration: number, length: number }[]} left in %, delay and duration in seconds, length in vh
 */
export const rainStreaks = (count) =>
  Array.from({ length: count }, (_, index) => ({
    left: (index * 37 + (index % 3) * 11) % 100,
    delay: (index * 0.13) % 0.9,
    duration: 0.45 + ((index * 7) % 5) * 0.07,
    length: 8 + ((index * 11) % 9),
  }));

// the Gotham skyline in a 400 by 120 box: x, width and height of each tower, the tall ones get gothic spires
export const SKYLINE = [
  { x: 0, width: 34, height: 62 },
  { x: 30, width: 26, height: 88, spire: true },
  { x: 54, width: 40, height: 54 },
  { x: 90, width: 22, height: 74 },
  { x: 110, width: 36, height: 46 },
  { x: 144, width: 28, height: 98, spire: true },
  { x: 228, width: 30, height: 92, spire: true },
  { x: 256, width: 42, height: 58 },
  { x: 296, width: 24, height: 80 },
  { x: 318, width: 38, height: 50 },
  { x: 354, width: 26, height: 104, spire: true },
  { x: 378, width: 22, height: 66 },
];

/**
 * A tower as an svg path, sitting on the bottom of the 120 tall skyline box.
 * @param {{ x: number, width: number, height: number, spire?: boolean }} tower
 * @returns {string} the path
 */
export const towerPath = ({ x, width, height, spire = false }) => {
  const top = 120 - height;
  const body = `M${x} 120 V${top} H${x + width} V120 Z`;
  if (!spire) return body;
  const middle = x + width / 2;
  return `${body} M${x + width * 0.2} ${top} L${middle} ${top - height * 0.22} L${x + width * 0.8} ${top} Z`;
};
