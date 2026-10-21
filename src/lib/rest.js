import { createStore } from "./store";

// Eldentree's core/rest: leave the editor alone long enough and it rests at a site of grace. any key wakes it
export const REST_AFTER_MS = 90_000;

const resting = createStore(false);

/** Sits down at the grace right now. */
export const startRest = () => resting.set(true);

/** Gets back up. */
export const endRest = () => resting.set(false);

/** @returns {boolean} whether the page is resting */
export const useResting = () => resting.use();

/**
 * Whether it's time to rest: nothing touched for long enough, and nothing else on screen that needs the page.
 * @param {{ idleMs: number, isBusy: boolean, isHidden: boolean }} state how long since the last input, and what's open
 * @returns {boolean}
 */
export const shouldRest = ({ idleMs, isBusy, isHidden }) => !isBusy && !isHidden && idleMs >= REST_AFTER_MS;
