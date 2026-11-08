import { TYRANT } from "../../../lib/sprites/creatures";
import { JILL, JILL_ROCKET } from "../../../lib/sprites/jill";

// how high on the Tyrant the rocket hits, in sprite px over his feet
const CHEST = 110;

/**
 * Where everyone stands for the finale, in px from the lane's left edge and up from its ground: the Tyrant out on the
 * left, the launcher's muzzle on Jill's shoulder at the right, and the spot on his chest the rocket hits.
 * @param {number} width the lane's width
 * @param {number} scale how big the stage is drawn
 * @returns {{ tyrant: number, muzzle: { x: number, up: number }, target: { x: number, up: number } }}
 */
export const finalePlan = (width, scale = 1) => {
  const tyrant = Math.max(TYRANT.anchor.x * scale * 0.6, width * 0.22);
  const feet = width - (JILL.cell.width - JILL.anchor.x) * scale;
  const muzzle = { x: feet + (JILL_ROCKET.muzzle.x - JILL_ROCKET.anchor.x) * scale, up: (JILL_ROCKET.anchor.y - JILL_ROCKET.muzzle.y) * scale };
  return { tyrant, muzzle, target: { x: tyrant, up: CHEST * scale } };
};

/**
 * How far Jill's body stands from the right edge of the stage, so enemies stop with their front at her reach.
 * @param {number} scale how big she's drawn
 * @returns {number} px
 */
export const jillFront = (scale = 1) => (JILL.cell.width - JILL.anchor.x) * scale;

/**
 * The Tyrant's part in the finale after something happens to him: he climbs out, roars once he's all the way up, and
 * is hit when the rocket lands. Nothing brings him back once he's hit.
 * @param {"emerge" | "roar" | "hit" | null} stage where he is now, null before he shows up
 * @param {"start" | "risen" | "hit"} event
 * @returns {"emerge" | "roar" | "hit" | null}
 */
export const tyrantStep = (stage, event) => {
  if (stage === "hit") return stage;
  if (event === "hit") return "hit";
  if (event === "start") return stage ?? "emerge";
  if (event === "risen" && stage === "emerge") return "roar";
  return stage;
};
