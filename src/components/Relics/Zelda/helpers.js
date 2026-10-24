const isInside = (rows, x, y) => rows[y]?.[x] === "#";

// which shade an inside pixel gets: outline on the rim, light down the left face, shadow down the right and the base
const shadeFor = (rows, x, y) => {
  const touchesEdge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !isInside(rows, x + dx, y + dy));
  if (touchesEdge) return "K";
  if (!isInside(rows, x - 2, y)) return "h";
  if (!isInside(rows, x + 2, y) || !isInside(rows, x, y + 2)) return "s";
  return "G";
};

/**
 * One golden triangle as sprite rows: outlined, lit from the left and shaded on the right, the way the SNES drew it.
 * @param {number} width pixels across the base, even so the tip sits centered
 * @param {number} height pixels from tip to base
 * @returns {string[]} sprite rows using K outline, h light, G gold and s shadow
 */
export const triangleRows = (width, height) => {
  const shape = Array.from({ length: height }, (_, y) => {
    const halfWidth = ((y + 1) / height) * (width / 2);
    return Array.from({ length: width }, (_, x) => (Math.abs(x + 0.5 - width / 2) <= halfWidth ? "#" : ".")).join("");
  });
  return shape.map((row, y) => [...row].map((char, x) => (char === "#" ? shadeFor(shape, x, y) : ".")).join(""));
};

/**
 * The whole Triforce from one piece: the piece on top, centered, and two side by side under it.
 * @param {string[]} pieceRows rows of one triangle
 * @returns {string[]} rows twice as wide and twice as tall as the piece
 */
export const triforceRows = (pieceRows) => {
  const width = pieceRows[0].length;
  const pad = ".".repeat(width / 2);
  return [...pieceRows.map((row) => `${pad}${row}${pad}`), ...pieceRows.map((row) => `${row}${row}`)];
};
