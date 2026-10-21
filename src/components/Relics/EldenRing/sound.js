// Elden Ring: a low cello figure in the game's dark minor, then it opens up into the golden choir chord
// a site of grace rings out with when you touch it
export const sound = {
  wave: "sine",
  volume: 0.06,
  notes: [
    [-24, 0.1, 0.35, { wave: "triangle", volume: 0.14 }],
    [-24, 0.48, 0.12, { wave: "triangle", volume: 0.14 }],
    [-21, 0.62, 0.12, { wave: "triangle", volume: 0.14 }],
    [-17, 0.76, 0.5, { wave: "triangle", volume: 0.14 }],
    [-33, 0.9, 1.9, { volume: 0.16, slideTo: -36 }],
    [-9, 1, 1.85, { attack: 0.5 }],
    [-5, 1.03, 1.85, { attack: 0.5 }],
    [-2, 1.06, 1.85, { attack: 0.5 }],
    [3, 1.09, 1.85, { attack: 0.5, volume: 0.04 }],
    [-8.9, 1, 1.85, { attack: 0.5, volume: 0.03, wave: "triangle" }],
    [22, 1.3, 1.1, { volume: 0.035 }],
    [27, 1.42, 1.1, { volume: 0.03 }],
    [31, 1.54, 1.2, { volume: 0.03 }],
  ],
  noises: [[0.8, 0.9, { filter: "bandpass", frequency: 400, sweepTo: 2400, volume: 0.08 }]],
};
