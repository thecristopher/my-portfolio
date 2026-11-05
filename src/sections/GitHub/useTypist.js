import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { MAIN_PROJECT, bufferLength, bufferText, editorBuffer } from "./actions";

/** What the laptop types: the config's features as a Lua table. */
export const BUFFER = editorBuffer(MAIN_PROJECT.features);
export const BUFFER_TEXT = bufferText(BUFFER);
export const BUFFER_TOTAL = bufferLength(BUFFER);

const KEYSTROKES_PER_TICK = 2;
const TICK_MS = 28;

/**
 * Types the buffer out one tick at a time once it starts, so the screen and the keyboard share the same keystrokes.
 * Anyone who asked for less movement gets it already written.
 * @param {boolean} isRunning whether typing has started
 * @returns {number} keystrokes typed so far
 */
export const useTypist = (isRunning) => {
  const prefersReducedMotion = useReducedMotion();
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (!isRunning || prefersReducedMotion) return undefined;
    const timer = setInterval(() => {
      setTyped((count) => {
        const next = Math.min(BUFFER_TOTAL, count + KEYSTROKES_PER_TICK);
        if (next === BUFFER_TOTAL) clearInterval(timer);
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isRunning, prefersReducedMotion]);

  return prefersReducedMotion ? BUFFER_TOTAL : typed;
};
