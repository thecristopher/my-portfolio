// the combo she throws at an enemy at her feet, one move after the other
const COMBO = ["punch", "kick", "roundhouse"];

// the move she makes from across the stage, for an enemy that hasn't reached her yet, or any dog
const SHOT = "shoot";

// how her mission ends: the Tyrant breaks out of the ground, she hoists the rocket launcher, aims and fires, then takes
// her beret off. anyone who asked for less movement gets just the beret
const FINALE = ["rocketRaise", "rocketAim", "beret"];
const STILL_FINALE = ["beret"];

// what she says over the arena for the moves that talk, written for whoever is about to send the email
const LINES = {
  point: "Need to reach Cristopher? That address up there is the way in.",
  radio: "Jill here. Send it, he answers every message.",
  happy: "Address copied. Go write him, I'll cover you.",
  shoot: "Down. Nothing gets between you and that inbox.",
  rocketRaise: "A Tyrant. Of course it's a Tyrant. Stand back.",
  down: "I'm hit... send him that email for me.",
  beret: "Mission complete. He'll take it from here.",
};

/**
 * The line Jill says when she starts a move, like a radio call in the corner of the screen.
 * @param {string} pose the move she just started
 * @returns {string | null} what she says, null for the moves she makes in silence
 */
export const lineFor = (pose) => LINES[pose] ?? null;

// every action on the contact section she answers, with the move she makes and what she says over it
const CUES = {
  address: { pose: "point", line: LINES.point },
  compose: { pose: "radio", line: LINES.radio },
  send: { pose: "happy", line: "Mail app's opening. Go on, I'll hold the line." },
  copy: { pose: "happy", line: LINES.happy },
  handCopy: { pose: "happy", line: "Copied it by hand. Old school, I like that." },
  start: { pose: "radio", line: "Jill here. Something's moving out there. Cover me." },
};

/**
 * What Jill does for an action on the contact section: the move and the line that goes with it. A social link gets a
 * herb for the road, named after where it leads. Any other name is played as the move of that name.
 * @param {string} name the action, like "copy", "social" or a move such as "herb"
 * @param {string} [detail] the social network, for a social cue
 * @returns {{ pose: string, line: string | null }}
 */
export const cueFor = (name, detail) => {
  if (name === "social") return { pose: "herb", line: `He's on ${detail ?? "there"} too. Take a herb for the road.` };
  return CUES[name] ?? { pose: name, line: lineFor(name) };
};

/**
 * Where Jill starts: dashing in and then pointing up at the email, unless the visitor asked for less movement, then
 * already standing in place.
 * @param {boolean} isStill whether to skip the entrance
 * @param {number} take where her move count starts, so a fresh life still plays every move fresh
 * @returns {{ pose: string, queue: string[], isHairDown: boolean, isDown: boolean, hasArrived: boolean, take: number, said: string | null, isStill: boolean }}
 *   take counts every pose she plays, so the same move asked for twice still plays twice, said is the line she opened
 *   the pose with, isDown whether she's out of health on the floor, isStill whether she skips the big moves
 */
export const jillStart = (isStill = false, take = 0) => ({
  pose: isStill ? "idle" : "dash",
  queue: isStill ? [] : ["point"],
  isHairDown: false,
  isDown: false,
  hasArrived: isStill,
  take,
  said: null,
  isStill,
});

/**
 * @param {string} pose the move she's making
 * @returns {boolean} whether it's the aim the rocket leaves the launcher from
 */
export const firesRocket = (pose) => pose === "rocketAim";

/**
 * @param {string} pose
 * @returns {boolean} whether she's in the middle of the combo or a shot
 */
export const isAttacking = (pose) => COMBO.includes(pose) || pose === SHOT;

const restPose = (state) => (state.isHairDown ? "hairDown" : "idle");
const play = (state, pose, queue = [], said = lineFor(pose)) => ({ ...state, pose, queue, take: state.take + 1, said });
const isFinale = (pose) => FINALE.includes(pose);
const isBusy = (state) => !state.hasArrived || state.isDown || isAttacking(state.pose) || isFinale(state.pose) || state.pose === "dash";
const hasMissionStarted = (state) => state.isHairDown || isFinale(state.pose) || state.queue.some(isFinale);
const isResting = (state) => state.hasArrived && state.pose === restPose(state);
// once the beret is off or on its way she's off duty: every other move has her beret on, so she stops making them
const isOffDuty = (state) => hasMissionStarted(state);

const playNext = (state) => (state.queue.length > 0 ? play(state, state.queue[0], state.queue.slice(1)) : play(state, restPose(state)));

// the finale is a once per visit moment. whatever she's in the middle of, even a quick reaction, plays out first and
// the finale waits its turn
const completeMission = (state) => {
  if (hasMissionStarted(state)) return state;
  const finale = state.isStill ? STILL_FINALE : FINALE;
  if (!isResting(state)) return { ...state, queue: [...state.queue, ...finale] };
  return play(state, finale[0], finale.slice(1));
};

// on the floor she stays down, the last frame holding, until she gets another life
const finishPose = (state) => (state.isDown ? state : playNext({ ...state, isHairDown: state.isHairDown || state.pose === "beret" }));

// a bite only shows when she's free to flinch: in the middle of a move she takes it without breaking stride
const flinch = (state) => (isBusy(state) || isOffDuty(state) ? state : play(state, "hurt", [], null));

const fall = (state) => (state.isDown ? state : { ...play(state, "down"), isDown: true });

// the dash lands her on her spot a moment before its last frames finish, so she arrives without cutting it short
const arrive = (state) => {
  if (state.hasArrived) return state;
  if (state.pose === "dash") return { ...state, hasArrived: true };
  return playNext({ ...state, hasArrived: true });
};

const playCue = (state, cue) => play(state, cue.pose, [], cue.line);

/**
 * Jill's next pose after something happens: she arrives, gets a reaction cue, is asked to fight, takes a bite, runs
 * out of health, gets another life, finishes a move or completes the mission. Reactions and combos never cut into a
 * combo or into the finale, and once the mission is complete she takes down the Tyrant with the rocket launcher and
 * stands down with her hair down for good.
 * @param {ReturnType<typeof jillStart>} state where she is now
 * @param {{ type: "arrive" | "cue" | "combo" | "hurt" | "die" | "revive" | "ended" | "missionComplete", name?: string, detail?: string, isFar?: boolean }} event
 *   name and detail are the action for a cue (see cueFor), isFar sends a shot at an enemy still coming instead of the combo
 * @returns {ReturnType<typeof jillStart>} where she is next
 */
export const jillStep = (state, event) => {
  if (event.type === "arrive") return arrive(state);
  if (event.type === "ended") return finishPose(state);
  if (event.type === "missionComplete") return completeMission(state);
  if (event.type === "die") return fall(state);
  if (event.type === "revive") return jillStart(state.isStill, state.take + 1);
  if (event.type === "hurt") return flinch(state);
  if (isBusy(state) || isOffDuty(state)) return state;
  if (event.type === "cue") return playCue(state, cueFor(event.name, event.detail));
  if (event.type === "combo" && event.isFar) return play(state, SHOT);
  if (event.type === "combo") return play(state, COMBO[0], COMBO.slice(1));
  return state;
};

/**
 * What a finished move does to the enemy in front of her.
 * @param {string} pose the move that just finished
 * @returns {"spark" | "down" | null} the first hits spark, the last one takes it down, anything else doesn't touch it
 */
export const hitFor = (pose) => {
  if (pose === "roundhouse" || pose === SHOT) return "down";
  if (pose === "punch" || pose === "kick") return "spark";
  return null;
};

