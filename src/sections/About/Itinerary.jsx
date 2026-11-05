import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { MapPin } from "lucide-react";
import { useScrollRange } from "../../hooks/useScrollRange";
import { journeyStep } from "./actions";

const STATE_STYLES = {
  past: "text-muted",
  current: "text-fg",
  future: "text-faint opacity-50",
};

const stateOf = (index, reached) => {
  if (index === reached) return "current";
  return index < reached ? "past" : "future";
};

const Stop = ({ stop, index, state }) => (
  <li className={`flex min-w-36 flex-1 flex-col gap-1 pt-4 transition-[color,opacity] duration-500 ${STATE_STYLES[state]}`}>
    <span className="flex items-center gap-1.5 text-xs font-semibold tabular-nums">
      <span
        className={`grid size-5 place-items-center rounded-full text-[10px] transition-colors duration-500 ${state === "future" ? "bg-raised" : "bg-sunset text-white"} ${state === "current" ? "shadow-[0_0_14px_2px_var(--color-sunset-1)]" : ""}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <MapPin size={12} aria-hidden="true" />
      {stop.city ?? "Somewhere"}
      {stop.isRemote && <span className="rounded-full bg-raised px-1.5 py-px text-[10px] font-medium">remote</span>}
    </span>
    <span className="text-sm leading-tight font-semibold tracking-tight">{stop.company}</span>
  </li>
);

/**
 * The trip written out under the map, one stop per job: the line fills with the sunset as the dot in the loupe moves,
 * the stop it's at glows and the ones it already passed stay lit.
 * @param {{ journey: object[], times: number[], progress: import("framer-motion").MotionValue<number> }} props
 */
const Itinerary = ({ journey, times, progress }) => {
  const [reached, setReached] = useState(() => journeyStep(times, progress.get()));
  useMotionValueEvent(progress, "change", (value) => setReached(journeyStep(times, value)));
  const strip = useRef(null);
  // on a phone the strip is wider than the screen, so it slides along to keep the current stop in view without ever
  // moving the page
  useEffect(() => {
    const stop = strip.current?.querySelectorAll("li")[reached];
    if (stop) strip.current.scrollTo({ left: stop.offsetLeft - 16, behavior: "smooth" });
  }, [reached]);
  const fill = useScrollRange(progress, [times[0] ?? 0, times[times.length - 1] ?? 1], [0, 1]);
  if (journey.length === 0) return null;

  return (
    <div ref={strip} className="no-scrollbar relative mt-14 overflow-x-auto md:mt-0" aria-label="Every job I held, oldest first, and the city it was in">
      <div className="relative min-w-[44rem]">
        <span className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden="true" />
        <motion.span className="bg-sunset absolute inset-x-0 top-0 h-[2px] origin-left" style={{ scaleX: fill }} aria-hidden="true" />
        <ol className="flex gap-4">
          {journey.map((stop, index) => (
            <Stop key={stop.company} stop={stop} index={index} state={stateOf(index, reached)} />
          ))}
        </ol>
      </div>
    </div>
  );
};

export default Itinerary;
