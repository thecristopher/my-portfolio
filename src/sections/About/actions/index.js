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

/**
 * Where a place lands on the dotted map, in grid cells from its top left corner.
 * @param {{ lat: number, lon: number }} place
 * @param {{ step: number, top: number }} world degrees per cell and the latitude of the top row
 * @returns {{ x: number, y: number }}
 */
export const projectOnMap = ({ lat, lon }, { step, top }) => ({ x: (lon + 180) / step, y: (top - lat) / step });

/**
 * Every land cell of the map as one SVG path of zero length strokes, so thousands of dots draw as a single element.
 * Round line caps turn each stroke into a dot.
 * @param {string[]} rows one string per row of the map, "#" for land
 * @returns {string} the path data
 */
export const dotsPath = (rows = []) =>
  rows
    .flatMap((row, y) => [...row].map((cell, x) => (cell === "#" ? `M${x + 0.5} ${y + 0.5}h0` : "")))
    .join("");

/**
 * A curved flight line between two points on the map, bowing up like a route on an airline map.
 * @param {{ x: number, y: number }} from
 * @param {{ x: number, y: number }} to
 * @param {number} bow how high the curve rises, as a share of the distance between the points
 * @returns {string} the path data
 */
export const arcPath = (from, to, bow = 0.35) => {
  const lift = Math.hypot(to.x - from.x, to.y - from.y) * bow;
  const control = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - lift };
  const round = (value) => Math.round(value * 100) / 100;
  return `M${round(from.x)} ${round(from.y)}Q${round(control.x)} ${round(control.y)} ${round(to.x)} ${round(to.y)}`;
};

/**
 * How far a light has to spread from a point to reach every corner of a box.
 * @param {{ x: number, y: number }} origin
 * @param {{ width: number, height: number }} box
 * @returns {number} the radius
 */
export const reachRadius = ({ x, y }, { width, height }) => Math.hypot(Math.max(x, width - x), Math.max(y, height - y));

/**
 * When one square of the experience grid lights up, so the grid fills in step with the years counting up. The count
 * eases out fast and then slows, and each square waits until the count has reached its share of the total.
 * @param {number} index the square, 0 based, in the order they light
 * @param {number} count how many squares there are
 * @param {number} seconds how long the count takes
 * @returns {number} the delay in seconds
 */
export const lightUpAt = (index, count, seconds) => {
  const share = Math.min(index / count, 0.999);
  // the inverse of the ease out curve the count uses
  const delay = (-Math.log2(1 - share) / 10) * seconds;
  // the very first square comes out as -0, which is still no wait at all
  return Math.round(delay * 1000) / 1000 || 0;
};

/**
 * A line through points, as SVG path data, like a coastline traced by hand.
 * @param {{ x: number, y: number }[]} points in order
 * @returns {string} the path data, empty when there are no points
 */
