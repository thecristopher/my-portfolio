/**
 * Where I work now, from the newest job the API lists. The title lives in the hero and the timeline, not here.
 * @param {{ title: string }[]} projects the jobs, newest first
 * @returns {string | null} the company, null while the jobs are on their way
 */
export const currentCompany = (projects = []) => projects[0]?.title ?? null;

/**
 * An AWS certification without the words every one of them repeats.
 * @param {string} name like "AWS Certified Developer – Associate"
 * @returns {string} like "AWS Developer – Associate"
 */
export const shortCertName = (name = "") => name.replace("AWS Certified ", "AWS ");

// roughly when the sun is up in Rosarito, sunrise to sunset, in hours
export const DAYLIGHT = { rises: 6, sets: 19 };

/**
 * Where the sun (or the moon) sits on its arc right now: how far through the day or the night it is.
 * @param {number} hour the hour where I live, 0 to 23
 * @param {number} minute the minute
 * @returns {{ isDay: boolean, progress: number }} progress runs 0 at rise to 1 at set
 */
export const skyPosition = (hour, minute = 0) => {
  const time = hour + minute / 60;
  const { rises, sets } = DAYLIGHT;
  if (time >= rises && time < sets) return { isDay: true, progress: (time - rises) / (sets - rises) };
  const nightLength = 24 - (sets - rises);
  const intoNight = time >= sets ? time - sets : time + 24 - sets;
  return { isDay: false, progress: intoNight / nightLength };
};

/**
 * A point along a half circle arc that rises from the left edge and sets on the right, in a box.
 * @param {number} progress 0 at the left horizon, 1 at the right
 * @param {{ width: number, height: number }} box the arc fills its width and peaks at its top
 * @returns {{ x: number, y: number }} the point, rounded to two decimals
 */
export const arcPoint = (progress, { width, height }) => {
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, progress)));
  const round = (value) => Math.round(value * 100) / 100;
  return { x: round(width / 2 + (width / 2) * Math.cos(angle)), y: round(height - height * Math.sin(angle)) };
};
