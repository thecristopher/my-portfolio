import { markFound, useFoundRelics } from "../../lib/relics";
import { isStageBusy, stageRelic } from "../../lib/relicStage";
import { playRecipe } from "../../lib/sound";
import { RELIC_SOUNDS } from "./registry";

/**
 * Touches a relic: remembers it, plays its jingle and puts its moment on screen.
 * Touching a found relic replays the moment, it's too good to see once.
 * @param {string} id relic id
 * @param {{ withSound?: boolean }} options a moment that plays its own sound in step with the visuals skips this one
 * @returns {boolean} whether the moment got the stage
 */
export const touchRelic = (id, { withSound = true } = {}) => {
  if (isStageBusy()) return false;
  const isFirstFind = markFound(id);
  if (withSound) playRecipe(RELIC_SOUNDS[id]);
  return stageRelic(id, { isFirstFind });
};

/**
 * A relic's live state for its trigger.
 * @param {string} id relic id
 * @returns {{ isFound: boolean, touch: (options?: { withSound?: boolean }) => boolean }}
 */
export const useRelic = (id) => {
  const found = useFoundRelics();
  return { isFound: found.includes(id), touch: (options) => touchRelic(id, options) };
};