export const linePath = (points = []) => {
  const round = (value) => Math.round(value * 100) / 100;
  return points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${round(x)} ${round(y)}`).join("");
};

/**
 * The center of the box around some points, where a camera should look to frame them all.
 * @param {{ x: number, y: number }[]} points
 * @returns {{ x: number, y: number }}
 */
export const centerOf = (points = []) => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 };
};

/**
 * The camera over the map while it pulls back: close in on a spot at the start, the whole map at the end. The zoom
 * eases exponentially and the spot glides on screen from the center to its real place, so it never slides out of
 * frame on the way.
 * @param {number} pull how far it has pulled back, 0 close in, 1 the whole map
 * @param {{ x: number, y: number }} spot what it starts close on
 * @param {{ width: number, height: number }} box the map
 * @param {number} closeness how many times bigger the map is drawn at the start
 * @returns {{ scale: number, transform: string }} the scale, and the SVG transform that draws it
 */
export const pullBack = (pull, spot, box, closeness) => {
  const at = Math.min(1, Math.max(0, pull));
  const scale = closeness ** (1 - at);
  const center = { x: box.width / 2, y: box.height / 2 };
  const look = { x: spot.x - ((spot.x - center.x) * at) / scale, y: spot.y - ((spot.y - center.y) * at) / scale };
  const round = (value) => Math.round(value * 1000) / 1000;
  return { scale: round(scale), transform: `translate(${center.x} ${center.y}) scale(${round(scale)}) translate(${round(-look.x)} ${round(-look.y)})` };
};

/**
 * Which side of its light a stop's card opens on, so it never runs off the map.
 * @param {{ x: number, y: number }} spot where the light is, as a share of the map from 0 to 1
 * @returns {{ side: "left" | "right", rise: "up" | "middle" | "down" }} where the card sits next to it
 */
export const cardPlacement = ({ x, y }) => ({
  side: x > 0.55 ? "left" : "right",
  rise: y < 0.3 ? "down" : y > 0.7 ? "up" : "middle",
});

/**
 * What a stop's card says, straight from the job it belongs to, so the map never claims more than the work history.
 * @param {{ company: string, place: string }} stop
 * @param {{ title: string, description?: string, highlights?: string[], url?: string }[]} projects
 * @returns {{ company: string, place: string, description: string, highlight: string | null, url: string | null } | null}
 *   null when the job isn't in the list
 */
export const stopCard = (stop, projects = []) => {
  const project = projects.find((job) => job.title === stop.company);
  if (!project) return null;
  return {
    company: stop.company,
    place: stop.place,
    description: project.description ?? "",
    highlight: project.highlights?.[0] ?? null,
    url: project.url ?? null,
  };
};

/**
 * The part of the day over Rosarito, so the sky can wear its colors.
 * @param {number} hour 0 to 23, where I live
 * @param {number} minute
 * @returns {"dawn" | "day" | "dusk" | "night"}
 */
export const dayPart = (hour, minute = 0) => {
  const time = hour + minute / 60;
  if (time >= DAYLIGHT.rises - 1 && time < DAYLIGHT.rises + 1) return "dawn";
  if (time >= DAYLIGHT.rises + 1 && time < DAYLIGHT.sets - 1) return "day";
  if (time >= DAYLIGHT.sets - 1 && time < DAYLIGHT.sets + 1) return "dusk";
  return "night";
};

// the sky's colors at each part of the day, from the top of the sky down to the horizon
export const SKY_COLORS = {
  dawn: { top: "#33407a", horizon: "#ffab7a" },
  day: { top: "#6fb8ff", horizon: "#d8efff" },
  dusk: { top: "#3d2a63", horizon: "#ff7a59" },
  night: { top: "#070b1f", horizon: "#2a2352" },
};

// how to say hi in the languages that might be listed. anything else greets with its own name
const GREETINGS = { Spanish: "Hola", English: "Hello", French: "Bonjour", Portuguese: "Olá", German: "Hallo", Italian: "Ciao" };

/**
 * The hello for a language.
 * @param {string} language like "Spanish"
 * @returns {string} like "Hola"
 */
export const greetingFor = (language = "") => GREETINGS[language] ?? language;

/**
 * Every frame of a typewriter greeting each word in turn: typed one letter at a time, held, then erased.
 * @param {string[]} words what it types
 * @param {number} hold how many frames each word stays fully typed
 * @returns {string[]} the text on screen at every frame
 */
export const typingFrames = (words = [], hold = 8) =>
  words.flatMap((word) => {
    const letters = [...word];
    const typed = letters.map((_, index) => letters.slice(0, index + 1).join(""));
    const erased = [...typed].reverse().slice(1);
    return [...typed, ...Array(hold).fill(word), ...erased, ""];
  });

/**
 * When a chapter title over the map fades in and out. The first one is already up when the scene pins, so the map
 * never opens on an empty screen, and the last one stays up once it lands.
 * @param {[number, number]} beat where the chapter starts and ends, from 0 to 1 of the scroll
 * @param {{ isFirst: boolean, isLast: boolean, fade?: number }} options
 * @returns {{ input: number[], output: number[] }} ranges ready for a scroll transform
 */
export const chapterFade = ([from, to], { isFirst, isLast, fade = 0.04 }) => ({
  input: isFirst ? [from - fade, from, to - fade, to] : [from, from + fade, to - fade, to],
  output: [0, 1, 1, isLast ? 1 : 0],
});
