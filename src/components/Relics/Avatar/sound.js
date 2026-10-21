import { BEATS, elementBeat, erhuNote } from "./helpers";

// a gong is a low hum with partials that don't line up with the note, that's what makes it shimmer instead of ring
const gong = (start, volume) => [
  [-36, start, 2.4, { wave: "sine", volume, attack: 0.01 }],
  [-28.6, start, 1.8, { wave: "sine", volume: volume * 0.45, attack: 0.02 }],
  [-22.9, start, 1.3, { wave: "sine", volume: volume * 0.3, attack: 0.02 }],
  [-17.4, start, 0.9, { wave: "sine", volume: volume * 0.18, attack: 0.03 }],
];

// a taiko hit: a deep pitch that drops as the skin settles
const taiko = (start, volume = 0.45) => [-40, start, 0.4, { wave: "sine", slideTo: -48, volume, attack: 0.005 }];
const taikoSlap = (start) => [start, 0.07, { filter: "lowpass", frequency: 320, volume: 0.45 }];

// what each element sounds like under its drum, as [length, filter]: water swells, earth rumbles, fire crackles, air whooshes
const ELEMENT_NOISES = [
  [0.6, { filter: "bandpass", frequency: 500, sweepTo: 1800, volume: 0.22 }],
  [0.55, { filter: "lowpass", frequency: 160, volume: 0.5 }],
  [0.5, { filter: "bandpass", frequency: 2600, sweepTo: 1200, volume: 0.2 }],
  [0.6, { filter: "bandpass", frequency: 700, sweepTo: 4200, volume: 0.24 }],
];

// a phrase in A minor pentatonic, bowed like an erhu over the four nations coming together
const MELODY = [
  [12, 0, 0.3],
  [15, 0.3, 0.3],
  [17, 0.6, 0.55],
  [15, 1.15, 0.25],
  [12, 1.4, 0.25],
  [10, 1.65, 0.8],
];

const elementBeats = [0, 1, 2, 3].map(elementBeat);

// Avatar: the gong opens the narration, a taiko lands on Water, Earth, Fire and Air,
// then an erhu sings over a soft drone as the four nations join
export const sound = {
  wave: "triangle",
  volume: 0.07,
  notes: [
    ...gong(0, 0.22),
    ...elementBeats.map((start) => taiko(start)),
    // two hits for the four nations joining, then a softer gong under the melody
    taiko(BEATS.together, 0.5),
    taiko(BEATS.together + 0.16, 0.4),
    ...gong(BEATS.together, 0.1),
    [-24, BEATS.together, 2.6, { wave: "sine", volume: 0.04, attack: 0.4 }],
    [-17, BEATS.together, 2.6, { wave: "sine", volume: 0.025, attack: 0.4 }],
    ...MELODY.flatMap(([note, offset, length]) => erhuNote(note, BEATS.harmony + offset, length)),
  ],
  noises: [
    [0, 0.35, { filter: "lowpass", frequency: 500, volume: 0.3 }],
    ...elementBeats.flatMap((start, index) => [taikoSlap(start), [start, ...ELEMENT_NOISES[index]]]),
    taikoSlap(BEATS.together),
    taikoSlap(BEATS.together + 0.16),
  ],
};
