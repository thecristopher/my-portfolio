// Scott Pilgrim style sprite of me, one character per pixel so tweaking it is just editing text
export const AVATAR_PALETTE = {
  K: "#0b1622", // outline
  H: "#32231a", // hair
  h: "#4e3626", // hair highlight
  a: "#22170f", // hair shadow and creases
  S: "#f0b48c", // skin
  s: "#d38a6a", // skin shadow
  B: "#3a281d", // beard
  M: "#9a5a48", // mouth
  G: "#c9963c", // gold glasses
  L: "#cfe3ea", // lens glass
  Y: "#f2f1f1", // eye white
  y: "#f2f1f1", // eye white, turns into the lid when blinking
  E: "#0b1622", // pupil
  e: "#0b1622", // pupil on the lid row
  T: "#dfeef0", // tee
  t: "#a9c6cc", // tee shadow
  u: "#7c9ba3", // tee deep shadow, armpits and hems
  P: "#3d5a80", // jeans
  p: "#283c58", // jeans shadow
  W: "#f2f1f1", // sneakers and teeth
  r: "#e98a7a", // blush when smiling
  q: "#8a95a5", // sneaker shade
};

export const AVATAR_ROWS = [
  "...............................KK..........",
  "............KKKKKKKKKKKKKKKKKKKHHK.........",
  "...........KaHHHHHHHHHHHHHHaaHHHK..........",
  "..........KHHHHHHHHHHHHHHHHHHHHHK..........",
  ".........KHHHHHHHHHHHhhhhhhhhHHaKKK........",
  ".........KHHHhhhHHHHHHHHHHhhhhhhaaHKK......",
  "........KKhhhhhHHHHHHHHHHHHHhhhHHHHHHK.....",
  ".......KHhhhhHHHHHHHHHHHHHhhhhhhHHHHK......",
  ".......KhhhHHHHHHHaHHHaaHHaHHHhhhhHK.......",
  "......KHhhHHHHHHHHKKHHHKaHHKaHHHhhhK.......",
  "......KhhHHHHHaHHKSKaHHKKKKsKKHHHHK........",
  "......KhHHHHHHaHKsSSKHHKSSSSKKHHHHK........",
  "......KHHHHHHHKKKSSSSKaaSSSK.KHHHHHK.......",
  "......KHHHHaHHK..KKsSSSSSSKKKKHHHHHK.......",
  "......KHHHHaHHaKKKKKKsSSSGGGaKHHaHHK.......",
  "......KHHHKKHHaSSGGGGKKGGEEYGKHaKaHK.......",
  ".......KHKSSKHHSGYYYEGKGLYYEEGHK.KK........",
  ".....KKKaSKKGGGGYYYEEEGGLYYEEGaK...........",
  "....KHHHKSSsKKHGyyyeeeGGLyyeeGK............",
  ".....KHHKSSSKSKGYYYEEEGSGLYYGaKKKK.........",
  "......KKKSSSSSSSGYYYLGSSSGGGSKttTTKKKK.....",
  "........KKSSSKssSGGGGSSSSSSSKTTTTKSSSSK....",
  ".......KTTKKKtKKssBBBBBBBBssKTTtKSSasSSK...",
  "......KTTTttttK.KBBBBMMMBBBKKTtKSSaSSSSsK..",
  "......KTTTtttTKK.KKBBBBBBBKKTTTKsaSSSsSSK..",
  ".......KTTTTTTttK.KKKBBBKKTTTTtKKKSSaSSSsK.",
  "......KuuuuuuuKTKKtuuuuKTTTTTTTTKsKaSSSSsK.",
  ".....KsSSSsKuuTTtTttttttTtttuuuTKsaKSSaaKSK",
  "....KsSSSsKTuuTTTTTTTTTTTTttuuuTTKsKKSSKsSK",
  "....KsSSsKKTKTTTTTTTTTTTTtttuuuTuuK..KKsSSK",
  "...KsSSKK..KTTTTTTTTTTTTtTttuuuuuuuKKsSSSSK",
  "...KSSSSsK.KTTTtTTTTTTTtTTttuuKKKKKKsSSSSSK",
  "..KKKasSSK.KTTTTtTTTTTtTTTtttuK....KsSSSSSK",
  ".KSsKaaKKK.KTTTTtTTTTTTTTttttuK...KssSSSSSK",
  "KSSaSSaSSsKKTTTTTTTTTTTTtTtttuK...KsssSSSSK",
  "KSSaSSaSSSsKTTTTTTTTTTTTTTtttuK....KsssSSK.",
  "KSSsSSsSSssKTTTTTTTTTTTTTTttuK......KKKKK..",
  "KSSSSSSSSssKKTTtttTTTTTTTTttuK.............",
  ".KsSSSSSssaKKtttttttttttttttuK.............",
  "..KKKKKKKKK..KTtpPPPttttttKKKK.............",
  "..............KpPPPPpPPpPPK................",
  ".............KPPPPPPPpPpPPPK...............",
  "............KPPPPPPKKKKpPPPPK..............",
  "...........KPPPPPPPpK.KpPPPPPK.............",
  "..........KpPPPPPPpK..KpPPPPPpK............",
  ".........KpPPPPPPpK...KpPPPPPPK............",
  ".........KPPPPPPpK....KpPPPPPPK............",
  ".........KpPPPPpK......KpPPPPPpK...........",
  ".........KppPPppK......KpPPPPPPpK..........",
  "........KpppppppK.......KpPPPPpppK.........",
  "........KpppppppK.......KppppppppK.........",
  "........KpppppppKK......KpppppppppK........",
  "........KppppppKKpK......KpppppppppK.......",
  ".........KppppppppK.......KKKpppppppK......",
  "........KpppppppppK.......KpppppppppK......",
  ".......KppppppppKK........KppppppppppK.....",
  "......KKKKKKpppppK.........KppKKKKKKK......",
  ".....KqWWWqqKKKKppK.........KKqqWWWWqK.....",
  "....KqWWWWWqWqqqKpK.........KqqWWWWWWqK....",
  "....KWWWWWqWWWqqqK.........KqWqWWWWWWWqK...",
  "....KWWWWWqWWWqqK..........KqWqWWWWWWWqK...",
  "....KWWWWWqWWWKK............KWqWWWWWWWqK...",
  ".....KKKKKKKKK...............KKKKKKKKKK....",
];

