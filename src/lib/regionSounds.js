// what each region sounds like the moment you travel there, synthesized like every other sound on the page.
// same recipe shape as the relic jingles: notes are [semitones from A4, start, length, tweaks], noises are filtered static
export const REGION_SOUNDS = {
  // Leyndell: the golden capital. a low organ root swells into a bright major chord with a bell on top
  leyndell: {
    wave: "triangle",
    volume: 0.06,
    notes: [
      [-33, 0, 2.2, { wave: "sine", volume: 0.12, attack: 0.3 }],
      [-9, 0.15, 1.9, { attack: 0.35 }],
      [-5, 0.25, 1.8, { attack: 0.35 }],
      [-2, 0.35, 1.7, { attack: 0.35 }],
      [3, 0.55, 1.5, { attack: 0.3, volume: 0.04 }],
      [27, 0.6, 1.4, { wave: "sine", volume: 0.035 }],
      [34, 0.62, 1.2, { wave: "sine", volume: 0.02 }],
    ],
  },
  // Haligtree: Malenia's rot. a blade cuts the air, then a slow minor chord with a tritone that never resolves
  haligtree: {
    wave: "sawtooth",
    volume: 0.03,
    notes: [
      [-12, 0.25, 2, { attack: 0.5 }],
      [-9, 0.3, 1.9, { attack: 0.5 }],
      [-6, 0.35, 1.9, { attack: 0.5, volume: 0.025 }],
      [-24, 0.25, 2.1, { wave: "sine", volume: 0.1, attack: 0.4 }],
      [15, 0.9, 0.9, { wave: "sine", slideTo: 14, volume: 0.03 }],
    ],
    noises: [[0, 0.22, { filter: "highpass", frequency: 2500, sweepTo: 9000, volume: 0.3 }]],
  },
  // Raya Lucaria: glintstone. a crystal arpeggio climbs under the full moon, with a shimmer of high static
  "raya-lucaria": {
    wave: "sine",
    volume: 0.05,
    notes: [
      [12, 0, 0.9],
      [16, 0.1, 0.9],
      [19, 0.2, 0.9],
      [24, 0.3, 1],
      [28, 0.4, 1.1],
      [31, 0.5, 1.2, { volume: 0.035 }],
      [-12, 0, 1.8, { wave: "triangle", volume: 0.06, attack: 0.3 }],
    ],
    noises: [[0.2, 1.4, { filter: "highpass", frequency: 7000, sweepTo: 12000, volume: 0.06 }]],
  },
  // Caelid: Radahn's battlefield. war drums under a brass call in open fifths
  caelid: {
    wave: "sawtooth",
    volume: 0.04,
    notes: [
      [-17, 0.3, 0.5],
      [-10, 0.3, 0.5, { volume: 0.03 }],
      [-15, 0.8, 0.35],
      [-8, 0.8, 0.35, { volume: 0.03 }],
      [-12, 1.15, 1.2, { attack: 0.08 }],
      [-5, 1.15, 1.2, { attack: 0.08, volume: 0.03 }],
      [-36, 0, 0.3, { wave: "sine", slideTo: -44, volume: 0.3 }],
      [-36, 0.3, 0.3, { wave: "sine", slideTo: -44, volume: 0.3 }],
      [-36, 1.15, 0.4, { wave: "sine", slideTo: -46, volume: 0.32 }],
    ],
    noises: [
      [0, 0.18, { filter: "lowpass", frequency: 300, volume: 0.45 }],
      [0.3, 0.18, { filter: "lowpass", frequency: 300, volume: 0.45 }],
      [1.15, 0.3, { filter: "lowpass", frequency: 280, volume: 0.5 }],
    ],
  },
  // Mohgwyn: the blood dynasty. a low choir sinks a half step while something thick bubbles underneath
  mohgwyn: {
    wave: "sawtooth",
    volume: 0.035,
    notes: [
      [-21, 0, 2.2, { attack: 0.5, slideTo: -22 }],
      [-18, 0.05, 2.1, { attack: 0.5, slideTo: -19, volume: 0.025 }],
      [-14, 0.1, 2, { attack: 0.5, slideTo: -15, volume: 0.02 }],
      [-33, 0, 2.3, { wave: "sine", volume: 0.14, attack: 0.4 }],
    ],
    noises: [[0.3, 1.6, { filter: "lowpass", frequency: 400, sweepTo: 120, volume: 0.12 }]],
  },
  // Ordina: the snowfield. icy wind blows through, and high chimes ring like frost cracking
  ordina: {
    wave: "sine",
    volume: 0.045,
    notes: [
      [26, 0.3, 1],
      [33, 0.45, 0.9, { volume: 0.03 }],
      [29, 0.6, 1.1],
      [36, 0.8, 1.2, { volume: 0.025 }],
      [-7, 0.2, 1.8, { wave: "triangle", volume: 0.05, attack: 0.4 }],
    ],
    noises: [[0, 2, { filter: "bandpass", frequency: 800, sweepTo: 3200, volume: 0.1 }]],
  },
};
