import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { easeOutExpo } from "../../lib/motion";
import { leadSentence } from "./actions";

// a chapter counts as the one being read while it crosses the middle of the screen
const READING_BAND = "-45% 0px -45% 0px";

const Chapter = ({ paragraph, index, onRead }) => {
  const ref = useRef(null);
  const isRead = useInView(ref, { margin: READING_BAND });
  const { lead, rest } = leadSentence(paragraph);
  useEffect(() => {
    if (isRead) onRead(index);
  }, [isRead, index, onRead]);

  return (
    <motion.li
      ref={ref}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: easeOutExpo }}
      className="relative grid gap-4 pl-8 sm:pl-12"
    >
      {/* the bead on the rail lights up for the chapter being read */}
      <span
        className={`absolute top-3 left-0 size-3 -translate-x-1/2 rounded-full ring-4 ring-ink transition-[background-color,box-shadow] duration-500 ${isRead ? "bg-sunset shadow-[0_0_18px_4px_var(--color-sunset-2)]" : "bg-line-strong"}`}
        aria-hidden="true"
      />
      <p className="text-sunset text-sm font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</p>
      <p className={`text-[clamp(1.6rem,3.2vw,2.5rem)] leading-[1.15] font-semibold tracking-[-0.03em] text-balance transition-colors duration-500 ${isRead ? "text-fg" : "text-muted"}`}>
        {lead}
      </p>
      {rest && <p className="max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">{rest}</p>}
    </motion.li>
  );
};

/**
 * The rest of the story after the lead, one chapter per paragraph on a rail that fills with the sunset as it's read:
 * each chapter's first sentence carries it, its bead glows while it's on screen, and the counter beside it keeps time.
 * @param {{ paragraphs: string[] }} props
 */
const StoryChapters = ({ paragraphs }) => {
  const ref = useRef(null);
  const [reading, setReading] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 60%", "end 40%"] });
  const fill = useScrollRange(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="flex flex-col gap-3 lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
        <p className="text-sm font-semibold text-muted">How I got here</p>
        <p className="hidden items-baseline gap-2 font-semibold tracking-tight tabular-nums lg:flex" aria-hidden="true">
          <span className="text-sunset text-7xl leading-none">{String(reading + 1).padStart(2, "0")}</span>
          <span className="text-2xl text-faint">/ {String(paragraphs.length).padStart(2, "0")}</span>
        </p>
      </div>
      <div ref={ref} className="relative lg:col-span-8">
        <span className="absolute inset-y-0 left-0 w-px bg-line" aria-hidden="true" />
        <motion.span className="bg-sunset absolute inset-y-0 left-0 w-[2px] origin-top" style={{ scaleY: fill }} aria-hidden="true" />
        <ol className="flex flex-col gap-16 sm:gap-24">
          {paragraphs.map((paragraph, index) => (
            <Chapter key={paragraph.slice(0, 24)} paragraph={paragraph} index={index} onRead={setReading} />
          ))}
        </ol>
      </div>
    </div>
  );
};

export default StoryChapters;
