// the box straight off the shelf in the movie: cream card, red print, and the willow branch beside it
export const BOX_RED = "#d9262b";
export const BOX_RED_DARK = "#9e1a1f";
export const BOX_CREAM = "#f4e2c8";

// the willow itself, a thin crooked branch with a knot or two and a twig sprouting fresh leaves at each end
export const TWIG_PALETTE = { K: "#2e1a0e", B: "#96683e", b: "#b08050", h: "#d2aa76", d: "#684224", G: "#7ec45a", g: "#468a3a" };
const TWIG_ROWS = [
  "..........gg..................................gg......",
  ".........gGGg................................gGGg.....",
  "..........gKK...............................KKg.......",
  "...........KbK.............................KbK........",
  "............KbK...........................KbK.........",
  ".............KbK.......KKKKKKKKKKKKKKKKKKKbKKKKKK.....",
  "..............KbKKKKKKKhhhhhhhhhhhhhhhhhhbBhhhhhhKKK..",
  "..KKKKKKKKKKKKKbBhhhhhhBBBBBdBBBBBBBBBBBBBBBBBBBBBBhK.",
  ".KhhhhhhhhhhhhhhBBBBBBBddddddddddddddddddddddddddddBBK",
  "KBBBBBdBBBBBBBBBBBBBBBKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.",
  "KdddddddddddddddddddddK...............................",
  ".KKKKKKKKKKKKKKKKKKKKK................................",
];
// where the branch breaks, so each half is just its side of the same rows
const SNAP_COLUMN = 27;
export const TWIG_HALVES = [
  { side: -1, rows: TWIG_ROWS.map((row) => row.slice(0, SNAP_COLUMN)) },
  { side: 1, rows: TWIG_ROWS.map((row) => row.slice(SNAP_COLUMN)) },
];

// the boy and the girl smiling on the box art, drawn in the same red line as the print
export const FACE_PALETTE = { R: BOX_RED };
export const BOY_ROWS = [
  "..RRRRRR..",
  ".RR.RR.RR.",
  "R........R",
  "R.RR..RR.R",
  "R........R",
  "R...RR...R",
  "R.R....R.R",
  ".R.RRRR.R.",
  "..R....R..",
  "...RRRR...",
];
export const GIRL_ROWS = [
  "..RRRRRR..",
  ".RRRRRRRR.",
  "RRR....RRR",
  "RR.R..R.RR",
  "RR......RR",
  "RR..RR..RR",
  "RR.R..R.RR",
  ".R..RR..R.",
  "..R....R..",
  "...RRRR...",
];
