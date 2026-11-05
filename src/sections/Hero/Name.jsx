import { motion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";

/**
 * A word drawn one letter at a time. Each letter keeps the width it has at rest through an invisible twin, and the
 * visible one is centered over it without taking up room, so a heavier letter never pushes its neighbors.
 * @param {{ text: string, firstIndex: number, register: (index: number) => (element: HTMLElement | null) => void }} props
 *   firstIndex numbers this word's letters after the ones in the words before it
 */
const WeightedWord = ({ text, firstIndex, register }) =>
  [...text].map((character, at) => (
    <span key={`${character}-${at}`} className="inline-grid">
      <span className="invisible [grid-area:1/1]">{character}</span>
      <span ref={register(firstIndex + at)} className="flex w-0 justify-center justify-self-center transition-[font-weight] duration-300 ease-out [grid-area:1/1]">
        {character}
      </span>
    </span>
  ));

const LINE_HIDDEN = { y: "100%", rotateX: -70, opacity: 0, filter: "blur(10px)" };
const LINE_SHOWN = { y: "0%", rotateX: 0, opacity: 1, filter: "blur(0px)" };

// each line of the name tips up out of the floor, like a sign swinging into place, once the opening may start
const NameLine = ({ children, delay, hasStarted, className = "" }) => (
  <span className="block overflow-hidden pb-[0.06em] [perspective:900px]" aria-hidden="true">
    <motion.span
      className={`block origin-bottom ${className}`}
      initial={LINE_HIDDEN}
      animate={hasStarted ? LINE_SHOWN : LINE_HIDDEN}
      transition={{ duration: 1.6, delay, ease: easeOutExpo }}
    >
      {children}
    </motion.span>
  </span>
);

const FIRST = "Cristopher";
const LAST = "Cervantes.";

/**
 * My name, huge, one line swinging up after the other. Screen readers get it as one plain heading, the letters are
 * only drawn for the eye.
 * @param {{ register: (index: number) => (element: HTMLElement | null) => void, hasStarted?: boolean }} props register
 *   comes from useLetterWeights, hasStarted holds the lines down until the opening may play
 */
const Name = ({ register, hasStarted = true }) => (
  <h1 className="text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.9] font-semibold tracking-[-0.06em]">
    <span className="sr-only">
      {FIRST} {LAST}
    </span>
    <NameLine delay={0.4} hasStarted={hasStarted}>
      <WeightedWord text={FIRST} firstIndex={0} register={register} />
    </NameLine>
    <NameLine delay={0.55} hasStarted={hasStarted} className="text-sunset">
      <WeightedWord text={LAST} firstIndex={FIRST.length} register={register} />
    </NameLine>
  </h1>
);

export default Name;
