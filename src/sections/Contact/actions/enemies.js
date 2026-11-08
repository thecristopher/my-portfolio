// how much ground each kind of enemy covers in front of it at 1x, its body from back to front, so each one stops with
// its front right where her moves land
const BODY_WIDTH = { zombie: 70, cerberus: 140 };

// how fast each kind comes at her at 1x, in px a second. both move exactly as far as their frames step, fps times
// stride, so their feet never slide
const SPEED = { zombie: 35, cerberus: 250 };

// the order they come in: a slow zombie first, so the first takedown is easy to learn, then a Cerberus to keep it tense
const ORDER = ["zombie", "cerberus"];

// the most enemies on her at once, so the corner never turns into a swarm
export const MAX_ENEMIES = 3;

// how far in front of her an enemy stops, close enough for the punch to land, in px
const REACH = 58;

/**
 * Which kind of enemy comes next: a zombie, then a Cerberus, taking turns, so anyone who plays a few rounds meets both.
 * @param {number} spawned how many enemies have come so far
 * @returns {"zombie" | "cerberus"}
 */
export const pickKind = (spawned = 0) => ORDER[spawned % ORDER.length];

/**
 * How wide an enemy's body is on screen.
 * @param {"zombie" | "cerberus"} kind
 * @param {number} scale how big the stage is drawn
 * @returns {number} px
 */
export const bodyWidth = (kind, scale = 1) => BODY_WIDTH[kind] * scale;

/**
 * How long until the next enemy comes in: quick enough that there's always something to shoot, loose enough that it
 * never feels like a metronome.
 * @param {number} roll a random number from 0 to 1
 * @param {{ min?: number, max?: number }} options the shortest and longest wait in ms
 * @returns {number} milliseconds
 */
export const nextEnemyWait = (roll, { min = 2500, max = 4000 } = {}) => Math.round(min + roll * (max - min));

/**
 * Where an enemy stops coming: its back edge, right in front of Jill, who stands at the far right of the stage facing
 * left.
 * @param {number} cornerWidth the width of the stage the enemies cross, in px
 * @param {number} jillFront how far her body's middle stands from the stage's right edge, in px
 * @param {number} enemyWidth the width of the enemy's body, in px
 * @param {number} scale how big Jill is drawn, since her reach grows with her
 * @returns {number} the enemy's back edge in px, never past the start of the stage
 */
export const enemyStop = (cornerWidth, jillFront, enemyWidth, scale = 1) => Math.max(0, cornerWidth - jillFront - REACH * scale - enemyWidth);

const isAlive = (enemy) => enemy.status !== "down";

/**
 * Which enemy her moves land on: the one clicked if it's still up, otherwise the first one to arrive.
 * @param {{ id: number, status: string }[]} enemies every enemy on screen
 * @param {number | null} clickedId the enemy that was clicked, null when Jill was
 * @returns {number | null} the enemy's id, null when there's nothing left to hit
 */
export const pickTarget = (enemies, clickedId = null) => {
  const alive = enemies.filter(isAlive);
  const clicked = alive.find((enemy) => enemy.id === clickedId);
  return (clicked ?? alive[0])?.id ?? null;
};

/**
 * @param {{ status: string }[]} enemies every enemy on screen
 * @returns {number} how many are still coming or waiting
 */
export const aliveCount = (enemies) => enemies.filter(isAlive).length;

/**
 * Whether she meets an enemy with the handgun instead of the combo: anything still on its way, and a Cerberus always,
 * since nobody trades kicks with a zombie dog.
 * @param {{ kind: string, status: string } | undefined} enemy the enemy she's going after
 * @returns {boolean}
 */
export const needsHandgun = (enemy) => Boolean(enemy) && (enemy.status === "coming" || enemy.kind === "cerberus");

/**
 * How an enemy moves for what it's doing right now, scaled to the stage, so it reads the same at 1x on a phone and 2x
 * on a wide screen.
 * @param {"coming" | "rushing" | "waiting" | "down" | "fleeing"} status
 * @param {number} stopX where it stops in front of Jill, in px
 * @param {number} scale how big the stage is drawn
 * @param {"zombie" | "cerberus"} kind
 * @returns {object} the framer motion target, transition included
 */
export const enemyMotion = (status, stopX, scale = 1, kind = "zombie") => {
  if (status === "rushing") return { x: stopX, transition: { duration: 0.35, ease: "easeOut" } };
  // neither has a standing frame, so one waiting at her feet sways in place instead of freezing
  if (status === "waiting") return { x: [stopX, stopX + 3 * scale, stopX], transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" } };
  if (status === "down") return { x: stopX, opacity: [1, 1, 0], transition: { duration: 1.6, times: [0, 0.6, 1] } };
  if (status === "fleeing") return { x: -60 * scale, opacity: 0, transition: { duration: 0.9, ease: "easeIn" } };
  return { x: stopX, transition: { duration: stopX / (SPEED[kind] * scale), ease: "linear" } };
};

/**
 * The takedown counter in words.
 * @param {number} count enemies taken down so far
 * @returns {string} like "1 enemy down" or "3 enemies down"
 */
export const takedownLine = (count) => `${count} ${count === 1 ? "enemy" : "enemies"} down`;

/**
 * The mission's progress marks, one per takedown it asks for, true once that one is done.
 * @param {number} count enemies taken down so far
 * @param {number} goal how many the mission asks for
 * @returns {boolean[]}
 */
export const missionMarks = (count, goal) => Array.from({ length: goal }, (_, index) => index < count);
