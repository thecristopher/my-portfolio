// the overworld's own pixel art, one character per pixel so a tweak is just editing text. "." is see through

const CHEST_PALETTE = {
  K: "#2a170c", // outline
  W: "#a8652f", // wood
  w: "#743f1b", // wood shadow
  G: "#f5c84c", // gold band
  g: "#b98a2c", // gold shadow
  L: "#fff3c4", // lock shine
  d: "#1c0f07", // inside the chest
  Y: "#fff1a8", // the light inside
};

/** A treasure chest with its lid shut, padded at the top so it lines up with the open one. */
export const CHEST_CLOSED = {
  palette: CHEST_PALETTE,
  rows: [
    "................",
    "................",
    "..KKKKKKKKKKKK..",
    ".KWWWGWWWWGWWWK.",
    "KWWWWGWWWWGWWWWK",
    "KwWWWGWWWWGWWWwK",
    "KGGGGGGGGGGGGGGK",
    "KgggggKLLKgggggK",
    "KwWWWGKLLKGWWWwK",
    "KWWWWGKKKKGWWWWK",
    "KWWWWGWWWWGWWWWK",
    "KwWWWGWWWWGWWWwK",
    "KwwwwGwwwwGwwwwK",
    "KGGGGGGGGGGGGGGK",
    "KKKKKKKKKKKKKKKK",
  ],
};

/** The same chest with its lid thrown back and the light spilling out. */
export const CHEST_OPEN = {
  palette: CHEST_PALETTE,
  rows: [
    "..KKKKKKKKKKKK..",
    ".KwWWGWWWWGWWwK.",
    ".KWWWGWWWWGWWWK.",
    ".KGGGGGGGGGGGGK.",
    "KKKKKKKKKKKKKKKK",
    "KddddddddddddddK",
    "KdYYYYYYYYYYYYdK",
    "KgggggKLLKgggggK",
    "KwWWWGKLLKGWWWwK",
    "KWWWWGKKKKGWWWWK",
    "KWWWWGWWWWGWWWWK",
    "KwWWWGWWWWGWWWwK",
    "KwwwwGwwwwGwwwwK",
    "KGGGGGGGGGGGGGGK",
    "KKKKKKKKKKKKKKKK",
  ],
};

/** The prize held over Link's head: a gold star. */
export const PRIZE_STAR = {
  palette: { K: "#7a4b00", Y: "#ffd23f", W: "#fff8d6" },
  rows: [
    "....K....",
    "...KYK...",
    "KKKYYYKKK",
    "KYYYWYYYK",
    ".KYYYYYK.",
    "..KYYYK..",
    ".KYYKYYK.",
    "KYYK.KYYK",
    "KKK...KKK",
  ],
};

/** A four point twinkle for the sparkles around a find. */
export const TWINKLE = {
  palette: { W: "#ffffff", Y: "#fff1a8" },
  rows: ["..W..", "..Y..", "WYWYW", "..Y..", "..W.."],
};

/** A beach palm, its trunk leaning a little. */
export const PALM = {
  palette: { G: "#2f9e44", g: "#1f7a33", T: "#9a6332", t: "#6a4220" },
  rows: [
    "...GGGGG...",
    ".GGGgGgGGG.",
    "GGg..T..gGG",
    "Gg..GTG..gG",
    "G..G.T.G..G",
    "...G.T.G...",
    ".....Tt....",
    "......T....",
    "......Tt...",
    "......T....",
    "......Tt...",
    ".....tT....",
    ".....T.....",
    ".....Tt....",
    ".....T.....",
    "....tT.....",
    "....T......",
    "....Tt.....",
    "....T......",
    "...tTt.....",
  ],
};

/** A round city tree. */
export const TREE = {
  palette: { G: "#3fa34d", g: "#2b7a37", h: "#7fd17f", T: "#7a4a24" },
  rows: [
    "...GGGG...",
    ".GGhhGGGG.",
    "GGhhGGGGgG",
    "GGhGGGGGgG",
    "GGGGGGGggG",
    ".GGGGGggG.",
    "..GgggGg..",
    "....TT....",
    "....TT....",
    "....TT....",
    "...TTTT...",
  ],
};

/** A street lamp outside the offices. */
export const LAMP = {
  palette: { K: "#2b3340", L: "#fff1a8", s: "#5a6676" },
  rows: [".KKK.", "KLLLK", ".KsK.", "..s..", "..s..", "..s..", "..s..", "..s..", "..s..", "..s..", "..s..", ".sss.", "sssss"],
};

/** A fluffy cloud. */
export const CLOUD = {
  palette: { W: "#ffffff", w: "#d9e6f5" },
  rows: ["......WWWW..........", "...WWWWWWWWW..WWW...", ".WWWWWWWWWWWWWWWWWW.", "WWWWWWWWWWWWWWWWWWWW", "wwwwwwwwwwwwwwwwwwww", "..wwwwwwwwwwwwwwww.."],
};

/** The sun by day and the moon by night share a shape. */
export const SKY_DISC = {
  rows: ["...XXXX...", ".XXXXXXXX.", ".XXXXXXXX.", "XXXXXXXXXX", "XXXXXXXXXX", "XXXXXXXXXX", "XXXXXXXXXX", ".XXXXXXXX.", ".XXXXXXXX.", "...XXXX..."],
};

/** Colors of the scene, shared by the layers drawn in code. */
export const SCENE = {
  ridge: "#7f9bd1",
  ridgeTop: "#a9bfe6",
  sea: "#2f7fc8",
  seaDeep: "#24639f",
  crest: "#cfeeff",
  sand: "#e9c47c",
  sandDot: "#c9a057",
  grass: "#4fae4f",
  grassDot: "#3a8d3c",
  stone: "#a3abb5",
  stoneDot: "#7e8794",
  edge: "#2a2f3a",
  house: "#f3d2a6",
  roof: "#c8553d",
  block: "#b9c3ce",
  blockTop: "#97a5b5",
  tower: "#7f93ab",
  towerTop: "#5f7390",
};
