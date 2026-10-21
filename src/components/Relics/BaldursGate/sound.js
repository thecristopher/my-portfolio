// Baldur's Gate 3: the die leaves the hand with a whoosh and clatters across the table. each knock comes a little
// later and a little softer than the last, the way a die runs out of steam
export const sound = {
  wave: "triangle",
  volume: 0.06,
  notes: [[-33, 0.02, 0.18, { wave: "sine", slideTo: -40, volume: 0.12 }]],
  noises: [
    [0, 0.2, { filter: "bandpass", frequency: 700, sweepTo: 2600, volume: 0.18 }],
    ...[0.2, 0.29, 0.4, 0.54, 0.72, 0.94, 1.18, 1.36].map((start, index) => [
      start,
      0.04,
      { filter: "bandpass", frequency: 1900 - index * 140, volume: 0.55 - index * 0.05 },
    ]),
  ],
};

// a harp sweeping up a major chord, string by string
const harpSweep = (semitones, { volume = 0.07, gap = 0.055 } = {}) =>
  semitones.map((note, index) => [note, index * gap, 1.6 - index * 0.08, { attack: 0.006, volume }]);

const success = {
  wave: "triangle",
  volume: 0.07,
  notes: [...harpSweep([-19, -12, -7, -3, 0, 5, 9, 12]), [-31, 0, 1.6, { wave: "sine", volume: 0.12 }]],
};

// a natural 20: the same harp, a higher shimmer on top and a low swell under it
const critical = {
  wave: "triangle",
  volume: 0.07,
  notes: [
    ...harpSweep([-19, -12, -7, -3, 0, 5, 9, 12, 17, 21]),
    [-31, 0, 2, { wave: "sine", volume: 0.14, attack: 0.15 }],
    [24, 0.6, 1.2, { wave: "sine", volume: 0.03 }],
    [29, 0.7, 1.1, { wave: "sine", volume: 0.03 }],
    [33, 0.8, 1.2, { wave: "sine", volume: 0.03 }],
  ],
  noises: [[0.5, 1.2, { filter: "highpass", frequency: 6000, volume: 0.05 }]],
};

// a low muted minor chord that sags, like the table went quiet
const failure = {
  wave: "sine",
  volume: 0.08,
  notes: [
    [-31, 0, 1.1, { wave: "triangle", slideTo: -32 }],
    [-28, 0.02, 1, { slideTo: -29 }],
    [-24, 0.04, 0.9, { slideTo: -25, volume: 0.05 }],
  ],
  noises: [[0, 0.12, { filter: "lowpass", frequency: 300, volume: 0.35 }]],
};

// a natural 1: the die cracks, then the chord falls further
const fumble = {
  wave: "sine",
  volume: 0.09,
  notes: [
    [-31, 0.1, 1.4, { wave: "triangle", slideTo: -36 }],
    [-28, 0.12, 1.3, { slideTo: -33 }],
    [-25, 0.14, 1.2, { slideTo: -30, volume: 0.05 }],
  ],
  noises: [
    [0, 0.08, { filter: "highpass", frequency: 2500, volume: 0.4 }],
    [0.04, 0.3, { filter: "lowpass", frequency: 400, sweepTo: 80, volume: 0.4 }],
  ],
};

// what plays once the die settles, keyed by the verdict's tone
export const VERDICT_SOUNDS = { critical, success, failure, fumble };
