// how many shots it takes to defeat the larva
export const HITS_TO_DEFEAT = 3;

/**
 * A tool for the larva to hide behind, never the one it just fled from.
 * @param {string[]} names the tools it can hide behind
 * @param {string | null} fleeing the tool it's leaving, null when it has none yet
 * @param {() => number} random a number from 0 up to 1
 * @returns {string | null} null when there's nowhere else to go
 */
export const pickHideout = (names, fleeing, random = Math.random) => {
  const options = names.filter((name) => name !== fleeing);
  if (options.length === 0) return null;
  return options[Math.floor(random() * options.length)];
};

/**
 * Where the hunt starts: the larva behind one of the tools, never hit yet.
 * @param {string[]} names the tools it can hide behind
 * @param {() => number} random a number from 0 up to 1
 * @returns {{ hideout: string | null, hits: number, isDefeated: boolean }}
 */
export const huntStart = (names, random = Math.random) => ({ hideout: pickHideout(names, null, random), hits: 0, isDefeated: false });

/**
 * The hunt after a tool is opened, which is Samus shooting at it. Opening the larva's tool hits it, and it flees
 * behind another tool until the last hit defeats it. Opening any other tool changes nothing.
 * @param {ReturnType<typeof huntStart>} state the hunt now
 * @param {string} name the tool that was opened
 * @param {string[]} names the tools it can flee to
 * @param {() => number} random a number from 0 up to 1
 * @returns {ReturnType<typeof huntStart>} the hunt next
 */
export const huntStep = (state, name, names, random = Math.random) => {
  if (state.isDefeated || name !== state.hideout) return state;
  const hits = state.hits + 1;
  if (hits >= HITS_TO_DEFEAT) return { hideout: null, hits, isDefeated: true };
  return { ...state, hits, hideout: pickHideout(names, name, random) };
};

/**
 * The mission briefing over the orbit: how to hurt the larva while it's still out there, and the win once it's down.
 * @param {ReturnType<typeof huntStart>} state the hunt
 * @returns {{ title: string, hint: string | null }}
 */
export const huntBriefing = (state) => {
  if (state.isDefeated) return { title: "Metroid defeated", hint: null };
  return { title: "Metroid detected", hint: state.hits === 0 ? "Hit it when it peeks out" : "It moved. Find it again" };
};

/**
 * What the statusline says when the hunt is won. Every hit before that plays out in the opened card itself.
 * @param {ReturnType<typeof huntStart>} state the hunt
 * @returns {string | null} null until the larva is defeated
 */
export const huntLine = (state) => (state.isDefeated ? "Metroid defeated. Mission complete, Samus is heading home." : null);

// what plays in an opened card that hid the larva, each part with the moment it ends, in ms after the card opens. the
// card takes a moment to fly in, so nothing starts before it's there. a hit is a beam from the arm cannon, the last hit
// is her screw attack, spinning up through the larva
const SHOT = [
  { stage: "arriving", until: 1150 },
  { stage: "aiming", until: 1500 },
  { stage: "firing", until: 1800 },
  { stage: "hurt", until: 2800 },
  { stage: "leaving", until: 3500 },
];
const SCREW_ATTACK = [
  { stage: "arriving", until: 1150 },
  { stage: "leaping", until: 1600 },
  { stage: "striking", until: 2300 },
  { stage: "falling", until: 2800 },
  { stage: "leaving", until: 3500 },
];

const scriptFor = (isFinisher) => (isFinisher ? SCREW_ATTACK : SHOT);

/**
 * Where the fight in an opened card is a while after it opens. A hit: the card arriving, Samus taking aim, her beam
 * flying, the larva hurt with its hull flickering, then fleeing. The last hit: the card arriving, her leap, the screw
 * attack tearing through the larva, her fall back down, the larva burning away. Then just the result.
 * @param {number} elapsed ms since the card opened
 * @param {boolean} isFinisher whether this is the hit that defeats it
 * @returns {"arriving" | "aiming" | "firing" | "hurt" | "leaping" | "striking" | "falling" | "leaving" | "done"}
 */
export const encounterStage = (elapsed, isFinisher = false) => scriptFor(isFinisher).find((part) => elapsed < part.until)?.stage ?? "done";

/**
 * When each part of the fight in a card starts, so a timer can wake for every one.
 * @param {boolean} isFinisher whether this is the hit that defeats it
 * @returns {number[]} ms after the card opens
 */
export const encounterCues = (isFinisher = false) => [0, ...scriptFor(isFinisher).map((part) => part.until)];

/**
 * Whether the hit has landed by a stage of the fight, so the result can show.
 * @param {ReturnType<typeof encounterStage>} stage
 * @returns {boolean}
 */
export const hasLanded = (stage) => ["hurt", "striking", "falling", "leaving", "done"].includes(stage);

/**
 * The result the card shows once the shot lands.
 * @param {{ hits: number, isDefeated: boolean }} encounter the hunt right after this hit
 * @returns {string}
 */
export const encounterLine = ({ hits, isDefeated }) => (isDefeated ? "Metroid defeated" : `Hit ${hits} of ${HITS_TO_DEFEAT}`);

/**
 * The larva's energy after a hit, one entry per hit it can take, true while that one is left.
 * @param {number} hits how many hits it has taken
 * @returns {boolean[]}
 */
export const energyLeft = (hits) => Array.from({ length: HITS_TO_DEFEAT }, (_, index) => index >= hits);
