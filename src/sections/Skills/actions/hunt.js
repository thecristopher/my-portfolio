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
 * The hunt after one of her shots lands. A shot on the larva's tool hits it, and it flees behind another tool until
 * the last hit defeats it. A shot anywhere else changes nothing.
 * @param {ReturnType<typeof huntStart>} state the hunt now
 * @param {string} name the tool the shot landed on
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
 * What the statusline says after a hit: the first one, so the visitor knows there's a hunt on, and the last one. The
 * hits between speak for themselves when the larva flees, and saying them too would pile the messages up.
 * @param {ReturnType<typeof huntStart>} state the hunt right after the hit
 * @returns {string | null} null for a hit that goes without a word
 */
export const huntLine = (state) => {
  if (state.isDefeated) return "Metroid defeated. Mission complete, Samus is heading home.";
  if (state.hits === 1) return `Metroid hit, 1 of ${HITS_TO_DEFEAT}. It fled behind another tool.`;
  return null;
};
