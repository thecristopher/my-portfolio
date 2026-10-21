import { BEATS, crackleTimes } from "./helpers";

// the electric snap of the transmutation: short bursts of high static, scattered so they never fall on a beat
const CRACKLE = crackleTimes(BEATS.crackleFrom - 0.13, 1.6, 14).map((start, index) => [
  start,
  0.025 + (index % 3) * 0.012,
  { filter: "highpass", frequency: 3500 + (index % 4) * 900, volume: 0.22 },
]);

// a power chord is root, fifth and octave. two slightly detuned saws per string make it sound like an amp, not a beep
const powerChord = (root, start, length, volume = 0.05) => [
  [root - 0.08, start, length, { volume }],
  [root + 0.08, start, length, { volume }],
  [root + 7, start, length, { volume: volume * 0.8 }],
  [root + 12, start, length, { volume: volume * 0.6 }],
];

// Fullmetal Alchemist: the clap, blue sparks crackling off the circle while the energy climbs,
// then a J-rock power chord slams down as the Flamel cross stamps in
export const sound = {
  wave: "sawtooth",
  volume: 0.05,
  notes: [
    // the clap's body, a dull thud under the crack
    [-30, BEATS.clap, 0.12, { wave: "sine", slideTo: -42, volume: 0.35 }],
    // the hum of the circle waking up, then the rising tone that builds to the hit
    [-41, 0.42, 1.25, { wave: "sawtooth", slideTo: -36, volume: 0.03, attack: 0.2 }],
    [-12, 0.5, 1.15, { wave: "sine", slideTo: 12, volume: 0.07, attack: 0.3 }],
    [-5, 0.7, 0.95, { wave: "square", slideTo: 19, volume: 0.025, attack: 0.3 }],
    // the hit: a quick D5 pickup, then the E5 rings out
    ...powerChord(-31, BEATS.pickup, 0.14),
    ...powerChord(-29, BEATS.stamp, 1.3, 0.055),
    // the kick under the hit
    [-36, BEATS.pickup, 0.18, { wave: "sine", slideTo: -50, volume: 0.4 }],
    [-36, BEATS.stamp, 0.2, { wave: "sine", slideTo: -50, volume: 0.4 }],
    // a lead guitar bend screaming over the chord
    [10, BEATS.stamp + 0.11, 0.25, { wave: "square", slideTo: 12, volume: 0.035 }],
    [12, BEATS.stamp + 0.36, 0.9, { wave: "square", slideTo: 12.4, volume: 0.035 }],
  ],
  noises: [
    // the clap itself
    [BEATS.clap, 0.06, { filter: "bandpass", frequency: 1500, volume: 0.75 }],
    [BEATS.clap + 0.02, 0.05, { filter: "highpass", frequency: 4000, volume: 0.35 }],
    ...CRACKLE,
    // the crash cymbal on the hit
    [BEATS.pickup, 0.1, { filter: "highpass", frequency: 5000, volume: 0.3 }],
    [BEATS.stamp, 1.4, { filter: "highpass", frequency: 6000, volume: 0.25 }],
  ],
};
