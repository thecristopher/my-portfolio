// the boot screen plays once per visit, before the hero. everything in the hero waits for it through INTRO_S,
// so the page still opens in the same order, just after the editor has "started"
const SEEN_KEY = "booted";

const hasBooted = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "true";
  } catch {
    // no storage, no way to remember it played: skip it rather than replay it on every load
    return true;
  }
};

const prefersReducedMotion = () => globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? true;

export const SHOWS_SPLASH = typeof window !== "undefined" && !hasBooted() && !prefersReducedMotion();

// how long the boot screen holds before it hands over to the hero, in seconds
export const SPLASH_HOLD_S = 2.4;
export const INTRO_S = SHOWS_SPLASH ? SPLASH_HOLD_S + 0.35 : 0;

export const markBooted = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, "true");
  } catch {
    // nothing to remember it with, it simply plays again next visit
  }
};
