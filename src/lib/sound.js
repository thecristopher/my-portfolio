// every egg gets a tiny synth jingle built on the fly, so we ship zero audio files
let audioContext = null;

const getAudioContext = () => {
  const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  if (!AudioContextClass) return null;
  audioContext ??= new AudioContextClass();
  // browsers start the context suspended until a click, and these only play on a click
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
};

// semitones away from A4, the same math every synth uses
export const noteFrequency = (semitonesFromA4) => 440 * 2 ** (semitonesFromA4 / 12);

// each note is [semitones from A4, start in seconds, length in seconds, optional tweaks].
// tweaks can swap the wave, slide the pitch to another note, or change the volume for that one note.
// each noise is [start in seconds, length in seconds, { filter, frequency, volume }], filtered static
// for the things a plain tone can't do: typewriter keys, punches landing, a card whooshing past
export const SOUNDS = {
  // Scott Pilgrim: two meaty hits land, then the coins spill out of the beaten enemy
  punch: {
    wave: "square",
    volume: 0.05,
    notes: [
      [-24, 0, 0.09, { wave: "triangle", slideTo: -40, volume: 0.3 }],
      [-24, 0.15, 0.09, { wave: "triangle", slideTo: -40, volume: 0.3 }],
      [14, 0.34, 0.07],
      [19, 0.41, 0.4],
    ],
    noises: [
      [0, 0.06, { filter: "lowpass", frequency: 1800, volume: 0.35 }],
      [0.15, 0.06, { filter: "lowpass", frequency: 1800, volume: 0.35 }],
    ],
  },
  // Zelda: the little "you found a secret" run every player knows from opening a hidden door
  triforce: {
    wave: "square",
    volume: 0.045,
    notes: [
      [10, 0, 0.11],
      [9, 0.1, 0.11],
      [6, 0.2, 0.11],
      [0, 0.3, 0.11],
      [-1, 0.4, 0.11],
      [7, 0.5, 0.11],
      [11, 0.6, 0.11],
      [15, 0.7, 0.55],
    ],
  },
  // Resident Evil: the typewriter clacks out a line, the bell dings, then the save room arpeggio from RE2 plays
  // over a low drone, the one theme in that game that means you're safe for a minute
  umbrella: {
    wave: "triangle",
    volume: 0.09,
    notes: [
      [27, 0.62, 0.9, { wave: "sine", volume: 0.1 }],
      [34, 0.62, 0.6, { wave: "sine", volume: 0.04 }],
      [-20, 1, 3.6, { wave: "sine", volume: 0.06, attack: 0.6 }],
      [-8, 1, 0.4],
      [-1, 1.45, 0.4],
      [4, 1.9, 0.4],
      [-1, 2.35, 0.4],
      [0, 2.8, 0.4],
      [-3, 3.25, 0.4],
      [-1, 3.7, 1.2],
    ],
    noises: [
      [0, 0.035, { filter: "bandpass", frequency: 2600, volume: 0.5 }],
      [0.13, 0.035, { filter: "bandpass", frequency: 3000, volume: 0.45 }],
      [0.22, 0.035, { filter: "bandpass", frequency: 2400, volume: 0.5 }],
      [0.37, 0.035, { filter: "bandpass", frequency: 2800, volume: 0.45 }],
      [0.46, 0.035, { filter: "bandpass", frequency: 2600, volume: 0.5 }],
      [0.5, 0.12, { filter: "highpass", frequency: 1500, volume: 0.2 }],
    ],
  },
  // Yu-Gi-Oh: the card whooshes off the duel disk, the summon swells up, and the magic sparkles out
  magician: {
    wave: "sine",
    volume: 0.12,
    notes: [
      [-12, 0.05, 0.4, { wave: "triangle", slideTo: 12, volume: 0.1 }],
      [24, 0.42, 0.16],
      [28, 0.5, 0.16],
      [31, 0.58, 0.16],
      [36, 0.66, 0.2],
      [40, 0.74, 0.55, { volume: 0.09 }],
      [43, 0.82, 0.6, { volume: 0.05 }],
    ],
    noises: [[0, 0.4, { filter: "bandpass", frequency: 900, sweepTo: 5000, volume: 0.25 }]],
  },
  // Pokemon: the ball pops open, rattles three times, clicks shut, then the anime theme's opening riff kicks in.
  // timed to the ball's wobble on screen
  pokeball: {
    wave: "square",
    volume: 0.05,
    notes: [
      [7, 0, 0.12, { slideTo: -12 }],
      [-8, 0.12, 0.05, { slideTo: -14 }],
      [-8, 0.4, 0.05, { slideTo: -14 }],
      [-8, 0.68, 0.05, { slideTo: -14 }],
      [-20, 0.92, 0.04, { wave: "triangle", volume: 0.25 }],
      [-4, 1.05, 0.12],
      [1, 1.18, 0.12],
      [3, 1.32, 0.12],
      [4, 1.45, 0.12],
      [3, 1.59, 0.12],
      [4, 1.72, 0.12],
      [6, 1.85, 0.12],
      [8, 1.99, 0.9],
      [-11, 1.05, 0.9, { wave: "triangle", volume: 0.12 }],
      [-16, 1.99, 0.9, { wave: "triangle", volume: 0.12 }],
    ],
    noises: [[0.92, 0.03, { filter: "highpass", frequency: 3000, volume: 0.25 }]],
  },
  // Elden Ring: a low swell, then that golden choir chord rings out the way a site of grace does when you touch it
  grace: {
    wave: "sine",
    volume: 0.06,
    notes: [
      [-33, 0, 2.2, { volume: 0.18, slideTo: -36 }],
      [-9, 0.15, 2.4, { attack: 0.6 }],
      [-5, 0.18, 2.4, { attack: 0.6 }],
      [-2, 0.21, 2.4, { attack: 0.6 }],
      [3, 0.24, 2.4, { attack: 0.6, volume: 0.04 }],
      [-8.9, 0.15, 2.4, { attack: 0.6, volume: 0.03, wave: "triangle" }],
      [22, 0.5, 1.2, { volume: 0.035 }],
      [27, 0.62, 1.2, { volume: 0.03 }],
      [31, 0.74, 1.4, { volume: 0.03 }],
    ],
    noises: [[0, 0.9, { filter: "bandpass", frequency: 400, sweepTo: 2400, volume: 0.08 }]],
  },
  // Fullmetal Alchemist: hands clap together, the circle crackles with blue lightning, and the transmutation hums up
  alchemy: {
    wave: "sine",
    volume: 0.06,
    notes: [
      [-28, 0.12, 1.1, { wave: "sawtooth", slideTo: -16, volume: 0.04 }],
      [7, 0.3, 0.9, { attack: 0.3 }],
      [14, 0.42, 0.9, { attack: 0.3, volume: 0.04 }],
      [19, 0.54, 0.9, { attack: 0.3, volume: 0.03 }],
    ],
    noises: [
      [0, 0.05, { filter: "bandpass", frequency: 1400, volume: 0.6 }],
      [0.18, 0.04, { filter: "highpass", frequency: 4000, volume: 0.3 }],
      [0.31, 0.03, { filter: "highpass", frequency: 5000, volume: 0.25 }],
      [0.4, 0.05, { filter: "highpass", frequency: 3500, volume: 0.3 }],
      [0.55, 0.03, { filter: "highpass", frequency: 4500, volume: 0.2 }],
    ],
  },
  // Avatar: a gong for the Avatar State, wind rushing past, and an airy pentatonic run on a flute
  airbender: {
    wave: "triangle",
    volume: 0.07,
    notes: [
      [-33, 0, 2, { wave: "sine", volume: 0.2 }],
      [-21, 0, 1.6, { wave: "sine", volume: 0.05 }],
      [10, 0.5, 0.18, { attack: 0.05 }],
      [12, 0.66, 0.18, { attack: 0.05 }],
      [15, 0.82, 0.18, { attack: 0.05 }],
      [17, 0.98, 0.18, { attack: 0.05 }],
      [22, 1.14, 0.7, { attack: 0.08 }],
    ],
    noises: [[0.2, 1.2, { filter: "bandpass", frequency: 300, sweepTo: 2200, volume: 0.18 }]],
  },
  // Demon Slayer: the blade leaves the sheath, a wave of water follows it, and a koto plucks a hirajoshi line
  hanafuda: {
    wave: "triangle",
    volume: 0.1,
    notes: [
      [3, 0.45, 0.4],
      [5, 0.55, 0.4],
      [6, 0.65, 0.4],
      [10, 0.75, 0.4],
      [11, 0.85, 0.9],
    ],
    noises: [
      [0, 0.18, { filter: "highpass", frequency: 3000, sweepTo: 9000, volume: 0.35 }],
      [0.12, 0.5, { filter: "bandpass", frequency: 2500, sweepTo: 400, volume: 0.25 }],
    ],
  },
  // Spider-Man: a web shoots out with a thwip, then the 1967 cartoon theme sings
  // "Spider-Man, Spider-Man, does whatever a spider can"
  spider: {
    wave: "square",
    volume: 0.045,
    notes: [
      [3, 0.2, 0.28],
      [6, 0.5, 0.14],
      [10, 0.65, 0.5],
      [9, 1.4, 0.28],
      [6, 1.7, 0.14],
      [3, 1.85, 0.5],
      [3, 2.6, 0.28],
      [6, 2.9, 0.14],
      [10, 3.05, 0.28],
      [11, 3.35, 0.14],
      [10, 3.5, 0.28],
      [9, 3.8, 0.28],
      [6, 4.1, 0.14],
      [3, 4.25, 0.6],
      [-21, 0.2, 1.1, { wave: "triangle", volume: 0.12 }],
      [-21, 2.6, 2.2, { wave: "triangle", volume: 0.12 }],
    ],
    noises: [[0, 0.14, { filter: "bandpass", frequency: 1200, sweepTo: 7000, volume: 0.35 }]],
  },
  // Batman: the 1966 show's surf guitar walks down and back up, "na na na na na na na na" twice, then "Batman!"
  // lands with a comic book punch on each syllable
  bat: {
    wave: "sawtooth",
    volume: 0.05,
    notes: [
      ...[-16, -16, -17, -17, -18, -18, -17, -17].flatMap((semitones, index) => [
        [semitones, index * 0.15, 0.13],
        [semitones, 1.2 + index * 0.15, 0.13],
      ]),
      [-1, 2.4, 0.26, { wave: "square", volume: 0.06 }],
      [-13, 2.4, 0.26],
      [-1, 2.7, 0.7, { wave: "square", volume: 0.06 }],
      [-13, 2.7, 0.7],
    ],
    noises: [
      [2.4, 0.12, { filter: "lowpass", frequency: 1600, volume: 0.4 }],
      [2.7, 0.16, { filter: "lowpass", frequency: 1400, volume: 0.45 }],
    ],
  },
};

