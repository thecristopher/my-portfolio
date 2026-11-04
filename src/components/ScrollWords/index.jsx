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

const Words = ({ words, progress }) => (
  <span aria-hidden="true">
    {words.map((word, index) => (
      <Word key={`${word}-${index}`} word={word} index={index} count={words.length} progress={progress} />
    ))}
  </span>
);

/**
 * A paragraph that lights up word by word as it scrolls through the screen, the way Apple reads its big lines to you.
 * Pinned, it holds still in the middle of the screen while the scroll does the reading.
 * @param {{ text: string, className?: string, pinned?: boolean }} props
 */
const ScrollWords = ({ text, className = "", pinned = false }) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: pinned ? ["start start", "end end"] : ["start 0.85", "end 0.45"] });
  const words = splitWords(text);

  if (prefersReducedMotion) return <p className={className}>{text}</p>;

  if (pinned) {
    return (
      <div ref={ref} className="relative h-[240svh]">
        <div className="sticky top-0 flex h-svh items-center">
          <p className={className} aria-label={text}>
            <Words words={words} progress={scrollYProgress} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <p ref={ref} className={className} aria-label={text}>
      <Words words={words} progress={scrollYProgress} />
    </p>
  );
};

export default ScrollWords;
