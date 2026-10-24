import { triangleRows, triforceRows } from "./helpers";

export const ZELDA_GOLD = "#e8c35a";
export const TRIFORCE_PALETTE = { K: "#6b4a12", h: "#fff2b0", G: ZELDA_GOLD, s: "#b8892a" };

// one piece on a 16 pixel grid, and the three of them stacked into the whole thing
export const PIECE_ROWS = triangleRows(16, 16);
export const TRIFORCE_ROWS = triforceRows(PIECE_ROWS);
