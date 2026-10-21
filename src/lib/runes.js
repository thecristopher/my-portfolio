import { createStore } from "./store";

// the rune tally from Eldentree's lualine, earned here by exploring instead of saving files
export const RUNE_PAYOUTS = {
  section: 200,
  relic: 2500,
  resume: 5000,
  contact: 1500,
  complete: 50000,
};

const runes = createStore({ total: 0, paid: [] }, {
  storageKey: "runes",
  read: (saved) => ({ total: Number(saved?.total) || 0, paid: Array.isArray(saved?.paid) ? saved.paid : [] }),
});

/**
 * Pays runes for something done once, so scrolling back past a section never pays twice.
 * @param {{ total: number, paid: string[] }} tally the runes so far
 * @param {string} kind which payout, a key of RUNE_PAYOUTS
 * @param {string} id what was done, like "section:work" or "relic:grace"
 * @returns {{ tally: object, earned: number }} the new tally and how many runes it added
 */
export const payOnce = (tally, kind, id) => {
  const amount = RUNE_PAYOUTS[kind] ?? 0;
  if (!amount || tally.paid.includes(id)) return { tally, earned: 0 };
  return { tally: { total: tally.total + amount, paid: [...tally.paid, id] }, earned: amount };
};

/**
 * Formats runes like the game's counter: grouped thousands, no decimals.
 * @param {number} total the rune count
 * @returns {string} like "12,450"
 */
export const formatRunes = (total) => Math.round(total).toLocaleString("en-US");

const earnListeners = new Set();

/**
 * Earns runes for a one time event and tells the statusline how many just came in.
 * @param {string} kind which payout, a key of RUNE_PAYOUTS
 * @param {string} id what was done, unique per event
 * @returns {number} the runes earned, 0 when this was already paid
 */
export const earnRunes = (kind, id) => {
  const { tally, earned } = payOnce(runes.get(), kind, id);
  if (earned > 0) {
    runes.set(tally);
    earnListeners.forEach((listener) => listener(earned));
  }
  return earned;
};

/** @returns {number} the live rune total */
export const useRunes = () => runes.use().total;

/**
 * Listens for runes coming in, so the counter can flash the amount like the game does.
 * @param {(earned: number) => void} listener called with each payout
 * @returns {() => void} stops listening
 */
export const onRunesEarned = (listener) => {
  earnListeners.add(listener);
  return () => earnListeners.delete(listener);
};
