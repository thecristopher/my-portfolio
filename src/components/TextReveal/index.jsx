import { Fragment } from "react";
import { motion } from "framer-motion";
import { splitWords } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

// each word slides up from behind its own mask, the classic keynote headline move
const TextReveal = ({ text, as = "span", className = "", delay = 0, stagger = 0.06 }) => {
  const Tag = as;

  return (
    <Tag className={className} aria-label={text}>
      {splitWords(text).map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span aria-hidden="true" className="inline-block overflow-hidden pb-[0.12em] align-top">
            <motion.span
              className="inline-block"
              initial={{ y: "110%", rotate: 4 }}
              whileInView={{ y: "0%", rotate: 0 }}
              viewport={{ once: true, margin: "-60px" }}
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
