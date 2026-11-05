import linkAtlas from "../../assets/sprites/link.png";

// one animation per row, every frame in a cell of the same size, feet resting on the cell's floor.
// the frames face right, a sprite walking left is drawn mirrored

/** Link from The Legend of Zelda: A Link to the Past. Small, so he gets drawn at 1x or 2x and never in between. */
export const LINK = {
  src: linkAtlas,
  cell: { width: 18, height: 26 },
  columns: 8,
  animations: {
    stand: { row: 0, frames: 1, fps: 1, loop: true },
    walk: { row: 1, frames: 8, fps: 14, loop: true },
    itemGet: { row: 2, frames: 1, fps: 1, loop: true },
    walkDown: { row: 3, frames: 8, fps: 14, loop: true },
    walkUp: { row: 4, frames: 8, fps: 14, loop: true },
  },
};
