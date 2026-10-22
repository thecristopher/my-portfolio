export const WILLOW_GREEN = "#9ed36a";
export const BARK = "#8b5a2b";
export const BARK_DARK = "#5a3818";
// the retro box art, straight out of a 1980s crystal shop shelf
export const BOX_PINK = "#ff5f9e";
export const BOX_ORANGE = "#ffb35c";
export const BOX_VIOLET = "#7b5cff";

// the twig in a 40 by 14 box, already in the two halves it breaks into. the snap happens at x 20
export const SNAP_POINT = { x: 20, y: 7.5 };
export const TWIG_HALVES = [
  {
    side: -1,
    stem: "M2 9 Q8 7.5 13 8 T20 7.5",
    fork: "M11 8 Q13 4.5 16 3.5",
    leaf: "M16 3.5 q2.5 -1.5 4 0.5 q-2.5 1 -4 -0.5z",
  },
  {
    side: 1,
    stem: "M20 7.5 Q26 7 31 8.5 T38 7",
    fork: "M27 7.6 Q29 10.5 31.5 11.5",
    leaf: "M31.5 11.5 q1 2.5 3.5 2 q-1 -2.2 -3.5 -2z",
  },
];
