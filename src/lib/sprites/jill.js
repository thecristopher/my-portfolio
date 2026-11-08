import jillAtlas from "../../assets/sprites/jill.png";
import jillRocketAtlas from "../../assets/sprites/jill-rocket.png";
import missileAtlas from "../../assets/sprites/missile.png";
import blastAtlas from "../../assets/sprites/blast.png";
import ecgAtlas from "../../assets/sprites/ecg.png";

// one animation per row, every frame in a cell of the same size. her frames were cut so the middle of her shirt and
// her feet land on the cell's anchor in every one, which keeps her from drifting or floating between frames. she faces
// left, toward whatever comes at her from the left of the page

/** Jill Valentine from Marvel vs. Capcom: her stance, her combo, the handgun and every reaction. */
export const JILL = {
  src: jillAtlas,
  cell: { width: 185, height: 121 },
  columns: 11,
  anchor: { x: 100, y: 120 },
  faces: "left",
  animations: {
    idle: { row: 0, frames: 9, fps: 10, loop: true },
    dash: { row: 1, frames: 5, fps: 9, loop: false },
    punch: { row: 2, frames: 4, fps: 16, loop: false },
    kick: { row: 3, frames: 5, fps: 14, loop: false },
    roundhouse: { row: 4, frames: 10, fps: 16, loop: false },
    shoot: { row: 5, frames: 11, fps: 14, loop: false },
    herb: { row: 6, frames: 11, fps: 8, loop: false },
    point: { row: 7, frames: 3, fps: 5, loop: false },
    radio: { row: 8, frames: 4, fps: 4, loop: false },
    beret: { row: 9, frames: 11, fps: 9, loop: false },
    // only her breathing with the hair down: the frame of it falling loose plays once, at the end of the beret
    hairDown: { row: 10, frames: 5, fps: 6, loop: true },
    happy: { row: 11, frames: 10, fps: 10, loop: false },
    // taking a hit: her head snaps back and she recovers her guard
    hurt: { row: 12, frames: 4, fps: 12, loop: false },
    // out of health: hands up, a stagger and down on the floor, where the last frame holds
    down: { row: 13, frames: 5, fps: 7, loop: false },
  },
};

/**
 * Jill with her rocket launcher, in its own bigger cells: pulling it off her back and hoisting it overhead, then down
 * onto her shoulder to aim. Same anchor point on her as her main sheet, so switching sheets never moves her.
 */
export const JILL_ROCKET = {
  src: jillRocketAtlas,
  cell: { width: 164, height: 161 },
  columns: 8,
  anchor: { x: 88, y: 160 },
  faces: "left",
  animations: {
    rocketRaise: { row: 0, frames: 8, fps: 10, loop: false },
    rocketAim: { row: 1, frames: 3, fps: 6, loop: false },
  },
  // where the rocket leaves the launcher on the aiming frames, in sprite px from the cell's top left
  muzzle: { x: 8, y: 79 },
};

/** Her rocket in flight, nose to the left, and the flash it leaves the launcher with. */
export const MISSILE = {
  src: missileAtlas,
  cell: { width: 80, height: 65 },
  columns: 1,
  anchor: { x: 39, y: 34 },
  faces: "left",
  animations: {
    fly: { row: 0, frames: 1, fps: 1, loop: true },
    flash: { row: 1, frames: 1, fps: 1, loop: true },
  },
};

/** The explosion where the rocket lands, from the first flash to the last of the smoke. */
export const BLAST = {
  src: blastAtlas,
  cell: { width: 122, height: 96 },
  columns: 13,
  anchor: { x: 60, y: 50 },
  animations: {
    explode: { row: 0, frames: 13, fps: 16, loop: false },
  },
};

/** The ECG health monitor from the original Resident Evil: the heartbeat sweeping by while she's fine, and the warnings. */
export const ECG = {
  src: ecgAtlas,
  cell: { width: 67, height: 39 },
  columns: 24,
  animations: {
    fine: { row: 0, frames: 24, fps: 12, loop: true },
    caution: { row: 1, frames: 1, fps: 1, loop: true },
    danger: { row: 2, frames: 1, fps: 1, loop: true },
  },
};
