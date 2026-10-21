// Pokémon: the wild encounter sting tumbling down while the screen flashes and wipes, a low battle pulse, the
// ball whooshing out and zapping the target in, three wobble clicks, the lock, and the little caught jingle

// four chromatic runs falling a step lower each time, the shape every wild encounter starts with
const ENCOUNTER_RUNS = [0, 1, 2, 3].flatMap((run) =>
  [0, 1, 2, 3].map((step) => [16 - run - step, run * 0.2 + step * 0.05, 0.05])
);

const WOBBLE_CLICKS_AT = [3.46, 3.86, 4.26];
const CAUGHT_JINGLE = [-4, 1, 3, 4, 3, 4, 6];

export const sound = {
  wave: "square",
  volume: 0.04,
  notes: [
    ...ENCOUNTER_RUNS,
    ...[0, 0.2, 0.4, 0.6].map((at) => [-21, at, 0.15, { wave: "triangle", volume: 0.14 }]),
    // the stab as the bars close
    [3, 0.85, 0.3, { volume: 0.05 }],
    [-9, 0.85, 0.3, { wave: "triangle", volume: 0.14 }],
    // battle pulse while the text box talks
    ...[0, 1, 2, 3, 4, 5, 6, 7].map((beat) => [beat % 4 === 3 ? -16 : -21, 1.2 + beat * 0.13, 0.11, { wave: "triangle", volume: 0.1 }]),
    // the throw
    [-5, 2.3, 0.4, { wave: "triangle", slideTo: 7, volume: 0.08 }],
    // the zap, and the target pulled into the ball
    [7, 2.75, 0.12, { slideTo: -12 }],
    [-12, 2.85, 0.25, { wave: "sine", slideTo: 12, volume: 0.08 }],
    [-20, 3.25, 0.04, { wave: "triangle", volume: 0.25 }],
    ...WOBBLE_CLICKS_AT.map((at) => [-8, at, 0.05, { slideTo: -14 }]),
    // the lock
    [-20, 4.65, 0.04, { wave: "triangle", volume: 0.25 }],
    // gotcha
    ...CAUGHT_JINGLE.map((semitones, index) => [semitones, 4.75 + index * 0.11, 0.11]),
    [8, 5.52, 0.5],
    [-11, 4.75, 0.77, { wave: "triangle", volume: 0.12 }],
    [-16, 5.52, 0.5, { wave: "triangle", volume: 0.12 }],
  ],
  noises: [
    [2.3, 0.4, { filter: "bandpass", frequency: 800, sweepTo: 3000, volume: 0.18 }],
    [3.25, 0.03, { filter: "highpass", frequency: 3000, volume: 0.2 }],
    ...WOBBLE_CLICKS_AT.map((at) => [at, 0.03, { filter: "highpass", frequency: 2500, volume: 0.15 }]),
    [4.65, 0.03, { filter: "highpass", frequency: 3000, volume: 0.25 }],
  ],
};
