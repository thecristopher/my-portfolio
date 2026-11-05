// the combo she throws at a bug, one move after the other
const COMBO = ["punch", "kick", "roundhouse"];

// the moves she makes from across the stage, for a bug that hasn't reached her yet
const SHOT = "shoot";

/**
 * Where Jill starts: dashing in and then pointing up at the email, unless the visitor asked for less movement, then
 * already standing in place.
 * @param {boolean} isStill whether to skip the entrance
 * @returns {{ pose: string, queue: string[], isHairDown: boolean, hasArrived: boolean, take: number }}
 *   take counts every pose she plays, so the same move asked for twice still plays twice
 */
export const jillStart = (isStill = false) => ({
  pose: isStill ? "idle" : "dash",
  queue: isStill ? [] : ["point"],
  isHairDown: false,
  hasArrived: isStill,
  take: 0,
});

/**
 * @param {string} pose
 * @returns {boolean} whether she's in the middle of the combo or a shot
 */
export const isAttacking = (pose) => COMBO.includes(pose) || pose === SHOT;

const restPose = (state) => (state.isHairDown ? "hairDown" : "idle");
const play = (state, pose, queue = []) => ({ ...state, pose, queue, take: state.take + 1 });
const isBusy = (state) => !state.hasArrived || isAttacking(state.pose) || state.pose === "beret" || state.pose === "dash";
const hasMissionStarted = (state) => state.isHairDown || state.pose === "beret" || state.queue.includes("beret");

const playNext = (state) => (state.queue.length > 0 ? play(state, state.queue[0], state.queue.slice(1)) : play(state, restPose(state)));

// taking the beret off is a once per visit moment. if she's busy it waits its turn
const completeMission = (state) => {
  if (hasMissionStarted(state)) return state;
  if (isBusy(state)) return { ...state, queue: [...state.queue, "beret"] };
  return play(state, "beret");
};

const finishPose = (state) => playNext({ ...state, isHairDown: state.isHairDown || state.pose === "beret" });

// the dash lands her on her spot a moment before its last frames finish, so she arrives without cutting it short
const arrive = (state) => {
  if (state.hasArrived) return state;
  if (state.pose === "dash") return { ...state, hasArrived: true };
  return playNext({ ...state, hasArrived: true });
};

/**
 * Jill's next pose after something happens: she arrives, gets a reaction cue, is asked to fight, finishes a move or
 * reaches the end of the page. Reactions and combos never cut into a combo or into her taking off the beret.
 * @param {ReturnType<typeof jillStart>} state where she is now
 * @param {{ type: "arrive" | "cue" | "combo" | "ended" | "missionComplete", name?: string, isFar?: boolean }} event name is the
 *   reaction for a cue, isFar sends a shot at a bug still crawling instead of the combo
 * @returns {ReturnType<typeof jillStart>} where she is next
 */
export const jillStep = (state, event) => {
  if (event.type === "arrive") return arrive(state);
  if (event.type === "ended") return finishPose(state);
  if (event.type === "missionComplete") return completeMission(state);
  if (isBusy(state)) return state;
  if (event.type === "cue") return play(state, event.name);
  if (event.type === "combo" && event.isFar) return play(state, SHOT);
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
  if (pose === "roundhouse" || pose === SHOT) return "squash";
  if (pose === "punch" || pose === "kick") return "spark";
  return null;
};

// what she says over the arena for the moves that talk, written for whoever is about to send the email
const LINES = {
  point: "Need to reach Cristopher? That address up there is the way in.",
  radio: "Jill here. Send it, he answers every message.",
  happy: "Address copied. Go write him, I'll cover you.",
  shoot: "Bug down. Nothing gets between you and that inbox.",
  beret: "Mission complete. Thanks for reading all the way down.",
};

/**
 * The line Jill says when she starts a move, like a radio call in the corner of the screen.
 * @param {string} pose the move she just started
 * @returns {string | null} what she says, null for the moves she makes in silence
 */
export const lineFor = (pose) => LINES[pose] ?? null;
