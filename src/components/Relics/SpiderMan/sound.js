// tingle: a high tone wobbling up and down fast, two voices rubbing against each other so it buzzes in the ear
const TINGLE = Array.from({ length: 12 }, (_, index) => {
  const isUp = index % 2 === 0;
  return [isUp ? 31 : 34, index * 0.08, 0.1, { wave: "sine", slideTo: isUp ? 34 : 31, volume: 0.035, attack: 0.01 }];
});
const TINGLE_HIGH = TINGLE.map(([semitones, start, length, tweaks]) => [semitones + 5, start + 0.04, length, { ...tweaks, slideTo: tweaks.slideTo + 5, volume: 0.02 }]);

// the 1967 cartoon theme, "Spider-Man, Spider-Man, does whatever a spider can", as [semitones, offset, length]
const THEME_1967 = [
  [3, 0, 0.28],
  [6, 0.3, 0.14],
  [10, 0.45, 0.5],
  [9, 1.2, 0.28],
  [6, 1.5, 0.14],
  [3, 1.65, 0.5],
  [3, 2.4, 0.28],
  [6, 2.7, 0.14],
  [10, 2.85, 0.28],
  [11, 3.15, 0.14],
  [10, 3.3, 0.28],
  [9, 3.6, 0.28],
  [6, 3.9, 0.14],
  [3, 4.05, 0.6],
];
const THEME_AT = 1.4;
// a touch quicker than the cartoon so the last "can" lands before the frame settles
const THEME_TEMPO = 0.85;
const theme = THEME_1967.map(([semitones, offset, length]) => [semitones, THEME_AT + offset * THEME_TEMPO, length * THEME_TEMPO, { wave: "square" }]);

// Spider-Man: the Spider-Sense tingles, two thwips fire, then the 1967 theme sings as Spidey swings in
export const sound = {
  wave: "sawtooth",
  volume: 0.04,
  notes: [
    ...TINGLE,
    ...TINGLE_HIGH,
    ...theme,
    // the bass walking under the theme, one long root per phrase
    [-21, THEME_AT, 1.1 * THEME_TEMPO, { wave: "triangle", volume: 0.12 }],
    [-21, THEME_AT + 2.4 * THEME_TEMPO, 2.2 * THEME_TEMPO, { wave: "triangle", volume: 0.12 }],
  ],
  noises: [
    // the shimmer riding on top of the tingle
    [0, 1, { filter: "highpass", frequency: 6000, sweepTo: 9000, volume: 0.05 }],
    // thwip, thwip
    [1.1, 0.13, { filter: "bandpass", frequency: 1200, sweepTo: 7000, volume: 0.35 }],
    [1.26, 0.12, { filter: "bandpass", frequency: 1400, sweepTo: 8000, volume: 0.28 }],
  ],
};
