export const SPIDER_RED = "#e23636";
export const SPIDER_BLUE = "#1f4fd1";
export const COMIC_YELLOW = "#ffe14d";
export const WEB_WHITE = "#f4f1ea";

// svg numbers rounded to one decimal, plenty for a web and much easier to read in the devtools
const round = (value) => Math.round(value * 10) / 10;

/**
 * A point on a circle that can be stretched taller than wide.
 * @param {[number, number]} center the middle of the circle
 * @param {number} angle radians, 0 points right
 * @param {number} radius distance from the middle
 * @param {number} stretchY how much taller than wide, 1 for a true circle
 * @returns {[number, number]} the point as x, y
 */
export const pointOn = ([cx, cy], angle, radius, stretchY = 1) => [round(cx + radius * Math.cos(angle)), round(cy + radius * Math.sin(angle) * stretchY)];

/**
 * Evenly spaced spoke angles, the threads a web is hung from.
 * @param {number} count how many spokes
 * @param {number} offset turns the whole set, as a fraction of one gap between spokes
 * @returns {number[]} angles in radians
 */
export const spokeAngles = (count, offset = 0) => Array.from({ length: count }, (_, index) => ((index + offset) * Math.PI * 2) / count);

/**
 * One ring of a web: it hops from spoke to spoke and sags toward the middle in between, the way real silk hangs.
 * @param {{ center: [number, number], radius: number, spokes: number[], sag?: number, stretchY?: number }} options
 * @returns {string} a closed svg path
 */
export const webRing = ({ center, radius, spokes, sag = 0.84, stretchY = 1 }) => {
  const halfGap = Math.PI / spokes.length;
  const [first, ...rest] = [...spokes, spokes[0] + Math.PI * 2];
  const [startX, startY] = pointOn(center, first, radius, stretchY);
  const hops = rest.map((angle) => {
    const [sagX, sagY] = pointOn(center, angle - halfGap, radius * sag, stretchY);
    const [x, y] = pointOn(center, angle, radius, stretchY);
    return `Q${sagX} ${sagY} ${x} ${y}`;
  });
  return `M${startX} ${startY} ${hops.join(" ")}`;
};

/**
 * A Spider-Sense squiggle: a jagged line of energy shooting out from the middle, the way the comics draw the tingle.
 * @param {{ center: [number, number], angle: number, from: number, to: number, zigs?: number, amplitude?: number }} options
 * @returns {string} an open svg path, meant to be stroked
 */
export const squigglePath = ({ center, angle, from, to, zigs = 6, amplitude = 2 }) => {
  const across = angle + Math.PI / 2;
  const points = Array.from({ length: zigs + 1 }, (_, index) => {
    const along = from + ((to - from) * index) / zigs;
    const [x, y] = pointOn(center, angle, along);
    // the ends sit on the ray and every point between kicks out to alternate sides
    const kick = index === 0 || index === zigs ? 0 : amplitude * (index % 2 === 0 ? 1 : -1);
    return [round(x + kick * Math.cos(across)), round(y + kick * Math.sin(across))];
  });
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
};

/**
 * The jagged burst behind comic sound effects, as svg polygon points.
 * @param {{ spikes: number, outer: number, inner: number, center?: [number, number] }} options
 * @returns {string} points for an svg polygon, alternating tip and notch
 */
export const starburstPoints = ({ spikes, outer, inner, center = [50, 50] }) =>
  Array.from({ length: spikes * 2 }, (_, index) => {
    const angle = (index * Math.PI) / spikes - Math.PI / 2;
    return pointOn(center, angle, index % 2 === 0 ? outer : inner).join(",");
  }).join(" ");
