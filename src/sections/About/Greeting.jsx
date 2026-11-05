import { useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { greetingFor, typingFrames } from "./actions";

const FRAME_MS = 110;

// steps through the typewriter's frames on a loop, only while the tile can be seen
const useTyping = (frames, isRunning) => {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!isRunning || frames.length === 0) return undefined;
    const timer = setInterval(() => setAt((current) => (current + 1) % frames.length), FRAME_MS);
    return () => clearInterval(timer);
  }, [frames, isRunning]);
  return frames[at] ?? "";
};

/**
 * Says hi in every language I speak, typed out and erased one after the other like a terminal greeting.
 * @param {{ languages: { name: string }[] }} props
 */
const Greeting = ({ languages }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const prefersReducedMotion = useReducedMotion();
  const words = useMemo(() => languages.map((language) => greetingFor(language.name)), [languages]);
  const frames = useMemo(() => typingFrames(words, 14), [words]);
  const typed = useTyping(frames, isInView && !prefersReducedMotion);

  if (prefersReducedMotion) return <p className="text-sunset text-5xl leading-none font-semibold tracking-[-0.04em]">{words.join(" · ")}</p>;

  return (
    <p ref={ref} className="text-sunset flex h-[1.1em] items-center text-5xl leading-none font-semibold tracking-[-0.04em]" aria-label={words.join(", ")}>
      <span aria-hidden="true">{typed}</span>
      <span className="caret ml-1 inline-block h-[0.85em] w-[3px] rounded-full bg-[var(--color-sunset-2)]" aria-hidden="true" />
    </p>
  );
};

export default Greeting;
