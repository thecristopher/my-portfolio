// smaller nudges than this are the spring settling, not someone scrolling
const STILL = 0.0005;

/**
 * Which way a walker faces after the value it follows moves: toward where it went, or the same way when it barely moved.
 * @param {number} previous the last value
 * @param {number} next the new value
 * @param {"left" | "right"} facing the way it faces now
 * @returns {{ facing: "left" | "right", hasMoved: boolean }}
 */
export const stepWalk = (previous, next, facing) => {
  const delta = next - previous;
  if (Math.abs(delta) < STILL) return { facing, hasMoved: false };
  return { facing: delta > 0 ? "right" : "left", hasMoved: true };
};
