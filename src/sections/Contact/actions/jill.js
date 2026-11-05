// the combo she throws at a bug, one move after the other
const COMBO = ["punch", "kick", "roundhouse"];

/**
 * Where Jill starts: walking in, unless the visitor asked for less movement, then already standing in place.
 * @param {boolean} isStill whether to skip the walk in
 * @returns {{ pose: string, queue: string[], isHairDown: boolean, hasArrived: boolean, take: number }}
 *   take counts every pose she plays, so the same move asked for twice still plays twice
 */
export const jillStart = (isStill = false) => ({ pose: isStill ? "idle" : "walk", queue: [], isHairDown: false, hasArrived: isStill, take: 0 });

/**
 * @param {string} pose
 * @returns {boolean} whether she's in the middle of the combo
 */
export const isAttacking = (pose) => COMBO.includes(pose);

const restPose = (state) => (state.isHairDown ? "hairDown" : "idle");
const play = (state, pose, queue = []) => ({ ...state, pose, queue, take: state.take + 1 });
const isBusy = (state) => !state.hasArrived || isAttacking(state.pose) || state.pose === "beret";
const hasMissionStarted = (state) => state.isHairDown || state.pose === "beret" || state.queue.includes("beret");

const playNext = (state) => (state.queue.length > 0 ? play(state, state.queue[0], state.queue.slice(1)) : play(state, restPose(state)));

// taking the beret off is a once per visit moment. if she's busy it waits its turn
const completeMission = (state) => {
  if (hasMissionStarted(state)) return state;
  if (isBusy(state)) return { ...state, queue: [...state.queue, "beret"] };
  return play(state, "beret");
};

const finishPose = (state) => playNext({ ...state, isHairDown: state.isHairDown || state.pose === "beret" });

const arrive = (state) => (state.hasArrived ? state : playNext({ ...state, hasArrived: true }));

/**
 * Jill's next pose after something happens: she arrives, gets a reaction cue, is asked to fight, finishes a move or
 * reaches the end of the page. Reactions and combos never cut into a combo or into her taking off the beret.
 * @param {ReturnType<typeof jillStart>} state where she is now
 * @param {{ type: "arrive" | "cue" | "combo" | "ended" | "missionComplete", name?: string }} event name is the reaction for a cue
 * @returns {ReturnType<typeof jillStart>} where she is next
 */
export const jillStep = (state, event) => {
  if (event.type === "arrive") return arrive(state);
  if (event.type === "ended") return finishPose(state);
  if (event.type === "missionComplete") return completeMission(state);
  if (isBusy(state)) return state;
  if (event.type === "cue") return play(state, event.name);
  if (event.type === "combo") return play(state, COMBO[0], COMBO.slice(1));
  return state;
};

// the least time she spends on stage before the mission can end, long enough for at least one bug to show up
const MIN_STAGE_MS = 10000;

/**
 * How long to wait before the mission ends, once the last line has been reached: none if she has already had her time
 * on stage, otherwise whatever is left of it. On a short phone page the last line shows up together with her, and
 * without this she'd take her beret off before a single bug got there.
 * @param {number} arrivedAt when she finished walking in, in ms
 * @param {number} now the current time in ms
 * @param {number} minMs the least time on stage
 * @returns {number} ms to wait
 */
export const missionDelay = (arrivedAt, now, minMs = MIN_STAGE_MS) => Math.max(0, arrivedAt + minMs - now);

/**
 * What a finished move does to the bug in front of her.
 * @param {string} pose the move that just finished
 * @returns {"spark" | "squash" | null} the first hits spark, the last one squashes, anything else doesn't touch it
 */
export const hitFor = (pose) => {
  if (pose === "roundhouse") return "squash";
  if (pose === "punch" || pose === "kick") return "spark";
  return null;
};
