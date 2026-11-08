// how much health Jill starts every life with
export const MAX_HEALTH = 100;

// how many enemies she has to take down to draw out the Tyrant
export const TAKEDOWNS_TO_WIN = 3;

// how hard each kind bites while it's at her feet, every time the bite comes around. a dog bites harder than a zombie
const BITE = { zombie: 6, cerberus: 9 };

// how often whatever is at her feet gets a bite in, in ms
export const BITE_EVERY_MS = 1500;

/**
 * Where a visit starts: calm, full health, nothing taken down. The fight only starts when the visitor asks for it, so
 * every reaction she has to the page plays out in peace until then.
 * @returns {{ phase: "calm" | "fight" | "down" | "won", health: number, takedowns: number, life: number }}
 *   life counts every retry, so her entrance can play again for each one
 */
export const survivalStart = () => ({ phase: "calm", health: MAX_HEALTH, takedowns: 0, life: 0 });

/**
 * How much health she loses to one round of bites: every enemy waiting at her feet bites once.
 * @param {{ kind: "zombie" | "cerberus", status: string }[]} enemies every enemy on screen
 * @returns {number} the damage, 0 when nothing has reached her
 */
export const biteDamage = (enemies) => enemies.filter((enemy) => enemy.status === "waiting").reduce((total, enemy) => total + BITE[enemy.kind], 0);

const bite = (state, damage) => {
  const health = Math.max(0, state.health - damage);
  return { ...state, health, phase: health === 0 ? "down" : state.phase };
};

const takedown = (state) => {
  const takedowns = state.takedowns + 1;
  return { ...state, takedowns, phase: takedowns >= TAKEDOWNS_TO_WIN ? "won" : state.phase };
};

// each event only means something in one phase, everything else leaves the state as it was
const STEPS = {
  start: { calm: (state) => ({ ...state, phase: "fight" }) },
  bite: { fight: (state, event) => bite(state, event.damage) },
  takedown: { fight: takedown },
  retry: { down: (state) => ({ ...survivalStart(), phase: "fight", life: state.life + 1 }) },
};

/**
 * The fight after something happens: the visitor starts it, an enemy bites, one goes down, or she gets back up.
 * Health running out puts her down, the last takedown wins it, and a retry starts the fight over at full health.
 * @param {ReturnType<typeof survivalStart>} state the fight now
 * @param {{ type: "start" | "bite" | "takedown" | "retry", damage?: number }} event damage is how hard a bite hit
 * @returns {ReturnType<typeof survivalStart>} the fight next
 */
export const survivalStep = (state, event) => STEPS[event.type]?.[state.phase]?.(state, event) ?? state;

/**
 * What the ECG monitor reads, the way the first Resident Evil reads health: Fine, then Caution, then Danger.
 * @param {number} health
 * @returns {"fine" | "caution" | "danger"}
 */
export const conditionFor = (health) => {
  if (health > 60) return "fine";
  return health > 25 ? "caution" : "danger";
};

/**
 * What the mission readout under the ground says for where the fight is.
 * @param {{ phase: "calm" | "fight" | "down" | "won", tyrant: "emerge" | "roar" | "hit" | null }} mission tyrant is
 *   where he is, null before he shows up or when he never does
 * @returns {string}
 */
export const missionLine = ({ phase, tyrant }) => {
  if (phase === "calm") return "Click Jill to start the mission";
  if (phase === "fight") return `Take down ${TAKEDOWNS_TO_WIN} to draw out the Tyrant`;
  if (phase === "down") return "You died";
  return tyrant === "emerge" || tyrant === "roar" ? "Tyrant incoming" : "Mission complete";
};
