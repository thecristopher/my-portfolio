import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import TextReveal from "../TextReveal";
import Seal from "../Seal";
import Scramble from "../Scramble";
import { easeOutExpo } from "../../lib/motion";

// the label line and title every section opens with, the section's number set huge and hollow behind them drifting
// at its own pace, and on wider screens the section's seal off to the right. aside sits under the seal, for the one
// line of shell a section wants to say about itself
const SectionHeader = ({ id, index, label, title, aside, className = "" }) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["35%", "-35%"]);

  return (
    <header ref={ref} className={`relative isolate grid gap-6 md:grid-cols-[1fr_auto] md:items-end ${className}`}>
      <motion.span
        aria-hidden="true"
        data-search-skip
        style={prefersReducedMotion ? undefined : { y: drift }}
        className="section-numeral pointer-events-none absolute -top-[0.42em] -left-[0.05em] -z-10 text-[clamp(9rem,26vw,20rem)] leading-none font-medium tracking-[-0.07em] select-none"
      >
        {index}
      </motion.span>
      <div className="flex flex-col gap-5">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
          className="flex items-center gap-3 font-mono text-xs tracking-[0.15em] text-muted"
        >
          <span className="text-accent">{index}</span>
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: easeOutExpo }}
            className="h-px w-10 origin-left bg-line-strong"
          />
          <Scramble text={label} />
        </motion.p>
        <TextReveal
          as="h2"
          text={title}
          className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] font-medium tracking-[-0.035em] text-balance"
        />
      </div>
      {(id || aside) && (
        <div className="flex flex-col gap-5 md:items-end">
          {id && <Seal id={id} label={label} index={index} className="hidden md:block" />}
          {aside}
        </div>
      )}
    </header>
  );
};

export default SectionHeader;
