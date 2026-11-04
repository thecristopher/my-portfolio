import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { splitWords } from "../../actions";
import { wordWindow } from "../../lib/motion";

const DIM = 0.16;

const Word = ({ word, index, count, progress }) => {
  const opacity = useScrollRange(progress, wordWindow(index, count), [DIM, 1]);
  return (
    <>
      <motion.span style={{ opacity }}>{word}</motion.span>{" "}
    </>
  );
};

/**
 * A paragraph that lights up word by word as it scrolls through the screen, the way Apple reads its big lines to you.
 * @param {{ text: string, className?: string }} props
 */
const ScrollWords = ({ text, className = "" }) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = splitWords(text);

  if (prefersReducedMotion) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Word key={`${word}-${index}`} word={word} index={index} count={words.length} progress={scrollYProgress} />
        ))}
      </span>
    </p>
  );
};

export default ScrollWords;
