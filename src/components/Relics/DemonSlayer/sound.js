// Demon Slayer: taiko drums under the checker wipe, a shamisen phrase in the in scale (E F A B C) while the
// calligraphy is painted, the blade leaves its sheath and the slash lands with a wash of water and one last pluck
export const sound = {
  wave: "sawtooth",
  volume: 0.07,
  notes: [
    // taiko: don, don, the drum that opens every breathing form
    [-33, 0, 0.4, { wave: "sine", slideTo: -42, volume: 0.32 }],
    [-33, 0.42, 0.4, { wave: "sine", slideTo: -42, volume: 0.28 }],
    // shamisen: short sawtooth plucks with no attack and a fast decay, an octave of triangle under each for the body
    [7, 1.0, 0.18, { attack: 0.004 }],
    [-5, 1.0, 0.18, { wave: "triangle", attack: 0.004, volume: 0.05 }],
    [8, 1.16, 0.16, { attack: 0.004 }],
    [12, 1.32, 0.3, { attack: 0.004 }],
    [14, 1.66, 0.14, { attack: 0.004 }],
    [15, 1.8, 0.14, { attack: 0.004 }],
    [14, 1.94, 0.14, { attack: 0.004 }],
    [12, 2.08, 0.32, { attack: 0.004 }],
    [0, 2.08, 0.32, { wave: "triangle", attack: 0.004, volume: 0.05 }],
    // the bend a shamisen player slides into right before the cut
    [8, 2.42, 0.22, { attack: 0.004, slideTo: 7 }],
    // the slash lands on a big drum hit
    [-36, 2.7, 0.6, { wave: "sine", slideTo: -45, volume: 0.36 }],
    // and the form resolves on an open fifth, plucked hard
    [7, 3.3, 0.7, { attack: 0.004, volume: 0.06 }],
    [14, 3.3, 0.7, { attack: 0.004, volume: 0.05 }],
    [19, 3.3, 0.9, { wave: "triangle", volume: 0.05 }],
  ],
  noises: [
    // the checker wipe sweeping across
    [0.05, 0.5, { filter: "bandpass", frequency: 600, sweepTo: 3200, volume: 0.18 }],
    // the drum skins
    [0, 0.08, { filter: "lowpass", frequency: 260, volume: 0.4 }],
    [0.42, 0.08, { filter: "lowpass", frequency: 260, volume: 0.35 }],
    // the blade drawn, then the swish of the cut
    [2.5, 0.16, { filter: "highpass", frequency: 3000, sweepTo: 9000, volume: 0.2 }],
    [2.66, 0.32, { filter: "bandpass", frequency: 6000, sweepTo: 700, volume: 0.38 }],
    // the water surface crashing after it, a long wash rolling off
    [2.72, 1.4, { filter: "lowpass", frequency: 1600, sweepTo: 260, volume: 0.3 }],
    [2.8, 0.9, { filter: "bandpass", frequency: 2400, sweepTo: 900, volume: 0.14 }],
  ],
};
