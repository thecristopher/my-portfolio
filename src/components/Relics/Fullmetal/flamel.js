export const ALCHEMY_BLUE = "#4fa8ff";
export const FLAMEL_RED = "#d7263d";
export const CHALK = "#ece8dc";

// Ed's coat emblem on a 100 by 120 grid: the cross, the crown on top, the wings, and the serpent coiled up the post
export const FLAMEL = {
  cross: ["M47 20 H53 V112 H47 Z", "M36 46 H64 V51 H36 Z"],
  crown: "M38 19 L38 8 L43 13 L46.5 4 L50 11 L53.5 4 L57 13 L62 8 L62 19 Z",
  // only the left wing is drawn, the right one is the same path mirrored across the post
  wing: "M47 30 C38 20 22 15 4 16 C9 19 11 21 13 23 C8 24 6 25 4 28 C10 29 13 30 15 31 C10 33 8 35 7 38 C14 38 19 38 23 39 C20 41 19 43 19 46 C29 44 38 40 47 37 Z",
  serpent: "M50 108 C32 103 32 93 50 89 C68 85 68 75 50 71 C32 67 32 57 50 53 C64 50 67 42 60 35",
  serpentHead: "M57 36 C58 31 63 29 66 31 C67 34 64 37 60 37 Z",
};
