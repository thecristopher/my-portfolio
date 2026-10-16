import { Fragment, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { splitWords } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

// each word slides up from behind its own mask, the classic keynote headline move. the whole line is what gets
// watched for scrolling into view: a word starts fully clipped by its mask, and a fully clipped element never
// counts as visible, so watching the words themselves left headings stuck hidden on some screen sizes
const TextReveal = ({ text, as = "span", className = "", delay = 0, stagger = 0.06 }) => {
  const Tag = as;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {splitWords(text).map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", rotate: 4 }}
              animate={isInView ? { y: "0%", rotate: 0 } : undefined}
              transition={{ duration: 1.1, delay: delay + index * stagger, ease: easeOutExpo }}
            >
              {word}
            </motion.span>
          </span>{" "}
        </Fragment>
      ))}
    </Tag>
  );
};

export default TextReveal;
