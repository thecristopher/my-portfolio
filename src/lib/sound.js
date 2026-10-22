import { useSyncExternalStore } from "react";

// every relic gets a tiny synth jingle built on the fly, so we ship zero audio files
let audioContext = null;

// the statusline can mute every jingle, and the choice sticks between visits
const MUTE_KEY = "sound-muted";
const muteListeners = new Set();

const readMuted = () => {
  try {
    return localStorage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
};

let isMuted = readMuted();

export const getMuted = () => isMuted;

export const setMuted = (muted) => {
  isMuted = muted;
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // private windows can block storage, the choice still holds for this visit
  }
  muteListeners.forEach((listener) => listener());
};

const subscribeToMute = (listener) => {
  muteListeners.add(listener);
  return () => muteListeners.delete(listener);
};

export const useMuted = () => useSyncExternalStore(subscribeToMute, getMuted);

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
export const UI_SOUNDS = {
  // Scott Pilgrim's combo, one sound per hit. the jab is a short meaty thud
  punch: {
    wave: "square",
    volume: 0.05,
    notes: [[-24, 0.05, 0.09, { wave: "triangle", slideTo: -40, volume: 0.3 }]],
    noises: [[0.05, 0.06, { filter: "lowpass", frequency: 1800, volume: 0.35 }]],
  },
  // the kick whooshes through the air before the heavier thud lands
  kick: {
    wave: "square",
    volume: 0.05,
    notes: [[-28, 0.22, 0.12, { wave: "triangle", slideTo: -44, volume: 0.34 }]],
    noises: [
      [0, 0.2, { filter: "bandpass", frequency: 900, sweepTo: 3200, volume: 0.18 }],
      [0.22, 0.07, { filter: "lowpass", frequency: 1500, volume: 0.4 }],
    ],
  },
  // the finisher: a rising whoosh, the big hit at the top, and the coins spill out once he lands
  shoryuken: {
    wave: "square",
    volume: 0.05,
    notes: [
      [-12, 0.12, 0.3, { slideTo: 12, volume: 0.04 }],
      [-26, 0.4, 0.16, { wave: "triangle", slideTo: -46, volume: 0.36 }],
      [14, 0.9, 0.07],
      [19, 0.97, 0.4],
    ],
    noises: [
      [0.1, 0.3, { filter: "bandpass", frequency: 600, sweepTo: 4000, volume: 0.2 }],
      [0.4, 0.08, { filter: "lowpass", frequency: 1800, volume: 0.45 }],
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

/**
 * Plays a synth recipe right now, unless sound is muted or the browser has no Web Audio.
 * @param {{ wave: string, volume: number, notes: Array, noises?: Array }} recipe the notes and noises to play
 */
export const playRecipe = (recipe) => {
  if (!recipe || isMuted) return;

  try {
    const context = getAudioContext();
    if (!context) return;
    recipe.notes.forEach((note) => playNote(context, recipe, note));
    recipe.noises?.forEach((noise) => playNoise(context, noise));
  } catch {
    // no sound is fine, the moment still plays without it
  }
};

/**
 * Plays one of the page's own sounds by name, like the avatar's jab.
 * @param {keyof UI_SOUNDS} name the sound
 */
export const playSound = (name) => playRecipe(UI_SOUNDS[name]);
