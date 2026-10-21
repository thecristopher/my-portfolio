import { createStore } from "./store";

// which relic's moment is playing right now. only one at a time, so two can never stack over each other
const stage = createStore(null);

/**
 * Puts a relic's moment on screen, unless another one is still playing.
 * @param {string} id relic id
 * @param {{ isFirstFind: boolean }} details whether this is the first time it was found
 * @returns {boolean} whether it got the stage
 */
export const stageRelic = (id, { isFirstFind = false } = {}) => {
  if (stage.get()) return false;
  stage.set({ id, isFirstFind, key: `${id}-${Date.now()}` });
  return true;
};

/** Takes whatever is playing off the stage. */
export const clearStage = () => stage.set(null);

/** @returns {{ id: string, isFirstFind: boolean, key: string } | null} the relic playing now */
export const useStagedRelic = () => stage.use();

/** @returns {boolean} whether a relic's moment is playing */
export const isStageBusy = () => Boolean(stage.get());
