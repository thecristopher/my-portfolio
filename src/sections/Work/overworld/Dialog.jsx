import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dialogLine, typedText } from "./actions";

const MS_PER_CHAR = 32;

// types the line out a character at a time, starting over whenever the line changes
const useTyped = (text) => {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    setElapsed(0);
    const startedAt = performance.now();
    const timer = setInterval(() => {
      const ms = performance.now() - startedAt;
      setElapsed(ms);
      if (ms > text.length * MS_PER_CHAR) clearInterval(timer);
    }, MS_PER_CHAR);
    return () => clearInterval(timer);
  }, [text]);
  return typedText(text, elapsed, MS_PER_CHAR);
};

// the line in three parts so the title can be lit in the sunset while the rest stays white
const TypedLine = ({ line }) => {
  const full = `${line.lead}${line.item}${line.tail}`;
  const shown = useTyped(full).length;
  const itemStart = line.lead.length;
  const tailStart = itemStart + line.item.length;
  // the whole line sits invisible underneath, so the box opens at its final size instead of growing as it types
  return (
    <p className="grid">
      <span className="sr-only">{full}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {full} ▼
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {line.lead.slice(0, shown)}
        <span className="text-[#ffd84a]">{line.item.slice(0, Math.max(0, shown - itemStart))}</span>
        {line.tail.slice(0, Math.max(0, shown - tailStart))}
        {shown >= full.length && <span className="ml-1 inline-block animate-bounce text-[#ffd84a]">▼</span>}
      </span>
    </p>
  );
};

/**
 * The text box that pops up over the sky when Link holds a title up, the way an old adventure announces a find.
 * @param {{ step: { title: string, isCurrent: boolean } | null }} props the title he's holding, or null while he walks
 */
const Dialog = ({ step }) => (
  <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-4" role="status">
    <AnimatePresence mode="wait">
      {step && (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: -10, scaleY: 0.4 }}
          animate={{ opacity: 1, y: 0, scaleY: 1 }}
          exit={{ opacity: 0, y: -6, scaleY: 0.6 }}
          transition={{ duration: 0.22 }}
          className={`max-w-[min(90vw,30rem)] origin-top rounded-md border-4 border-double bg-[#0d1433]/95 px-5 py-3 font-mono text-sm leading-relaxed text-white shadow-[0_8px_0_#0006] sm:text-base ${step.isCurrent ? "border-[#ffd84a]" : "border-white/90"}`}
        >
          <TypedLine line={dialogLine(step)} />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default Dialog;
