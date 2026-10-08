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

// each note is [semitones from A4, start in seconds, length in seconds]
export const SOUNDS = {
  triforce: {
    wave: "triangle",
    volume: 0.18,
    notes: [
      [3, 0, 0.14],
      [7, 0.12, 0.14],
      [10, 0.24, 0.14],
      [15, 0.36, 0.6],
    ],
  },
  umbrella: {
    wave: "sawtooth",
    volume: 0.06,
    notes: [
      [-17, 0, 0.9],
      [-22, 0.35, 1.1],
    ],
  },
  bonfire: {
    wave: "sine",
    volume: 0.14,
    crackle: 1.6,
    notes: [
      [-21, 0, 1.6],
      [-14, 0.08, 1.5],
      [-9, 0.16, 1.4],
    ],
  },
};

const playNote = (context, { wave, volume }, [semitones, start, length]) => {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startAt = context.currentTime + start;

  oscillator.type = wave;
  oscillator.frequency.value = noteFrequency(semitones);

  // quick attack and a soft tail, otherwise every note starts and stops with a click
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);

  oscillator.connect(gain).connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + length + 0.05);
};

// random pops in a noise buffer, close enough to wood in a fire
const playCrackle = (context, seconds) => {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) {
    const isPop = Math.random() < 0.0015;
    samples[index] = isPop ? (Math.random() * 2 - 1) * 0.5 : (Math.random() * 2 - 1) * 0.01;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start();
};

export const playSound = (name) => {
  const sound = SOUNDS[name];
  if (!sound) return;

  try {
    const context = getAudioContext();
    if (!context) return;
    sound.notes.forEach((note) => playNote(context, sound, note));
    if (sound.crackle) playCrackle(context, sound.crackle);
  } catch {
    // no sound is fine, the egg still works without it
  }
};
