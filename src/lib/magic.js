import { useEffect, useState } from "react";
import { foundRelics } from "./relics";

// Dark Magician Girl's spell travels as a window event, so the skills section can react without knowing about her
export const MAGIC_CAST_EVENT = "magician:cast";
export const MAGIC_PINK = "#ff91be";
export const MAGIC_BLUE = "#5379f8";

export const castMagic = (target = globalThis.window) => target?.dispatchEvent(new Event(MAGIC_CAST_EVENT));

export const onMagicCast = (handler, target = globalThis.window) => {
  target?.addEventListener(MAGIC_CAST_EVENT, handler);
  return () => target?.removeEventListener(MAGIC_CAST_EVENT, handler);
};

// once she has cast, the buff never wears off: believe in the heart of the cards
export const hasBeenBuffed = (found = []) => found.includes("magician");

// true from the first cast on, and from the first render for anyone who already summoned her on an earlier visit
export const useMagicBuff = () => {
  const [isBuffed, setIsBuffed] = useState(() => hasBeenBuffed(foundRelics.get()));

  useEffect(() => onMagicCast(() => setIsBuffed(true)), []);

  return isBuffed;
};

// real cards top out at level 12, and roughly every 400 ATK earns another star
const MAX_LEVEL = 12;
const ATK_PER_STAR = 400;

/**
 * The level a skill card shows as stars, worked out from its base ATK the way stronger monsters sit higher.
 * @param {number} attack the card's ATK before any buff
 * @returns {number} a level from 1 to 12
 */
export const monsterLevel = (attack = 0) => Math.min(MAX_LEVEL, Math.max(1, Math.ceil(attack / ATK_PER_STAR)));

/**
 * The set code printed under the art, like CRIS-EN001, so the deck reads as one booster set.
 * @param {number} index the card's position in the deck, starting at 0
 * @returns {string} the set code
 */
export const cardSetCode = (index) => `CRIS-EN${String(index + 1).padStart(3, "0")}`;
