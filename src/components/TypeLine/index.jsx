import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export const Caret = () => <span className="caret ml-0.5 inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] bg-accent" aria-hidden="true" />;

// types a shell command out character by character once it scrolls into view
const TypeLine = ({ text, prompt = "$", delay = 0, speed = 38, showCaretWhenDone = false, onDone, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();
  const [typedCount, setTypedCount] = useState(0);

  const isDone = prefersReducedMotion || typedCount >= text.length;

  useEffect(() => {
    if (!isInView || isDone) return;
    const pause = typedCount === 0 ? delay * 1000 : speed;
    const timer = setTimeout(() => setTypedCount((count) => count + 1), pause);
    return () => clearTimeout(timer);
  }, [isInView, isDone, typedCount, delay, speed]);

  useEffect(() => {
    if (isDone) onDone?.();
  }, [isDone, onDone]);

  const visibleText = prefersReducedMotion ? text : text.slice(0, typedCount);

  return (
    <p ref={ref} className={`font-mono ${className}`} aria-label={`${prompt} ${text}`}>
      <span className="text-accent" aria-hidden="true">{prompt} </span>
      <span aria-hidden="true">{visibleText}</span>
      {(!isDone || showCaretWhenDone) && <Caret />}
    </p>
  );
};

export default TypeLine;
