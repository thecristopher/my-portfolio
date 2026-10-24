import { leanRows, turnRows } from "./helpers";

export const POKE_RED = "#e3350d";

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

// a Poké Ball on the same grid as the avatar: dark outline, three reds with a shine on top, two whites underneath
export const BALL_PALETTE = { K: "#202020", h: "#ff8a6a", R: POKE_RED, r: "#a8240a", W: "#f8f8f8", w: "#b8b8c8" };

export const POKE_BALL = [
  ".....KKKKKK.....",
  "...KKRRRRRRKK...",
  "..KRhhRRRRRRrK..",
  ".KRhhRRRRRRRRrK.",
  ".KRhRRRRRRRRRrK.",
  "KRRRRRRRRRRRRRrK",
  "KrrrrKKKKKKrrrrK",
  "KKKKKKWWWwKKKKKK",
  "KKKKKKWwwwKKKKKK",
  "KWWWWKKKKKKWWwwK",
  "KWWWWWWWWWWWWwwK",
  ".KWWWWWWWWWWwwK.",
  ".KWWWWWWWWWwwwK.",
  "..KwWWWWWWwwwK..",
  "...KKwwwwwwKK...",
  ".....KKKKKK.....",
];

// how far the ball tips while it wobbles. every frame gets the same padding so swapping them never shifts the ball
const LEAN = 3;
const padded = (rows) => rows.map((row) => `${".".repeat(LEAN)}${row}${".".repeat(LEAN)}`);
const QUARTER = turnRows(POKE_BALL);
const HALF = turnRows(QUARTER);

// every pose the ball takes: the four quarter turns of the spin and the two tips of the wobble
export const BALL_FRAMES = {
  up: padded(POKE_BALL),
  right: padded(QUARTER),
  down: padded(HALF),
  left: padded(turnRows(HALF)),
  leanLeft: leanRows(POKE_BALL, -LEAN),
  leanRight: leanRows(POKE_BALL, LEAN),
};

// the little stars that pop off the ball when the catch locks
export const STAR_PALETTE = { K: "#202020", W: "#fffbe0", Y: "#ffd84a", y: "#d89a20" };

export const CATCH_STAR = [
  "....K....",
  "...KYK...",
  "KKKKYKKKK",
  "KYYYWYYyK",
  ".KYYYYyK.",
  "..KYYyK..",
  ".KYyKyyK.",
  ".KyK.KyK.",
  ".KK...KK.",
];

// the grass battle platform, a flat oval with a darker rim underneath
export const PLATFORM_PALETTE = { K: "#3a6a28", G: "#a8e070", g: "#78b850" };
