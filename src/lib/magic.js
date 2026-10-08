import { useEffect, useRef, useState } from "react";

// Dark Magician Girl's spell travels as a window event, so the skills section can react without knowing about her
export const MAGIC_CAST_EVENT = "magician:cast";
export const MAGIC_PINK = "#ff91be";
export const MAGIC_BLUE = "#5379f8";

export const castMagic = (target = globalThis.window) => target?.dispatchEvent(new Event(MAGIC_CAST_EVENT));

export const onMagicCast = (handler, target = globalThis.window) => {
  target?.addEventListener(MAGIC_CAST_EVENT, handler);
  return () => target?.removeEventListener(MAGIC_CAST_EVENT, handler);
};

// true for a few seconds every time the spell lands
export const useMagicBuff = (durationMs) => {
  const [isBuffed, setIsBuffed] = useState(false);
  const buffTimer = useRef(null);

  useEffect(() => {
    const stopListening = onMagicCast(() => {
      setIsBuffed(true);
      clearTimeout(buffTimer.current);
      buffTimer.current = setTimeout(() => setIsBuffed(false), durationMs);
    });
    return () => {
      stopListening();
      clearTimeout(buffTimer.current);
    };
  }, [durationMs]);

  return isBuffed;
};
