import { motion } from "framer-motion";
import TextReveal from "../TextReveal";
import Seal from "../Seal";
import { easeOutExpo } from "../../lib/motion";

// the label line and title every section opens with, and on wider screens the section's seal off to the right.
// aside sits under the seal, for the one line of shell a section wants to say about itself
const SectionHeader = ({ id, index, label, title, aside, className = "" }) => (
  <header className={`grid gap-6 md:grid-cols-[1fr_auto] md:items-end ${className}`}>
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
        <span>{label}</span>
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

export default SectionHeader;
