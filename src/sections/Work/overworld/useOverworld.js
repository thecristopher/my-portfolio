import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import { useWalk } from "../../../hooks/useWalk";
import { playSound } from "../../../lib/sound";
import { isNewChest, openedChests, stopAt } from "./actions";

const read = (progress, count) => ({ ...stopAt(progress, count), opened: openedChests(progress, count) });
const isSame = (a, b) => a.index === b.index && a.isAt === b.isAt && a.opened === b.opened;

// the fanfare for every chest he opens on the way forward. the ones already open when the page loads, or opened
// again on the way back, stay quiet
const useChestFanfare = (opened) => {
  const last = useRef(opened);
  useEffect(() => {
    if (isNewChest(last.current, opened)) playSound("itemGet");
    last.current = Math.max(last.current, opened);
  }, [opened]);
};

/**
 * Where Link is in the overworld as the scroll moves: the nearest stop, whether he's standing at it, how many chests
 * he has opened and whether he's mid stride.
 * @param {import("framer-motion").MotionValue<number>} progress 0 to 1 across the timeline
 * @param {number} count how many stops
 * @returns {{ index: number, isAt: boolean, opened: number, isWalking: boolean, facing: "left" | "right" }}
 */
export const useOverworld = (progress, count) => {
  const [stop, setStop] = useState(() => read(progress.get(), count));
  const walk = useWalk(progress);
  useMotionValueEvent(progress, "change", (value) => {
    const next = read(value, count);
    setStop((current) => (isSame(current, next) ? current : next));
  });
  useChestFanfare(stop.opened);
  return { ...stop, ...walk };
};

/**
 * The widths the landscape needs to cover: the screen, and the whole row of titles it slides with.
 * @param {{ current: HTMLElement | null }} trackRef the row of titles
 * @returns {{ viewport: number, track: number }} px
 */
export const useSceneSize = (trackRef) => {
  const [size, setSize] = useState({ viewport: 0, track: 0 });
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const measure = () => setSize({ viewport: window.innerWidth, track: track.scrollWidth });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [trackRef]);
  return size;
};
