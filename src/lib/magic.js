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
