// Yu-Gi-Oh: the card whooshes off the duel disk, three "it's time to duel" stabs hit, an Egyptian scale run
// for the Millennium Puzzle climbs up, and the summon note lands right as the skills turn into monsters
export const sound = {
  wave: "square",
  volume: 0.04,
  notes: [
    [-12, 0.05, 0.35, { wave: "triangle", slideTo: 12, volume: 0.1 }],
    [-19, 0.45, 0.1, { wave: "sawtooth", volume: 0.08 }],
    [-7, 0.45, 0.1, { wave: "sawtooth", volume: 0.05 }],
    [-19, 0.6, 0.1, { wave: "sawtooth", volume: 0.08 }],
    [-7, 0.6, 0.1, { wave: "sawtooth", volume: 0.05 }],
    [-19, 0.75, 0.35, { wave: "sawtooth", volume: 0.08 }],
    [-7, 0.75, 0.35, { wave: "sawtooth", volume: 0.05 }],
    [5, 0.9, 0.09],
    [6, 0.97, 0.09],
    [9, 1.04, 0.09],
    [10, 1.11, 0.09],
    [17, 1.2, 0.9, { wave: "triangle", volume: 0.1 }],
    [12, 1.2, 0.9, { wave: "triangle", volume: 0.06 }],
    [24, 1.35, 0.16, { wave: "sine", volume: 0.08 }],
    [28, 1.45, 0.16, { wave: "sine", volume: 0.08 }],
    [31, 1.55, 0.2, { wave: "sine", volume: 0.08 }],
    [36, 1.65, 0.5, { wave: "sine", volume: 0.05 }],
  ],
  noises: [
    [0, 0.4, { filter: "bandpass", frequency: 900, sweepTo: 5000, volume: 0.25 }],
    [0.45, 0.06, { filter: "lowpass", frequency: 900, volume: 0.3 }],
    [0.6, 0.06, { filter: "lowpass", frequency: 900, volume: 0.3 }],
    [0.75, 0.1, { filter: "lowpass", frequency: 900, volume: 0.35 }],
  ],
};
