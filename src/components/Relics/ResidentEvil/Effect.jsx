import { motion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import { UMBRELLA_RED, UMBRELLA_WEDGES } from "./umbrella";

/** The save room: the logo unfolds out of the dark, then the typewriter clacks out the confirmation. */
const SaveRoom = ({ onDone }) => {
  useMomentLength(4600, onDone);
  return (
    // solid black under the red glow, the save room cuts the game away entirely so the typewriter line reads clean
    <EffectLayer
      background={`${easedGlow(UMBRELLA_RED, { strength: 0.24, shape: "ellipse", reach: 75 })}, #000`}
      className="flex flex-col items-center justify-center gap-10 px-4"
      fade={0.6}
    >
      <Shockwave color={UMBRELLA_RED} delay={0.7} size="min(70vw,24rem)" />
      <svg viewBox="0 0 16 16" className="relative size-[min(50vw,13rem)] overflow-visible" style={{ filter: `drop-shadow(0 0 24px ${UMBRELLA_RED}88)` }}>
        {UMBRELLA_WEDGES.map(({ path, isRed }, index) => (
          <motion.path
            key={path}
            d={path}
            fill={isRed ? UMBRELLA_RED : "#f4f1ea"}
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: index * 0.07, ease: easeOutExpo }}
            style={{ transformOrigin: "8px 8px" }}
          />
        ))}
      </svg>
      <p className="text-center font-serif text-[clamp(1.1rem,4vw,2rem)] tracking-[0.25em] text-[#e9e2d0] uppercase">
        <TypedText text="Your game has been saved." startAt={0.9} perLetter={0.06} />
      </p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{ duration: 0.8, delay: 2.6 }}
        className="font-mono text-xs tracking-[0.3em] text-[#e9e2d0]/60 uppercase"
      >
        ink ribbon used · 1 left
      </motion.p>
    </EffectLayer>
  );
};

export default SaveRoom;
