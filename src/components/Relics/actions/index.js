import { pointOnCircle } from "../../../lib/geometry";

/**
 * The spokes of a spark burst, evenly around the center, every other one longer so it reads as light, not a clock.
 * @param {number} count how many spokes
 * @param {{ inner?: number, outer?: number }} reach where each spoke starts and how far the long ones go
 * @returns {{ angle: number, isLong: boolean, inner: { x: number, y: number }, outer: { x: number, y: number } }[]}
 */
export const burstSpokes = (count, { inner = 24, outer = 96 } = {}) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index * 360) / count;
    const isLong = index % 2 === 0;
    return { angle, isLong, inner: pointOnCircle(angle, inner), outer: pointOnCircle(angle, isLong ? outer : outer * 0.7) };
  });

/**
 * One slice of a pie as an SVG path, the shape the Umbrella logo is built from.
 * @param {number} index which slice, 0 starts at the top
 * @param {number} count how many slices make the whole
 * @param {number} radius how far the slice reaches
 * @param {{ x: number, y: number }} center the middle of the pie
 * @returns {string} the path, a straight edged wedge
 */
export const wedgePath = (index, count, radius, center = { x: 32, y: 32 }) => {
  const step = 360 / count;
  const from = pointOnCircle(index * step - step / 2, radius, center);
  const to = pointOnCircle(index * step + step / 2, radius, center);
  return `M${center.x} ${center.y} L${from.x} ${from.y} L${to.x} ${to.y} Z`;
};

/**
 * The corners of a regular polygon as an SVG points list.
 * @param {number} sides how many corners
 * @param {number} radius how far each corner is from the center
 * @param {{ x: number, y: number }} center the middle
 * @param {number} rotation degrees to turn the whole shape
 * @returns {string} like "32,8 52.78,44 11.22,44"
 */
export const polygonPoints = (sides, radius, center = { x: 32, y: 32 }, rotation = 0) =>
  Array.from({ length: sides }, (_, index) => {
    const { x, y } = pointOnCircle(rotation + (index * 360) / sides, radius, center);
    return `${x},${y}`;
  }).join(" ");
