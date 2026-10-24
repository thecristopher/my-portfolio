// the box straight off the shelf in the movie: cream card, red print, a twig of cholla wood beside it
export const BOX_RED = "#d9262b";
export const BOX_RED_DARK = "#9e1a1f";
export const BOX_CREAM = "#f4e2c8";

// the willow itself, a hollow cholla stick: brown wood full of pale holes
export const TWIG_PALETTE = { K: "#22120a", B: "#7a4a2c", b: "#9c6640", d: "#4a2a18", w: "#f0e2ce" };
const TWIG_ROWS = [
  "...KKKKKKKKKKKKKKKKKKKKKKKKKK..",
  "..KbBBwwBBBbBBwwwBBBbBBwBBBbBKK",
  ".KBBdwwwdBBBdBwwdBBBBdwwwdBBBbK",
  "KbBBBddBBBwBBBddBBwwBBBddBBwBBK",
  "KBBwBBBBdwwwdBBBBdwwwBBBBdwwdBK",
  ".KBwwdBBBddBBBwBBBBddBBwBBBdBK.",
  "..KddBBBBBBBdwwdBBBBBBdwwdBKK..",
  "...KKKKKKKKKKKKKKKKKKKKKKKKK...",
];
// where the stick breaks, so each half is just its side of the same rows
const SNAP_COLUMN = 15;
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
