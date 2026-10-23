import { BEATS, HUD_LINES, HUD_TIMING, scheduleLines } from "./helpers";

// the 1966 theme's "na na na na na na na na", the chromatic walk down and back, played in low brass for Arkham's night
const OSTINATO = [-28, -28, -29, -29, -30, -30, -29, -29];
const OSTINATO_STEP = 0.18;

const brassRiff = OSTINATO.flatMap((semitones, index) => {
  const start = BEATS.swing + index * OSTINATO_STEP;
  // the octave on top is what makes a sawtooth read as brass instead of a buzz
  return [
    [semitones, start, 0.16, { volume: 0.07 }],
    [semitones + 12, start, 0.16, { volume: 0.03 }],
  ];
});

// one blip of the scanner per case file line, as each one starts typing
const hudBlips = scheduleLines(HUD_LINES, HUD_TIMING).map(({ at }) => [22, at, 0.08, { wave: "sine", volume: 0.035 }]);

// Batman Arkham: rain on the rooftops, thunder rolls, the 1966 riff in low brass swings the signal up, detective mode hums in,
// the scanner pings on the lock, and "Bat-man!" closes the case
export const sound = {
  wave: "sawtooth",
  volume: 0.05,
  notes: [
    ...brassRiff,
    [-43, BEATS.swing, 1.5, { wave: "sine", volume: 0.18, attack: 0.2 }],
    [-31, BEATS.detective, 0.9, { wave: "sine", slideTo: -19, volume: 0.06 }],
    [27, BEATS.lock, 0.3, { wave: "sine", volume: 0.07 }],
    [27, BEATS.lock + 0.32, 0.25, { wave: "sine", volume: 0.03 }],
    ...hudBlips,
    // "Bat-man!": a short stab on "Bat", then the full chord rings out on "man"
    [-31, BEATS.closed - 0.3, 0.2, { attack: 0.03, volume: 0.06 }],
    [-24, BEATS.closed - 0.3, 0.2, { attack: 0.03 }],
    [-19, BEATS.closed - 0.3, 0.2, { attack: 0.03 }],
    [-31, BEATS.closed, 0.9, { attack: 0.03, volume: 0.06 }],
    [-24, BEATS.closed, 0.9, { attack: 0.03 }],
    [-19, BEATS.closed, 0.9, { attack: 0.03 }],
    [-16, BEATS.closed, 0.9, { attack: 0.03, volume: 0.03 }],
    [-43, BEATS.closed, 0.9, { wave: "sine", slideTo: -48, volume: 0.25 }],
  ],
  noises: [
    [0, BEATS.end, { filter: "highpass", frequency: 4200, volume: 0.05 }],
    [BEATS.thunder, 0.12, { filter: "bandpass", frequency: 2400, volume: 0.3 }],
    [BEATS.thunder, 1.8, { filter: "lowpass", frequency: 420, sweepTo: 60, volume: 0.55 }],
    [BEATS.lit - 0.6, 1.2, { filter: "lowpass", frequency: 220, sweepTo: 50, volume: 0.25 }],
    [BEATS.detective, 0.6, { filter: "bandpass", frequency: 3200, sweepTo: 300, volume: 0.2 }],
    [BEATS.closed, 0.15, { filter: "lowpass", frequency: 900, volume: 0.35 }],
  ],
};
