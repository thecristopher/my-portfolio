import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const VOYAGE_SECONDS = 5.5;
// sixteen small crests across the strip, so the swell still reads as waves when stretched across a wide screen
const CRESTS = Array.from({ length: 15 }, (_, index) => ` T ${(index + 2) * 12.5} 12`).join("");
const WAVE = `M0 12 Q 6.25 6 12.5 12${CRESTS} V 40 H 0 Z`;

// a strip of sea along the bottom of the screen, its waves rolling the whole time the bottle is out
const Sea = () => (
  <div className="absolute inset-x-0 bottom-0 h-14 overflow-hidden">
    <motion.svg
      viewBox="0 0 200 40"
      preserveAspectRatio="none"
      className="absolute bottom-0 h-full w-[200%]"
      animate={{ x: ["0%", "-50%"] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    >
      <path d={WAVE} fill="color-mix(in oklab, var(--color-sunset-3) 18%, var(--color-ink))" stroke="color-mix(in oklab, var(--color-sunset-1) 70%, transparent)" strokeWidth="0.6" />
    </motion.svg>
  </div>
);

// a corked bottle on its side with the rolled up note inside
const BottleArt = () => (
  <svg viewBox="0 0 44 18" className="h-6 w-14 drop-shadow-md">
    <rect x="2" y="3" width="28" height="12" rx="5" fill="rgb(140 210 170 / 0.55)" stroke="rgb(60 140 100 / 0.8)" strokeWidth="1" />
    <rect x="29" y="6" width="9" height="6" rx="1.5" fill="rgb(140 210 170 / 0.55)" stroke="rgb(60 140 100 / 0.8)" strokeWidth="1" />
    <rect x="37" y="6.5" width="5" height="5" rx="1" fill="#b07a45" />
    <rect x="8" y="6" width="15" height="6" rx="3" fill="#f6ecd4" />
    <path d="M10 9 H 21" stroke="#c9b58c" strokeWidth="0.8" />
    <rect x="5" y="4.5" width="18" height="1.5" rx="0.75" fill="white" opacity="0.6" />
  </svg>
);

const Voyage = ({ onArrive }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-24"
    aria-hidden="true"
  >
    <Sea />
    <motion.div
      className="absolute bottom-7 left-0"
      initial={{ x: "6vw", scale: 1.1 }}
      animate={{ x: "88vw", scale: 0.55 }}
      transition={{ duration: VOYAGE_SECONDS, ease: [0.3, 0, 0.6, 1] }}
      onAnimationComplete={onArrive}
    >
      <motion.div animate={{ y: [0, -5, 0], rotate: [-8, 6, -8] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
        <BottleArt />
      </motion.div>
    </motion.div>
  </motion.div>
);

/**
 * A message in a bottle that floats out to sea along the bottom of the screen every time the email is copied, the
 * address on its way. Anyone who asked for less movement only gets the copy.
 * @param {{ launch: number }} props how many times the email has been copied, each new number sends a bottle
 */
const Bottle = ({ launch }) => {
  const prefersReducedMotion = useReducedMotion();
  const [arrived, setArrived] = useState(0);
  const isSailing = !prefersReducedMotion && launch > arrived;

  return <AnimatePresence>{isSailing && <Voyage key={launch} onArrive={() => setArrived(launch)} />}</AnimatePresence>;
};

export default Bottle;
