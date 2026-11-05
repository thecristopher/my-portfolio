import { useState } from "react";
import { useMotionValueEvent } from "framer-motion";

/**
 * A scroll progress rounded to steps, so whatever reads it only re-renders when it moves a step instead of on every
 * scrolled pixel.
 * @param {import("framer-motion").MotionValue<number>} progress from 0 to 1
 * @param {number} steps how many steps from 0 to 1
 * @returns {number} the progress rounded to the nearest step
 */
export const useStep = (progress, steps = 50) => {
  const [step, setStep] = useState(() => Math.round(progress.get() * steps) / steps);
  useMotionValueEvent(progress, "change", (value) => {
    const rounded = Math.round(value * steps) / steps;
    if (rounded !== step) setStep(rounded);
  });
  return step;
};
