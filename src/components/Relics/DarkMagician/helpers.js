import { overlaySprite, pixelRingRows } from "../../../actions";

// the corners of a triangle inscribed in a circle, pointing up or down
const triangleCorners = (center, radius, pointsUp) =>
  [0, 120, 240].map((deg) => {
    const angle = ((deg + (pointsUp ? 0 : 180)) * Math.PI) / 180;
    return [center + radius * Math.sin(angle), center - radius * Math.cos(angle)];
  });

// every pixel a straight line crosses, sampled twice per pixel so no gaps open on the steep ones
const linePixels = ([fromX, fromY], [toX, toY]) => {
  const samples = Math.ceil(Math.max(Math.abs(toX - fromX), Math.abs(toY - fromY)) * 2);
  return Array.from({ length: samples + 1 }, (_, step) => {
    const along = step / samples;
    return [Math.round(fromX + (toX - fromX) * along), Math.round(fromY + (toY - fromY) * along)];
  });
};

/**
 * The two rings of Dark Magician Girl's magic circle as sprite rows, a pink one outside and a blue one inside.
 * @param {number} size width and height in pixels
 * @returns {string[]} rows with "p" for pink, "b" for blue and "." for empty
 */
export const magicRingRows = (size) => {
  const gap = Math.round(size / 12);
  return overlaySprite(pixelRingRows(size, 1, "p"), { left: gap, top: gap, rows: pixelRingRows(size - gap * 2, 1, "b") });
};

/**
 * The hexagram inside the magic circle as sprite rows: a pink triangle pointing up over a blue one pointing down.
 * @param {number} size width and height in pixels, the same as the rings so the two sprites line up
 * @returns {string[]} rows with "p" for pink, "b" for blue and "." for empty
 */
export const hexagramRows = (size) => {
  const center = (size - 1) / 2;
  const radius = size / 2 - Math.round(size / 12) - 1;
  const grid = Array.from({ length: size }, () => Array(size).fill("."));
  [
    { pointsUp: true, fill: "p" },
    { pointsUp: false, fill: "b" },
  ].forEach(({ pointsUp, fill }) => {
    const corners = triangleCorners(center, radius, pointsUp);
    corners.forEach((corner, index) => {
      linePixels(corner, corners[(index + 1) % 3]).forEach(([x, y]) => {
        grid[y][x] = fill;
      });
    });
  });
  return grid.map((row) => row.join(""));
};
