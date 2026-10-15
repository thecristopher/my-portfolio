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
  },
  // Yu-Gi-Oh: the card whooshes off the duel disk, three "it's time to duel" stabs hit, an Egyptian scale run
  // for the Millennium Puzzle climbs up, and the summon note lands right as the skills turn into monsters
  magician: {
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
  // Elden Ring: a low cello figure in the game's dark minor, then it opens up into the golden choir chord
  // a site of grace rings out with when you touch it
  grace: {
    wave: "sine",
    volume: 0.06,
    notes: [
      [-24, 0.1, 0.35, { wave: "triangle", volume: 0.14 }],
      [-24, 0.48, 0.12, { wave: "triangle", volume: 0.14 }],
      [-21, 0.62, 0.12, { wave: "triangle", volume: 0.14 }],
      [-17, 0.76, 0.5, { wave: "triangle", volume: 0.14 }],
      [-33, 0.9, 1.9, { volume: 0.16, slideTo: -36 }],
      [-9, 1, 1.85, { attack: 0.5 }],
      [-5, 1.03, 1.85, { attack: 0.5 }],
      [-2, 1.06, 1.85, { attack: 0.5 }],
      [3, 1.09, 1.85, { attack: 0.5, volume: 0.04 }],
      [-8.9, 1, 1.85, { attack: 0.5, volume: 0.03, wave: "triangle" }],
      [22, 1.3, 1.1, { volume: 0.035 }],
      [27, 1.42, 1.1, { volume: 0.03 }],
      [31, 1.54, 1.2, { volume: 0.03 }],
    ],
    noises: [[0.8, 0.9, { filter: "bandpass", frequency: 400, sweepTo: 2400, volume: 0.08 }]],
  },
  // Fullmetal Alchemist: hands clap, the circle crackles, and a J-rock riff kicks in the way the openings do,
  // chugging power chords, a run up to a big crash chord and a guitar lead bending up over it
  alchemy: {
    wave: "sawtooth",
    volume: 0.035,
    notes: [
      [-29, 0.15, 0.1],
      [-22, 0.15, 0.1],
      [-17, 0.15, 0.1],
      [-29, 0.29, 0.1],
      [-22, 0.29, 0.1],
      [-17, 0.29, 0.1],
      [-29, 0.43, 0.1],
      [-22, 0.43, 0.1],
      [-17, 0.43, 0.1],
      [-31, 0.57, 0.12],
      [-24, 0.57, 0.12],
      [-19, 0.57, 0.12],
      [-29, 0.71, 0.12],
      [-22, 0.71, 0.12],
      [-17, 0.71, 0.12],
      [-26, 0.99, 0.12],
      [-19, 0.99, 0.12],
      [-14, 0.99, 0.12],
      [-24, 1.13, 0.24],
      [-17, 1.13, 0.24],
      [-12, 1.13, 0.24],
      [-29, 1.4, 0.9],
      [-22, 1.4, 0.9],
      [-17, 1.4, 0.9],
      [5, 1.4, 0.2, { wave: "square", slideTo: 7, volume: 0.04 }],
      [7, 1.6, 0.7, { wave: "square", volume: 0.04 }],
      [-36, 0.15, 0.16, { wave: "sine", slideTo: -48, volume: 0.2 }],
      [-36, 0.43, 0.16, { wave: "sine", slideTo: -48, volume: 0.2 }],
      [-36, 0.71, 0.16, { wave: "sine", slideTo: -48, volume: 0.2 }],
      [-36, 1.13, 0.16, { wave: "sine", slideTo: -48, volume: 0.2 }],
      [-36, 1.4, 0.16, { wave: "sine", slideTo: -48, volume: 0.2 }],
    ],
    noises: [
      [0, 0.05, { filter: "bandpass", frequency: 1400, volume: 0.6 }],
      [0.18, 0.04, { filter: "highpass", frequency: 4000, volume: 0.3 }],
      [0.29, 0.08, { filter: "bandpass", frequency: 1800, volume: 0.35 }],
      [0.57, 0.08, { filter: "bandpass", frequency: 1800, volume: 0.35 }],
      [0.85, 0.08, { filter: "bandpass", frequency: 1800, volume: 0.35 }],
      [0.99, 0.08, { filter: "bandpass", frequency: 1800, volume: 0.3 }],
      [1.4, 0.9, { filter: "highpass", frequency: 6000, volume: 0.22 }],
    ],
  },
  // Avatar: the intro's "Water. Earth. Fire. Air.", each element with its own sound one beat apart and a low drone
  // under the narration, then the drum and gong of the title card and a short flute call
  airbender: {
    wave: "triangle",
    volume: 0.07,
    notes: [
      [-33, 0, 1.5, { wave: "sine", volume: 0.06, attack: 0.3 }],
      [-26, 0, 1.5, { wave: "sine", volume: 0.03, attack: 0.3 }],
      [5, 0.02, 0.25, { wave: "sine", slideTo: 12, volume: 0.05 }],
      [-36, 0.35, 0.35, { wave: "sine", slideTo: -45, volume: 0.35 }],
      [-33, 1.5, 0.3, { wave: "sine", slideTo: -40, volume: 0.35 }],
      [-33, 1.5, 1.1, { wave: "sine", volume: 0.16 }],
      [-21, 1.5, 1, { wave: "sine", volume: 0.05 }],
      [17, 1.6, 0.12, { attack: 0.04 }],
      [19, 1.72, 0.12, { attack: 0.04 }],
      [24, 1.84, 0.7, { attack: 0.08 }],
    ],
    noises: [
      [0, 0.35, { filter: "bandpass", frequency: 1800, sweepTo: 500, volume: 0.3 }],
      [0.35, 0.4, { filter: "lowpass", frequency: 220, volume: 0.45 }],
      [0.7, 0.4, { filter: "bandpass", frequency: 600, sweepTo: 2000, volume: 0.3 }],
      [0.78, 0.03, { filter: "highpass", frequency: 4000, volume: 0.2 }],
      [0.9, 0.03, { filter: "highpass", frequency: 5000, volume: 0.15 }],
      [1.05, 0.45, { filter: "bandpass", frequency: 400, sweepTo: 3000, volume: 0.25 }],
      [1.5, 0.08, { filter: "lowpass", frequency: 250, volume: 0.45 }],
    ],
  },
  // Demon Slayer: the blade leaves the sheath with a taiko hit, a wave of water follows it, and a koto answers
  // in the hirajoshi scale, "tan, ta-ta, TAN"
  hanafuda: {
    wave: "triangle",
    volume: 0.1,
    notes: [
      [-33, 0.02, 0.3, { wave: "sine", slideTo: -40, volume: 0.3 }],
      [11, 0.3, 0.2],
      [10, 0.48, 0.1],
      [6, 0.58, 0.1],
      [15, 0.7, 0.5],
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
      [3, 0.15, 0.24],
      [6, 0.41, 0.12],
      [10, 0.54, 0.42],
      [9, 1.18, 0.24],
      [6, 1.44, 0.12],
      [3, 1.57, 0.42],
      [3, 2.2, 0.24],
      [6, 2.46, 0.12],
      [10, 2.59, 0.24],
      [11, 2.85, 0.12],
      [10, 2.98, 0.24],
      [9, 3.24, 0.24],
      [6, 3.5, 0.12],
      [3, 3.63, 0.55],
      [-21, 0.15, 0.95, { wave: "triangle", volume: 0.12 }],
      [-21, 2.2, 1.95, { wave: "triangle", volume: 0.12 }],
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
