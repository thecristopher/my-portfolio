import { motion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";

/**
 * How I lead, four rules set as a numbered list that rises in line by line. Each number is a vim mark, 'a to 'd.
 */
const Principles = ({ principles }) => (
  <div id="principles" className="flex flex-col gap-10">
    <p className="font-mono text-xs text-faint">
      <span className="text-accent">//</span> principles.md
    </p>
    <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
      {principles.map((principle, index) => (
        <motion.li
          key={principle.title}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: index * 0.08, ease: easeOutExpo }}
          className="flex flex-col gap-4 bg-panel p-7 sm:p-9"
        >
          <span className="font-mono text-sm text-accent">'{String.fromCharCode(97 + index)}</span>
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{principle.title}</h3>
          <p className="leading-relaxed text-muted text-pretty">{principle.body}</p>
        </motion.li>
      ))}
    </ol>
  </div>
);

export default Principles;