const playNote = (context, sound, [semitones, start, length, tweaks = {}]) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + start;
  const volume = tweaks.volume ?? sound.volume;
  const attack = tweaks.attack ?? 0.02;

  oscillator.type = tweaks.wave ?? sound.wave;
  oscillator.frequency.setValueAtTime(noteFrequency(semitones), startAt);
  if (tweaks.slideTo !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(noteFrequency(tweaks.slideTo), startAt + length);
  }

  // quick attack and a soft tail, otherwise every note starts and stops with a click
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + length + 0.05);
};

const playNoise = (context, [start, length, { filter, frequency, sweepTo, volume }]) => {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * length), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;

  const startAt = context.currentTime + start;
  const source = context.createBufferSource();
  const shaper = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = buffer;
  shaper.type = filter;
  shaper.frequency.setValueAtTime(frequency, startAt);
  if (sweepTo) shaper.frequency.exponentialRampToValueAtTime(sweepTo, startAt + length);
  gain.gain.setValueAtTime(volume, startAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);

  source.connect(shaper).connect(gain).connect(context.destination);
  source.start(startAt);
};

export const playSound = (name) => {
  const sound = SOUNDS[name];
  if (!sound) return;

  try {
    const context = getAudioContext();
    if (!context) return;
    sound.notes.forEach((note) => playNote(context, sound, note));
    sound.noises?.forEach((noise) => playNoise(context, noise));
  } catch {
    // no sound is fine, the egg still works without it
  }
};
