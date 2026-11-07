import metroidAtlas from "../../assets/sprites/metroid.png";

// one animation per row, every frame in a cell of the same size

/** A Metroid larva from Super Metroid: its inner body pulsing under the hull, and the hull flickering away when hurt. */
export const METROID = {
  src: metroidAtlas,
  cell: { width: 38, height: 35 },
  columns: 4,
  animations: {
    pulse: { row: 0, frames: 4, fps: 8, loop: true },
    hurt: { row: 1, frames: 4, fps: 14, loop: true },
  },
};
