import jillAtlas from "../../assets/sprites/jill.png";

// one animation per row, every frame in a cell of the same size, feet resting on the cell's floor.
// the frames face right, a sprite walking left is drawn mirrored

/** Jill Valentine from Marvel vs. Capcom. */
export const JILL = {
  src: jillAtlas,
  cell: { width: 154, height: 122 },
  columns: 23,
  animations: {
    idle: { row: 0, frames: 9, fps: 10, loop: true },
    walk: { row: 1, frames: 9, fps: 12, loop: true },
    happy: { row: 2, frames: 10, fps: 10, loop: false },
    herb: { row: 3, frames: 5, fps: 6, loop: false },
    punch: { row: 4, frames: 5, fps: 16, loop: false },
    kick: { row: 5, frames: 4, fps: 14, loop: false },
    roundhouse: { row: 6, frames: 9, fps: 16, loop: false },
    beret: { row: 7, frames: 11, fps: 9, loop: false },
    hairDown: { row: 8, frames: 6, fps: 8, loop: true },
    dash: { row: 9, frames: 9, fps: 14, loop: false },
    point: { row: 10, frames: 3, fps: 5, loop: false },
    radio: { row: 11, frames: 4, fps: 4, loop: false },
    shoot: { row: 12, frames: 23, fps: 16, loop: false },
  },
};
