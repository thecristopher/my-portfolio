import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { scrambleFrame } from "../../actions";

const FRAME_MS = 32;
const FRAMES = 18;

// a label that decodes itself like a terminal the first time it scrolls into view: random glyphs settle into the
// real letters from left to right
const Scramble = ({ text, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const prefersReducedMotion = useReducedMotion();
  const [frame, setFrame] = useState(prefersReducedMotion ? FRAMES : 0);

  useEffect(() => {
    if (!isInView || frame >= FRAMES) return undefined;
    const timer = setTimeout(() => setFrame((current) => current + 1), FRAME_MS);
    return () => clearTimeout(timer);
  }, [isInView, frame]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{frame >= FRAMES ? text : scrambleFrame(text, frame / FRAMES)}</span>
    </span>
  );
};

export default Scramble;
