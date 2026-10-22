// Obsession: a music box twinkle while the wish is made, the dry crack of the willow snapping, then a warm chord
// that hangs a little longer than it should
export const sound = {
  wave: "sine",
  volume: 0.05,
  notes: [
    [19, 0.1, 0.5],
    [24, 0.4, 0.5],
    [27, 0.7, 0.5],
    [31, 1, 0.6],
    [26, 1.4, 0.8, { volume: 0.035 }],
    [-17, 2.75, 0.25, { wave: "triangle", slideTo: -29, volume: 0.18 }],
    [-12, 3.2, 2.2, { attack: 0.4 }],
    [-8, 3.24, 2.2, { attack: 0.4 }],
    [-5, 3.28, 2.2, { attack: 0.4 }],
    [0, 3.32, 2.4, { attack: 0.5, volume: 0.035 }],
    [-5.15, 3.28, 2.2, { attack: 0.4, volume: 0.02, wave: "triangle" }],
  ],
  noises: [
    [2.1, 0.6, { filter: "bandpass", frequency: 1200, sweepTo: 5000, volume: 0.05 }],
    [2.7, 0.05, { filter: "highpass", frequency: 2500, volume: 0.45 }],
    [2.74, 0.08, { filter: "lowpass", frequency: 900, volume: 0.3 }],
  ],
};
