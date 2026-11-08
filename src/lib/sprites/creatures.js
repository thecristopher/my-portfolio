import zombieAtlas from "../../assets/sprites/zombie.png";
import cerberusAtlas from "../../assets/sprites/cerberus.png";
import tyrantAtlas from "../../assets/sprites/tyrant.png";

// what Jill fights, from Marvel vs. Capcom. one animation per row, every frame anchored on the ground
// under the creature. the zombie and the dog face left on their sheets and get mirrored to come at her from the left

/**
 * A zombie: its shamble and its collapse. The shamble covers stride sprite px a frame, so moving it fps times stride
 * px a second keeps its feet from sliding.
 */
export const ZOMBIE = {
  src: zombieAtlas,
  cell: { width: 188, height: 114 },
  columns: 12,
  anchor: { x: 93, y: 113 },
  faces: "left",
  stride: 3.5,
  animations: {
    walk: { row: 0, frames: 12, fps: 10, loop: true },
    fall: { row: 1, frames: 5, fps: 10, loop: false },
  },
};

/** A Cerberus, the zombie dog: its gallop and the yelp as it goes down. Same stride rule as the zombie. */
export const CERBERUS = {
  src: cerberusAtlas,
  cell: { width: 187, height: 83 },
  columns: 5,
  anchor: { x: 88, y: 82 },
  faces: "left",
  stride: 18,
  animations: {
    run: { row: 0, frames: 5, fps: 14, loop: true },
    fall: { row: 1, frames: 5, fps: 12, loop: false },
  },
};

/**
 * The Tyrant: the ground breaking open and him climbing out of it facing right, then his roar, which faces left on the
 * sheet. His anchor is the ground he stands on.
 */
export const TYRANT = {
  src: tyrantAtlas,
  cell: { width: 216, height: 176 },
  columns: 5,
  anchor: { x: 122, y: 163 },
  animations: {
    emerge: { row: 0, frames: 5, fps: 8, loop: false },
    roar: { row: 1, frames: 2, fps: 4, loop: true },
  },
};
