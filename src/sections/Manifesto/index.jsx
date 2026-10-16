import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import ScrollText from "../../components/ScrollText";
import { Alchemy } from "../../components/Secrets";

const STATEMENT =
  "Hand me a hard problem and a team that wants to ship. I'll happily dig in until it works, and leave code a tired dev can still read at 2am.";

// the philosophy's signature: the page holds still and lets the sentence light up word by word while you scroll,
// with a reading line underneath that fills at the same pace. the last stretch of the hold is a beat to let it land
const Manifesto = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const reading = useTransform(scrollYProgress, [0.05, 0.8], [0, 1]);
  const lift = useTransform(scrollYProgress, [0.8, 1], [0, -40]);

  return (
    <section id="manifesto" ref={ref} className={`relative ${prefersReducedMotion ? "py-24 sm:py-36" : "h-[240svh]"}`}>
      <div className={prefersReducedMotion ? "" : "sticky top-0 flex h-svh items-center"}>
        <motion.div style={prefersReducedMotion ? undefined : { y: lift }} className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
          <p className="flex items-center gap-1 font-mono text-xs text-faint">
            <span>
              <span className="text-accent">//</span> philosophy.md
            </span>
            <Alchemy className="-my-2" />
          </p>
          <ScrollText
            text={STATEMENT}
            progress={prefersReducedMotion ? undefined : reading}
            className="max-w-5xl text-[clamp(2rem,5.6vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.04em] text-balance"
          />
          {!prefersReducedMotion && (
            <span className="relative h-px w-full max-w-5xl overflow-hidden bg-line" aria-hidden="true">
              <motion.span style={{ scaleX: reading }} className="absolute inset-0 origin-left bg-accent" />
            </span>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Manifesto;
