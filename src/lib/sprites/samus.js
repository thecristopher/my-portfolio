import samusAtlas from "../../assets/sprites/samus.png";
import samusShot from "../../assets/sprites/samus-shot.png";
import zeroSuitAtlas from "../../assets/sprites/zero-suit.png";
import gunship from "../../assets/sprites/gunship.png";

// one animation per row, every frame in a cell of the same size, feet resting on the cell's floor and lined up so she
// doesn't jitter. the frames face right, a sprite facing left is drawn mirrored

/** Samus Aran in the Power Suit, from Super Metroid: the hunter. Small, so she's drawn at whole multiples only. */
export const SAMUS = {
  src: samusAtlas,
  cell: { width: 45, height: 53 },
  columns: 10,
  animations: {
    idle: { row: 0, frames: 1, fps: 1, loop: true },
    run: { row: 1, frames: 10, fps: 16, loop: true },
    aim: { row: 2, frames: 1, fps: 1, loop: true },
    aimDiagonal: { row: 3, frames: 1, fps: 1, loop: true },
    aimUp: { row: 4, frames: 1, fps: 1, loop: true },
    fire: { row: 5, frames: 1, fps: 1, loop: true },
    fireDiagonal: { row: 6, frames: 1, fps: 1, loop: true },
    fireUp: { row: 7, frames: 1, fps: 1, loop: true },
    morph: { row: 8, frames: 8, fps: 14, loop: true },
    forward: { row: 9, frames: 1, fps: 1, loop: true },
  },
  // where the arm cannon ends on each aiming pose, in sprite px from the cell's top left. firing keeps the same aim
  muzzles: {
    aim: { x: 35, y: 23 },
    aimDiagonal: { x: 30, y: 11 },
    aimUp: { x: 21, y: 8 },
  },
};

/**
 * Samus out of the suit, in the Zero Suit, for the end of the hunt: standing, spinning her pistol in victory, and
 * flipping aboard her ship.
 */
export const ZERO_SUIT = {
  src: zeroSuitAtlas,
  cell: { width: 53, height: 91 },
  columns: 8,
  animations: {
    idle: { row: 0, frames: 8, fps: 8, loop: true },
    victory: { row: 1, frames: 2, fps: 3, loop: true },
    flip: { row: 2, frames: 3, fps: 12, loop: true },
  },
};

/** A shot from her arm cannon, flying to the right. */
export const SAMUS_SHOT = { src: samusShot, width: 16, height: 8 };

/** Her gunship, seen from the front. */
export const GUNSHIP = { src: gunship, width: 92, height: 40 };
