import { SIGNAL_YELLOW } from "./helpers";

// the signal's colors, shared by the emblem on the page and the one on the clouds
export const SIGNAL_PALETTE = { K: "#0b1622", o: "#d99a1e", Y: SIGNAL_YELLOW, y: "#fff6c8", B: "#0a0a0d" };

// the Arkham bat as pixels: wide wings that hook up into horns, square ears and two scallops a side
export const BAT_ROWS = [
  "......BB.......B..B.......BB......",
  "....BBBB.......B..B.......BBBB....",
  "...BBBBB.......B..B.......BBBBB...",
  "..BBBBBBBB....BBBBBB....BBBBBBBB..",
  ".BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB.",
  "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
  "B..BBBBBBBBBBBBBBBBBBBBBBBBBBBB..B",
  "....B..BBBBBBBBBBBBBBBBBBBB..B....",
  "........B..BBBBBBBBBBBB..B........",
  ".............BBBBBBBB.............",
  "...............BBBB...............",
  "................BB................",
];

// the same bat squeezed down for the statusline, where every pixel has to earn its place
export const SMALL_BAT_ROWS = [
  "......B..B......",
  "..BB..BBBB..BB..",
  ".BBBBBBBBBBBBBB.",
  "BBBBBBBBBBBBBBBB",
  "..B.BBBBBBBB.B..",
  "......BBBB......",
  ".......BB.......",
];

// heavy clouds low over the city, lit a little on top by the glow of Gotham
export const CLOUD_ROWS = [
  "..........llll..............",
  ".......lllCCCCll......lll...",
  ".....llCCCCCCCCCll..llCCCl..",
  "...llCCCCCCCCCCCCCllCCCCCCl.",
  "..lCCCCCCCCCCCCCCCCCCCCCCCCl",
  ".lCCCCCCCCCCCCCCCCCCCCCCCCCC",
  "lCCCCCCCCCCCCCCCCCCCCCCCCCCd",
  "dddddddddddddddddddddddddddd",
];

// the bolt that splits the sky right before the signal goes on
export const BOLT_ROWS = [
  ".......KWK",
  "......KWWK",
  "......KWK.",
  ".....KWWK.",
  ".....KWK..",
  "....KWWK..",
  "....KWWKK.",
  "...KWWWWWK",
  "...KKKWWK.",
  ".....KWK..",
  "....KWWK..",
  "....KWK...",
  "...KWWK...",
  "...KWWKK..",
  "..KWWWWWK.",
  "..KKKWWK..",
  "....KWK...",
  "...KWWK...",
  "...KWK....",
  "..KWWK....",
  "..KWK.....",
  ".KWK......",
  ".KK.......",
];

// the searchlight on the GCPD roof, lens up and burning
export const LAMP_ROWS = [
  "..KKKKKKKKKK..",
  ".KyyyyyyyyyyK.",
  ".KMMMMMMMMMMK.",
  ".KMmmmmmmmmMK.",
  ".KMmmmmmmmmMK.",
  ".KMMMMMMMMMMK.",
  "..KKKKKKKKKK..",
  "....KMK.KMK...",
  "...KMK...KMK..",
  "..KMK.....KMK.",
  "..KK.......KK.",
];

// the GCPD tower the signal is lit from, its roof railing on top and a few floors still working late
export const GCPD_ROWS = [
  "..bbbbbbbbbbbbbbbbbbbbbbb..",
  "..b...b...b...b...b...b.b..",
  "..b...b...b...b...b...b.b..",
  "..b...b...b...b...b...b.b..",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBwwwBBBbbbBBBwwwBBBbbbBBb",
  "bBBwwwBBBbbbBBBwwwBBBbbbBBb",
  "bBBwwwBBBbbbBBBwwwBBBbbbBBb",
  "bBBwwwBBBbbbBBBwwwBBBbbbBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBbbbBBBwwwBBBbbbBBBbbbBBb",
  "bBBbbbBBBwwwBBBbbbBBBbbbBBb",
  "bBBbbbBBBwwwBBBbbbBBBbbbBBb",
  "bBBbbbBBBwwwBBBbbbBBBbbbBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBwwwBBBbbbBBBbbbBBBwwwBBb",
  "bBBwwwBBBbbbBBBbbbBBBwwwBBb",
  "bBBwwwBBBbbbBBBbbbBBBwwwBBb",
  "bBBwwwBBBbbbBBBbbbBBBwwwBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBbbbBBBbbbBBBbbbBBBbbbBBb",
  "bBBbbbBBBbbbBBBbbbBBBbbbBBb",
  "bBBbbbBBBbbbBBBbbbBBBbbbBBb",
  "bBBbbbBBBbbbBBBbbbBBBbbbBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bBBBBBBBBBBBBBBBBBBBBBBBBBb",
];

// one corner of the lock on box, drawn for the top left and flipped for the rest
export const RETICLE_ROWS = ["KKKKKKK", "KOOOOOK", "KOKKKKK", "KOK....", "KOK....", "KOK....", "KKK...."];
