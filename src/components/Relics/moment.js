import { useEffect, useRef } from "react";

/**
 * Tells the stage a moment has settled on its last frame, so the continue button can show up. The moment itself
 * stays on screen until the visitor presses it. The latest onDone is used, so a re-render never restarts the clock.
 * @param {number} lastsMs how long the animation needs to reach its last frame
 * @param {() => void} onDone called once when it has settled
 */
export const useMomentLength = (lastsMs, onDone) => {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const timer = setTimeout(() => done.current?.(), lastsMs);
    return () => clearTimeout(timer);
  }, [lastsMs]);
};
