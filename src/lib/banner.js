import { createStore } from "./store";

// the Elden Ring banners from Eldentree's core/banner, timed the same way: how long each stays up, how fast its
// letters wake, and whether a thin rule glows under the words
export const BANNER_KINDS = {
  felled: { text: "ENEMY FELLED", tone: "accent", durationMs: 3200, staggerMs: 40, rule: false },
  great: { text: "GREAT ENEMY FELLED", tone: "accent", durationMs: 3800, staggerMs: 35, rule: true },
  // death never hurries, the whole word seeps in at once
  died: { text: "YOU DIED", tone: "error", durationMs: 4200, staggerMs: 0, rule: false },
  grace: { text: "LOST GRACE DISCOVERED", tone: "accent", durationMs: 3200, staggerMs: 30, rule: true },
  relic: { text: "RELIC DISCOVERED", tone: "accent", durationMs: 3000, staggerMs: 30, rule: true },
  // area names hang lightly over the world instead of blotting it out
  region: { text: "", tone: "fg", durationMs: 2800, staggerMs: 45, rule: true, isLight: true },
};

const banner = createStore(null);

/**
 * "ENEMY FELLED" becomes "E N E M Y   F E L L E D", the way the game letterspaces it.
 * @param {string} text the banner words
 * @returns {string[]} one entry per letter, three spaces between words
 */
export const spacedLetters = (text = "") =>
  text
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word, index) => (index === 0 ? [...word] : [" ", " ", ...word]));

/**
 * Fires a banner across the middle of the screen. A newer one replaces whatever is up.
 * @param {keyof BANNER_KINDS} kind which banner
 * @param {{ text?: string, subtitle?: string }} overrides custom words, like a region's name
 */
export const showBanner = (kind, overrides = {}) => {
  const base = BANNER_KINDS[kind];
  if (!base) return;
  banner.set({ ...base, ...overrides, kind, id: `${kind}-${Date.now()}` });
};

export const clearBanner = () => banner.set(null);

/** @returns {object | null} the banner on screen right now */
export const useBanner = () => banner.use();