// the forearm and fist that throw the jab when someone pokes the sprite
export const PUNCH_ARM = { minX: 33, minY: 19, maxY: 37 };

// mid blink the eyes fill with lens glass and the lid row goes dark
export const BLINK_SWAPS = { Y: "L", E: "L", y: "e" };

// the raised fist opens into this hand to say hi, dots keep whatever is underneath
export const WAVE_HAND = {
  left: 31,
  top: 12,
  rows: [
    "......KK....",
    "...KKKSSKKK.",
    "..KSSKSSKSSK",
    "..KSSKSSKSSK",
    "..KSsKSsKSsK",
    "..KSSSSSSSsK",
    "KKKSSSSSSSsK",
    "KSSSSSSSSSsK",
    "KSSSSSSSSSsK",
    ".KKSSSSSSssK",
    "...KSSSSSssK",
    "....KSSSSssK",
    ".....KSSSssK",
    ".....KSSSssK",
    ".....KSSSssK",
    ".....KsSSssK",
    "......KsSSsK",
  ],
};

// the fist gets wiped before the open hand goes on, otherwise knuckles poke out around it
export const FIST = { minX: 33, maxX: 42, minY: 19, maxY: 28 };

// how many rows of the hand are fingers, they swing a pixel further than the palm so the wave tilts
export const WAVE_FINGER_ROWS = 6;

// layers that move on their own so the idle feels alive: head lags the chest, feet stay planted
export const HEAD_UNTIL_ROW = 25;
export const LEGS_FROM_ROW = 39;

// happy face for the wave: eyes squint into arcs behind the lenses, grin with teeth, a little blush
export const SMILE = {
  left: 15,
  top: 15,
  rows: [
    "..........LLL.",
    "..LLLL...LLeLL",
    ".LLeeLL..LeLeL",
    ".LeLLeL..eLLLe",
    ".eLLLLe...LLL.",
    "..LLLL........",
    "rr..........rr",
    "....M.....M...",
    ".....MWWWM....",
    "......MMM.....",
  ],
};

// the near arm's guard drops a pixel when he relaxes to say hi
export const GUARD_ARM = { maxX: 11, minY: 27, maxY: 38 };
