import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ScrollText from "../../components/ScrollText";
import { Trigger as TransmutationCircle } from "../../components/Relics/Fullmetal";

const STATEMENT =
  "Hand me a hard problem and a team that wants to ship. I'll dig in until it works, and leave code a tired dev can still read at 2 AM.";

/**
 * The page holds still and the sentence lights up word by word as you scroll, with a reading line filling
 * underneath at the same pace. The transmutation circle sits beside it: hard problems in, readable code out.
 */
const Philosophy = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const reading = useTransform(scrollYProgress, [0.05, 0.8], [0, 1]);
  const lift = useTransform(scrollYProgress, [0.8, 1], [0, -40]);

  return (
    <div id="philosophy" ref={ref} className={prefersReducedMotion ? "py-24" : "h-[220svh]"}>
      <div className={prefersReducedMotion ? "" : "sticky top-0 flex h-svh items-center"}>
        <motion.div style={prefersReducedMotion ? undefined : { y: lift }} className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
          <p className="font-mono text-xs text-faint">
            <span className="text-accent">//</span> philosophy.md
          </p>
          <ScrollText
            text={STATEMENT}
            progress={prefersReducedMotion ? undefined : reading}
            className="max-w-5xl text-[clamp(2rem,5.6vw,4.75rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-balance"
          />
          <div className="flex items-center gap-8">
            {!prefersReducedMotion && (
              <span className="relative h-px flex-1 overflow-hidden bg-line" aria-hidden="true">
                <motion.span style={{ scaleX: reading }} className="absolute inset-0 origin-left bg-accent" />
              </span>
            )}
            <TransmutationCircle zoom={0.15} />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Philosophy;
