import { motion } from "framer-motion";
import { Bloom, DrawnPath, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { AirbenderArrow } from "../emblems";
import { AIR_ORANGE } from "../artwork";
import { pointOnCircle } from "../../../lib/geometry";
import { easeOutExpo } from "../../../lib/motion";
import { BEATS, elementBeat } from "./helpers";

// the four nations in the order the narration names them, each as one clean stroke in its own color
const ELEMENTS = [
  { word: "Water", color: "#3b9cff", d: "M8 34c6-8 10-8 16 0s10 8 16 0 10-8 16 0" },
  { word: "Earth", color: "#3fb35f", d: "M10 48L24 22L32 34L40 18L54 48Z" },
  { word: "Fire", color: "#e8432b", d: "M32 54c-12 0-16-10-10-20 2 6 6 6 6 2 0-8 4-14 10-18-2 8 8 12 8 22 0 8-6 14-14 14Z" },
  { word: "Air", color: "#f5a524", d: "M32 32m-2 0a2 2 0 1 1 4 0a6 6 0 1 1-12 0a10 10 0 1 1 20 0a14 14 0 1 1-28 0" },
];
const ORBIT = 21;

// each element arrives on its drum, at its corner of the circle, with its name under it
const Element = ({ element, index }) => {
  const spot = pointOnCircle(index * 90, ORBIT);
  const at = elementBeat(index);
  return (
    <motion.div
      className="absolute top-[32%] left-1/2 flex w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
      initial={{ x: `${spot.x}vmin`, y: `${spot.y}vmin`, opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: at, ease: easeOutExpo }}
    >
      <svg viewBox="0 0 64 64" className="size-[min(13vmin,5rem)] overflow-visible" style={{ filter: `drop-shadow(0 0 10px ${element.color})` }}>
        <DrawnPath d={element.d} color={element.color} at={at} duration={0.7} width={3} />
      </svg>
      <span className="text-sm font-semibold" style={{ color: element.color }}>
        {element.word}
      </span>
    </motion.div>
  );
};

// the ring that ties the four together once Air has spoken, turning slowly
const Ring = () => (
  <motion.svg
    viewBox="-50 -50 100 100"
    className="absolute top-[32%] left-1/2 size-[min(42vmin,24rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
    initial={{ rotate: 0 }}
    animate={{ rotate: 90 }}
    transition={{ duration: 6, delay: BEATS.together, ease: "linear" }}
  >
    <DrawnPath d="M-48 0a48 48 0 1 0 96 0a48 48 0 1 0-96 0" color="#ffffff55" at={BEATS.together} duration={1.2} width={0.4} />
  </motion.svg>
);

/** Avatar: Water, Earth, Fire and Air arrive one drum apart, then the ring joins them around Aang's arrow. */
const FourNationsMoment = ({ onDone }) => {
  useMomentLength(BEATS.lastsMs, onDone);
  return (
    <MomentLayer color={AIR_ORANGE} glowAt="50% 32%">
      <Ring />
      {ELEMENTS.map((element, index) => (
        <Element key={element.word} element={element} index={index} />
      ))}
      <Bloom color={AIR_ORANGE} at={BEATS.together} size="min(36vmin,16rem)" className="top-[32%]" />
      <motion.div
        className="absolute top-[32%] left-1/2 size-[min(16vmin,6rem)] -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: BEATS.together, ease: easeOutExpo }}
      >
        <AirbenderArrow className="size-full" />
      </motion.div>
      <MomentCopy
        color={AIR_ORANGE}
        eyebrow="Avatar: The Last Airbender"
        title="Four stacks, in harmony."
        lines={["Frontend. Backend. Cloud. People.", "Still mastering the last one."]}
        at={BEATS.harmony}
      />
    </MomentLayer>
  );
};

export default FourNationsMoment;
