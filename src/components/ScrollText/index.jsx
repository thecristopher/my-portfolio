import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { splitWords, wordRevealRange } from "../../actions";

const ScrubbedWord = ({ progress, range, children }) => {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span aria-hidden="true" style={{ opacity }}>
      {children}{" "}
    </motion.span>
  );
};

// words light up one by one as the paragraph scrolls through the viewport
const ScrollText = ({ text, className = "" }) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = splitWords(text);

  if (prefersReducedMotion) return <p className={className}>{text}</p>;

  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((word, index) => (
        <ScrubbedWord key={`${word}-${index}`} progress={scrollYProgress} range={wordRevealRange(index, words.length)}>
          {word}
        </ScrubbedWord>
      ))}
    </p>
  );
};

export default ScrollText;
