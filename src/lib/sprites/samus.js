import samusAtlas from "../../assets/sprites/samus.png";
import samusShot from "../../assets/sprites/samus-shot.png";
import gunship from "../../assets/sprites/gunship.png";

// one animation per row, every frame in a cell of the same size and facing right, a sprite facing left is drawn
// mirrored. every frame was cut so the same point of her lands on the cell's anchor: the helmet and the feet when she
// stands, runs or jumps, the middle of her body when she spins and the floor under the ball when she rolls. that's what
// keeps her from jittering from one frame to the next

/**
 * Samus Aran in the Power Suit, from Super Metroid. Small, so she's drawn at whole multiples only. Animations with a
 * stride play by how far she travels, one frame every stride sprite px, so her feet and the ball never skate.
 */
export const SAMUS = {
  src: samusAtlas,
  cell: { width: 38, height: 48 },
  columns: 10,
  // the point of the cell that sits on her spot on the ground, in sprite px from the cell's top left
  anchor: { x: 21, y: 47 },
  animations: {
    forward: { row: 0, frames: 4, fps: 3, loop: true },
    aim: { row: 1, frames: 1, fps: 1, loop: true },
    aimDiagonal: { row: 2, frames: 1, fps: 1, loop: true },
    aimUp: { row: 3, frames: 1, fps: 1, loop: true },
    run: { row: 4, frames: 10, stride: 4.5, loop: true },
    runAim: { row: 5, frames: 10, stride: 4.5, loop: true },
    runDiagonal: { row: 6, frames: 10, stride: 4.5, loop: true },
    jump: { row: 7, frames: 1, fps: 1, loop: true },
    jumpDiagonal: { row: 8, frames: 1, fps: 1, loop: true },
    jumpUp: { row: 9, frames: 1, fps: 1, loop: true },
    land: { row: 10, frames: 3, fps: 14, loop: false },
    somersault: { row: 11, frames: 8, fps: 20, loop: true },
    spaceJump: { row: 12, frames: 8, fps: 24, loop: true },
    screwAttack: { row: 13, frames: 8, fps: 28, loop: true },
    curl: { row: 14, frames: 1, fps: 1, loop: true },
    morph: { row: 15, frames: 8, stride: 6, loop: true },
  },
  // where the arm cannon ends on each aiming pose, in sprite px from the cell's top left. running and firing keep the
  // same aim, so they share these
  muzzles: {
    aim: { x: 37, y: 19 },
    aimDiagonal: { x: 34, y: 7 },
    aimUp: { x: 25, y: 4 },
    jump: { x: 35, y: 19 },
    jumpDiagonal: { x: 34, y: 4 },
    jumpUp: { x: 25, y: 0 },
  },
};

/** A shot from her arm cannon, flying to the right. */
export const SAMUS_SHOT = { src: samusShot, width: 16, height: 8 };

/** Her gunship, seen from the front. */
export const GUNSHIP = { src: gunship, width: 92, height: 40 };
