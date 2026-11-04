import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useScrollRange } from "../../hooks/useScrollRange";
import { stackedScale } from "./actions";
import CaseStudyCard from "./CaseStudyCard";

// each card pins a little lower than the one before, and shrinks back into the deck as the next one slides over it
const StackedCard = ({ study, index, count, progress }) => {
  const scale = useScrollRange(progress, [index / count, 1], [1, stackedScale(index, count)]);
  return (
    <motion.div className="sticky origin-top" style={{ top: `calc(6rem + ${index * 1.5}rem)`, scale }}>
      <CaseStudyCard study={study} index={index} />
    </motion.div>
  );
};

/**
 * A company's case studies as a deck: on wide screens each card pins and the next one slides up over it, so the deck
 * builds as you scroll. Phones, and anyone who asked for less movement, get them one after the other.
 * @param {{ studies: object[] }} props
 */
const StackedStudies = ({ studies }) => {
  const ref = useRef(null);
  const isWide = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  if (!isWide || prefersReducedMotion || studies.length < 2) {
    return studies.map((study, index) => <CaseStudyCard key={study.slug} study={study} index={index} />);
  }

  return (
    <div ref={ref} className="flex flex-col gap-[18vh] pb-[6vh]">
      {studies.map((study, index) => (
        <StackedCard key={study.slug} study={study} index={index} count={studies.length} progress={scrollYProgress} />
      ))}
    </div>
  );
};

export default StackedStudies;
