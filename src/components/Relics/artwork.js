import { polygonPoints, wedgePath } from "./actions";

// the shapes and colors every emblem is drawn from, shared by the emblems on the page and the moments that draw them large

export const POKE_RED = "#e3350d";

export const FLAMEL_RED = "#d0262f";

// the staff, the crossbar, the serpent winding down it and the crown on top, as strokes so a moment can draw them
export const FLAMEL_STROKES = ["M32 12V58", "M21 22H43", "M25 31C38 29 41 38 32 40S23 49 38 50", "M26 12l3-6 3 5 3-5 3 6"];

export const UMBRELLA_RED = "#d62828";

export const UMBRELLA_WEDGES = Array.from({ length: 8 }, (_, index) => ({ d: wedgePath(index, 8, 28), fill: index % 2 === 0 ? UMBRELLA_RED : "#f4f4f4" }));

export const PUZZLE_GOLD = "#e8c25a";

export const AIR_ORANGE = "#f5a524";

export const ARROW_BLUE = "#3f8fe8";

export const TRIFORCE_GOLD = "#f2c94c";

export const TRIFORCE_PIECES = ["M32 6L46 30H18Z", "M18 30L32 54H4Z", "M46 30L60 54H32Z"];

export const WATER_BLUE = "#3fa9f5";

export const GRACE_GOLD = "#f5d77a";

// the sigil as strokes: the long stem, the ring and the arcs crossing it, so the moment can draw it in light
export const GRACE_STROKES = ["M32 4V60", "M14 28a18 18 0 1 0 36 0a18 18 0 1 0-36 0", "M20 46C24 32 40 32 44 46", "M20 10C24 24 40 24 44 10"];

export const D20_GOLD = "#d8b25a";

export const D20_OUTLINE = polygonPoints(6, 28, { x: 32, y: 32 });

export const D20_FACE = polygonPoints(3, 16, { x: 32, y: 34 });

// the edges from the front face out to the rim, the lines that make a hexagon read as an icosahedron
export const D20_EDGES = ["M32 18L32 4", "M18.14 42L7.75 46", "M45.86 42L56.25 46", "M32 18L7.75 18", "M32 18L56.25 18", "M18.14 42L32 60", "M45.86 42L32 60", "M18.14 42L7.75 18", "M45.86 42L56.25 18"];

export const WILLOW_RED = "#d9262b";

// the twig in two halves, so it can snap where they meet
export const TWIG_HALVES = [
  { side: -1, d: "M4 38Q18 30 32 34", leaf: "M14 33q-3-8 4-10q1 7-4 10Z" },
  { side: 1, d: "M32 34Q46 37 60 26", leaf: "M48 33q6-6 11-1q-6 5-11 1Z" },
];
