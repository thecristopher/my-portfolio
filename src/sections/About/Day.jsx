import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { dayBlocks, hoursAhead, localClock } from "../../actions";
import { HOME_TIMEZONE } from "../../lib/profile";
import { easeOutExpo } from "../../lib/motion";
import { Trigger as D20 } from "../../components/Relics/BaldursGate";

// each part of the day in a region color, so the bar reads like a theme's palette
const TONES = ["bg-line-strong", "bg-peach", "bg-accent", "bg-string", "bg-lavender", "bg-signal", "bg-mauve"];

const useNow = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return now;
};

// how my day lines up with the visitor's, said the way you'd say it on a call
const overlapLine = (ahead) => {
  if (ahead === 0) return "We share a clock, so any time in my working hours is yours too.";
  const hours = Math.abs(ahead);
  const unit = hours === 1 ? "hour" : "hours";
  return ahead > 0 ? `You're ${hours} ${unit} ahead of me.` : `You're ${hours} ${unit} behind me.`;
};

/**
 * A weekday in Rosarito as one bar across 24 hours, the part I'm in right now marked live, and how it lines up with
 * the visitor's own clock. It tells a hiring team when I'm reachable without them doing timezone math.
 */
const Day = () => {
  const now = useNow();
  const clock = localClock(now, HOME_TIMEZONE);
  const [hours, minutes] = clock.time.split(":").map(Number);
  const nowAt = ((hours + minutes / 60) / 24) * 100;
  const blocks = dayBlocks();
  const ahead = hoursAhead(now, HOME_TIMEZONE);

  return (
    <div id="day" className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2 font-mono text-xs text-faint">
            <span>
              <span className="text-accent">//</span> a weekday in Rosarito
            </span>
            {/* when to book a call is a persuasion check like any other */}
            <D20 zoom={0.18} />
          </p>
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
            It's <span className="text-accent tabular-nums">{clock.time}</span> here. {overlapLine(ahead)}
          </p>
        </div>
      </div>

      <div className="relative">
        {/* the bar watches the viewport, not the blocks: a block squashed to nothing never counts as visible */}
        <motion.div initial="hidden" whileInView="shown" viewport={{ once: true }} className="flex h-14 overflow-hidden rounded-2xl border border-line">
          {blocks.map((block, index) => (
            <motion.div
              key={block.label}
              variants={{ hidden: { scaleY: 0 }, shown: { scaleY: 1 } }}
              transition={{ duration: 0.8, delay: index * 0.06, ease: easeOutExpo }}
              className={`${TONES[index % TONES.length]} origin-bottom opacity-80 first:opacity-30`}
              style={{ width: `${((block.until - block.from) / 24) * 100}%` }}
              title={block.label}
            />
          ))}
        </motion.div>
        {/* the playhead, where in the day I am right now */}
        <span className="absolute -top-2 -bottom-2 w-0.5 rounded-full bg-fg shadow-[0_0_12px_var(--color-fg)]" style={{ left: `${nowAt}%` }} aria-hidden="true" />
      </div>

      <ol className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((block, index) => {
          const isNow = hours >= block.from && hours < block.until;
          return (
            <li key={block.label} className={`flex items-start gap-3 ${isNow ? "" : "opacity-70"}`}>
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${TONES[index % TONES.length]}`} />
              <span className="flex flex-col gap-0.5">
                <span className="font-mono text-[11px] text-faint tabular-nums">
                  {String(block.from).padStart(2, "0")}:00 to {String(block.until % 24).padStart(2, "0")}:00
                </span>
                <span className={isNow ? "font-medium text-fg" : "text-muted"}>
                  {block.label}
                  {isNow && <span className="ml-2 font-mono text-[11px] text-accent">◀ now</span>}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default Day;
