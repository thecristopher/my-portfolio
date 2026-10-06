import { motion } from "framer-motion";
import TextReveal from "../TextReveal";
import { easeOutExpo } from "../../lib/motion";

const SectionHeader = ({ index, label, title, className = "" }) => (
  <header className={`flex flex-col gap-5 ${className}`}>
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
      className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] leading-[1.02] font-medium tracking-[-0.035em]"
    />
  </header>
);

export default SectionHeader;
