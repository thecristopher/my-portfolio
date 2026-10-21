import { motion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import { UMBRELLA_RED, UMBRELLA_WEDGES } from "./umbrella";

const SAVED = "Your game has been saved.";
const SAVED_AT = 0.9;
const SAVED_PER_LETTER = 0.06;
const LOG_PER_LETTER = 0.02;
const FILE_LINE = "FILE: Umbrella Seguros · lead dev on the Azure admin app. No T-virus involved.";
const CAREER_LINE = "CAREER SAVED · 5 companies · 9+ years · ink ribbon: ∞";
// each log line waits for the one above it, the way a typewriter only prints one line at a time
const FILE_AT = SAVED_AT + SAVED.length * SAVED_PER_LETTER + 0.3;
const CAREER_AT = FILE_AT + FILE_LINE.length * LOG_PER_LETTER + 0.15;
const SETTLED_MS = Math.round((CAREER_AT + CAREER_LINE.length * LOG_PER_LETTER) * 1000) + 150;

/** The save log under the confirmation: what got saved this time, typed out and left on the page. */
const SaveLog = () => (
  <div className="w-full max-w-md border-l-2 pl-4 text-left font-mono text-[clamp(0.75rem,3.2vw,0.9rem)] leading-relaxed text-pretty text-[#e9e2d0]/80" style={{ borderColor: `${UMBRELLA_RED}aa` }}>
    <p>
      <TypedText text={FILE_LINE} startAt={FILE_AT} perLetter={LOG_PER_LETTER} />
    </p>
    <p className="mt-2 tracking-[0.12em] text-[#e9e2d0]">
      <TypedText text={CAREER_LINE} startAt={CAREER_AT} perLetter={LOG_PER_LETTER} />
    </p>
  </div>
);

/** The save room: the logo unfolds out of the dark, the typewriter clacks out the confirmation and the save log stays. */
const SaveRoom = ({ onDone }) => {
  useMomentLength(SETTLED_MS, onDone);
  return (
    // solid black under the red glow, the save room cuts the game away entirely so the typewriter line reads clean
    <EffectLayer
      background={`${easedGlow(UMBRELLA_RED, { strength: 0.24, shape: "ellipse", reach: 75 })}, #000`}
      className="flex flex-col items-center justify-center gap-8 px-4 pb-16"
      fade={0.6}
    >
      <Shockwave color={UMBRELLA_RED} delay={0.7} size="min(70vw,24rem)" />
      <svg viewBox="0 0 16 16" className="relative size-[min(42vw,11rem)] overflow-visible" style={{ filter: `drop-shadow(0 0 24px ${UMBRELLA_RED}88)` }}>
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
      <p className="text-center font-serif text-[clamp(1.1rem,4vw,2rem)] tracking-[0.25em] text-balance text-[#e9e2d0] uppercase">
        <TypedText text={SAVED} startAt={SAVED_AT} perLetter={SAVED_PER_LETTER} />
      </p>
      <SaveLog />
    </EffectLayer>
  );
};

export default SaveRoom;
