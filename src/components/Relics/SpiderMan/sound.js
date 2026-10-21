// tingle: a high tone wobbling up and down fast, two voices rubbing against each other so it buzzes in the ear
const TINGLE = Array.from({ length: 12 }, (_, index) => {
  const isUp = index % 2 === 0;
  return [isUp ? 31 : 34, index * 0.08, 0.1, { wave: "sine", slideTo: isUp ? 34 : 31, volume: 0.035, attack: 0.01 }];
});
const TINGLE_HIGH = TINGLE.map(([semitones, start, length, tweaks]) => [semitones + 5, start + 0.04, length, { ...tweaks, slideTo: tweaks.slideTo + 5, volume: 0.02 }]);

// Spider-Man 2: the Spider-Sense tingles, two thwips fire, a heroic brass call rises while the mask drops in,
// then the symbiote growls underneath and the whole thing lands on a darker chord when the suit turns black
export const sound = {
  wave: "sawtooth",
  volume: 0.04,
  notes: [
    ...TINGLE,
    ...TINGLE_HIGH,
    // the brass call, climbing a fifth to the octave like a hero arriving
    [-7, 1.4, 0.22],
    [-2, 1.62, 0.22],
    [0, 1.84, 0.45],
    [-2, 2.28, 0.14],
    [0, 2.42, 0.14],
    [3, 2.56, 0.6],
    [-19, 1.4, 1.2, { wave: "triangle", volume: 0.1 }],
    [-14, 1.4, 1.2, { wave: "triangle", volume: 0.06 }],
    // the symbiote: a low growl sliding down under everything
    [-31, 2.65, 1.5, { slideTo: -37, volume: 0.06, attack: 0.3 }],
    [-30, 2.7, 1.4, { slideTo: -36, volume: 0.04, attack: 0.3 }],
    // the black suit: a diminished chord, same root, nothing heroic left in it
    [-19, 3.8, 1.8, { wave: "triangle", volume: 0.12 }],
    [-7, 3.8, 1.6, { volume: 0.035, attack: 0.08 }],
    [-4, 3.8, 1.6, { volume: 0.035, attack: 0.08 }],
    [-1, 3.8, 1.6, { volume: 0.03, attack: 0.08 }],
  ],
  noises: [
    // the shimmer riding on top of the tingle
    [0, 1, { filter: "highpass", frequency: 6000, sweepTo: 9000, volume: 0.05 }],
    // thwip, thwip
    [1.1, 0.13, { filter: "bandpass", frequency: 1200, sweepTo: 7000, volume: 0.35 }],
    [1.26, 0.12, { filter: "bandpass", frequency: 1400, sweepTo: 8000, volume: 0.28 }],
    // the symbiote crawling up out of the floor
    [2.6, 0.9, { filter: "lowpass", frequency: 320, sweepTo: 90, volume: 0.4 }],
    // the suit snapping into place
    [3.8, 0.3, { filter: "lowpass", frequency: 900, sweepTo: 120, volume: 0.35 }],
  ],
};
