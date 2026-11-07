import zeroSuitAtlas from "../../assets/sprites/zero-suit.png";
import gunship from "../../assets/sprites/gunship.png";

// one animation per row, every frame in a cell of the same size, feet resting on the cell's floor and lined up on the
// legs so she doesn't jitter. the frames face right, a sprite facing left is drawn mirrored

/** Samus Aran in the Zero Suit, from Metroid, with her Paralyzer pistol. */
export const ZERO_SUIT = {
  src: zeroSuitAtlas,
  cell: { width: 84, height: 99 },
  columns: 8,
  animations: {
    idle: { row: 0, frames: 8, fps: 8, loop: true },
    walk: { row: 1, frames: 7, fps: 10, loop: true },
    run: { row: 2, frames: 4, fps: 12, loop: true },
    aim: { row: 3, frames: 1, fps: 1, loop: true },
    shoot: { row: 4, frames: 1, fps: 1, loop: true },
    aimDiagonal: { row: 5, frames: 1, fps: 1, loop: true },
    aimUp: { row: 6, frames: 1, fps: 1, loop: true },
    victory: { row: 7, frames: 2, fps: 3, loop: true },
    flip: { row: 8, frames: 3, fps: 12, loop: true },
  },
  // where the Paralyzer ends on each aiming pose, in sprite px from the cell's top left
  muzzles: {
    aim: { x: 82, y: 43 },
    shoot: { x: 82, y: 34 },
    aimDiagonal: { x: 36, y: 18 },
    aimUp: { x: 24, y: 0 },
  },
};

/** Her gunship, seen from the front. */
export const GUNSHIP = { src: gunship, width: 92, height: 40 };
