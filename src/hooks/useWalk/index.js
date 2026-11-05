import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { stepWalk } from "./actions";

// how long the value has to rest before the walker stops and stands
const STOPS_AFTER_MS = 160;

/**
 * Turns a moving value, like how far down the page someone has read, into a walk: whether it's moving and which way.
 * @param {import("framer-motion").MotionValue<number>} value what the walker follows
 * @returns {{ isWalking: boolean, facing: "left" | "right" }}
 */
export const useWalk = (value) => {
  const [walk, setWalk] = useState({ isWalking: false, facing: "right" });
  const previous = useRef(value.get());
  const stopTimer = useRef(null);

  useMotionValueEvent(value, "change", (next) => {
    const step = stepWalk(previous.current, next, walk.facing);
    previous.current = next;
    if (!step.hasMoved) return;
    if (!walk.isWalking || step.facing !== walk.facing) setWalk({ isWalking: true, facing: step.facing });
    clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => setWalk((current) => ({ ...current, isWalking: false })), STOPS_AFTER_MS);
  });

  useEffect(() => () => clearTimeout(stopTimer.current), []);

  return walk;
};
