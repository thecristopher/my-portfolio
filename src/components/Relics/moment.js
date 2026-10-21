import { useEffect, useRef } from "react";
import { easedGlow } from "../../actions";

/**
 * Ends a moment after it has played for its length. The latest onDone is used, so a re-render never restarts the clock.
 * @param {number} lastsMs how long the moment stays on screen
 * @param {() => void} onDone called once when it's over
 */
export const useMomentLength = (lastsMs, onDone) => {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const timer = setTimeout(() => done.current?.(), lastsMs);
    return () => clearTimeout(timer);
  }, [lastsMs]);
};

/**
 * The dark a moment plays over: tinted with the relic's color in the middle, deep enough that the page never reads through.
 * @param {string} color the relic's color
 * @param {number} strength how opaque the dark is, 0 to 1
 * @returns {string} a css background
 */
export const veil = (color, strength = 0.82) => `${easedGlow(color, { strength: 0.2, shape: "ellipse", reach: 80 })}, rgba(5,5,12,${strength})`;
