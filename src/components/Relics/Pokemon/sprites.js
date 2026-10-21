export const POKE_RED = "#e3350d";

// the two greens of the tall grass on the Hoenn routes
export const GRASS_PALETTE = { d: "#2f7a32", l: "#7cc85a" };

// one 16 pixel tile of tall grass, two tufts with dark blade outlines over a light fill
export const GRASS_TILE = [
  "...d.......d....",
  "..dld.....dld...",
  "..dld..d..dld..d",
  ".dlld.dld.dlld.d",
  ".dlldddlddllldld",
  "dllllldllllllldl",
  "dlllllllllllllll",
  "llldllllllldllll",
];

// the trainer as seen from behind in a Gen 3 battle: red cap, brown hair, a jacket and the backpack straps
export const TRAINER_PALETTE = {
  K: "#202020",
  R: "#e3350d",
  r: "#a8240a",
  W: "#f8f8f8",
  H: "#4e3626",
  S: "#f0b48c",
  J: "#3a6ea5",
  j: "#27507c",
  B: "#d8a040",
  b: "#a06a20",
};

export const TRAINER_BACK = [
  "......KKKK......",
  "....KKRRRRKK....",
  "...KRRRRRRRRK...",
  "..KRRRRWWRRRRK..",
  "..KRRRRRRRRRRK..",
  "..KrrrrrrrrrrK..",
  "..KHHHHHHHHHHK..",
  "..KHHHHHHHHHHK..",
  "...KSHHHHHHSK...",
  "....KSSSSSSK....",
  "..KKJJJJJJJJKK..",
  ".KJJJBJJJJBJJJK.",
  "KJJJJBJJJJBJJJJK",
  "KJJJBBBBBBBBJJJK",
  "KjjJBbbbbbbBJjjK",
  "KjjjBBBBBBBBjjjK",
];

// a Poké Ball drawn on the same pixel grid as everything else in the battle
export const BALL_PALETTE = { K: "#202020", R: POKE_RED, W: "#f8f8f8", w: "#c8c8c8" };

export const POKE_BALL = [
  "..KKKKK..",
  ".KRRRRRK.",
  "KRWRRRRRK",
  "KRRKKKRRK",
  "KKKKWKKKK",
  "KWWKKKWwK",
  "KWWWWWWwK",
  ".KwWWWwK.",
  "..KKKKK..",
];
