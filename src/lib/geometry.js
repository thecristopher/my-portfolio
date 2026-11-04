/**
 * A point on a circle, with 0 degrees at the top and angles running clockwise, the way a clock reads.
 * @param {number} angle degrees from the top
 * @param {number} radius distance from the center
 * @param {{ x: number, y: number }} center where the circle sits
 * @returns {{ x: number, y: number }} the point, rounded to two decimals so SVG output stays stable
 */
export const pointOnCircle = (angle, radius, center = { x: 0, y: 0 }) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  const round = (value) => Math.round(value * 100) / 100;
  return { x: round(center.x + radius * Math.cos(radians)), y: round(center.y + radius * Math.sin(radians)) };
};
