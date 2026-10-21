// Resident Evil: the typewriter clacks out a line, the bell dings, then the save room arpeggio from RE2 plays
// over a low drone, the one theme in that game that means you're safe for a minute
export const sound = {
  wave: "triangle",
  volume: 0.09,
  notes: [
    [27, 0.62, 0.9, { wave: "sine", volume: 0.1 }],
    [34, 0.62, 0.6, { wave: "sine", volume: 0.04 }],
    [-20, 0.9, 3.1, { wave: "sine", volume: 0.06, attack: 0.6 }],
    [-8, 0.9, 0.34],
    [-1, 1.28, 0.34],
    [4, 1.66, 0.34],
    [-1, 2.04, 0.34],
    [0, 2.42, 0.34],
    [-3, 2.8, 0.34],
    [-1, 3.18, 0.85],
  ],
  noises: [
    [0, 0.035, { filter: "bandpass", frequency: 2600, volume: 0.5 }],
    [0.13, 0.035, { filter: "bandpass", frequency: 3000, volume: 0.45 }],
    [0.22, 0.035, { filter: "bandpass", frequency: 2400, volume: 0.5 }],
    [0.37, 0.035, { filter: "bandpass", frequency: 2800, volume: 0.45 }],
    [0.46, 0.035, { filter: "bandpass", frequency: 2600, volume: 0.5 }],
    [0.5, 0.12, { filter: "highpass", frequency: 1500, volume: 0.2 }],
  ],
};
