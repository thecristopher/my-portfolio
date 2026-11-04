import { useMemo } from "react";
import { transform, useTransform } from "framer-motion";

/**
 * Maps a slice of a scroll onto a style value, the same as useTransform with ranges, but always worked out in JS.
 * Framer hands opacity tied to a scroll to the browser's ScrollTimeline, which reads the whole page instead of the
 * target's offsets and leaves the value stuck, so every scroll scene goes through here instead.
 * @param {import("framer-motion").MotionValue<number>} progress a scroll progress from useScroll
 * @param {number[]} input where in the scroll each output lands, from 0 to 1
 * @param {Array<number | string>} output the values to land on
 * @returns {import("framer-motion").MotionValue} the mapped value
 */
export const useScrollRange = (progress, input, output) => {
  const inputKey = input.join(",");
  const outputKey = output.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const map = useMemo(() => transform(input, output), [inputKey, outputKey]);
  return useTransform(progress, (value) => map(value));
};
