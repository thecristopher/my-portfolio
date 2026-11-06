import samusAtlas from "../../assets/sprites/samus.png";
import samusShot from "../../assets/sprites/samus-shot.png";
import zeroSuitAtlas from "../../assets/sprites/zero-suit.png";
import gunship from "../../assets/sprites/gunship.png";

// one animation per row, every frame in a cell of the same size, feet resting on the cell's floor and lined up so she
// doesn't jitter. the frames face right, a sprite facing left is drawn mirrored

/** Samus Aran in the Power Suit, from Metroid. */
export const SAMUS = {
  src: samusAtlas,
  cell: { width: 62, height: 76 },
  columns: 6,
  animations: {
    idle: { row: 0, frames: 6, fps: 8, loop: true },
    run: { row: 1, frames: 6, fps: 14, loop: true },
    aim: { row: 2, frames: 6, fps: 8, loop: true },
    aimDiagonal: { row: 3, frames: 2, fps: 4, loop: true },
    aimUp: { row: 4, frames: 2, fps: 4, loop: true },
    morph: { row: 5, frames: 4, fps: 12, loop: true },
  },
  // where the arm cannon ends on each aiming pose, in sprite px from the cell's top left
  muzzles: {
    aim: { x: 58, y: 35 },
    aimDiagonal: { x: 59, y: 8 },
    aimUp: { x: 45, y: 0 },
  },
};

/** Samus out of the suit, in the Zero Suit: hands on her hips after a win, and curled mid flip as she leaps. */
export const ZERO_SUIT = {
  src: zeroSuitAtlas,
  cell: { width: 38, height: 57 },
  columns: 1,
  animations: {
    victory: { row: 0, frames: 1, fps: 1, loop: true },
    leap: { row: 1, frames: 1, fps: 1, loop: true },
  },
};

/** Her charge shot, flying to the right. */
export const SAMUS_SHOT = { src: samusShot, width: 33, height: 13 };

/** Her gunship, seen from the front. */
export const GUNSHIP = { src: gunship, width: 92, height: 40 };
