import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength, veil } from "../moment";
import { easeOutExpo } from "../../../lib/motion";
import { TransmutationCircle } from "./Circle";
import { ALCHEMY_BLUE, FLAMEL, FLAMEL_RED } from "./flamel";
import { BEATS, FLOOR, crackleBolts } from "./helpers";

const GLOVE = "#f6f3ec";
const COAT_RED = "#b3202c";
// how often the lightning grows a new shape. a few frames apart reads as crackle, every frame reads as noise
const CRACKLE_EVERY_MS = 70;
const CALM_CRACKLE_EVERY_MS = 400;

// one white glove, palm out and fingers up, with a strip of the red coat sleeve at the wrist
const Hand = ({ isMirrored }) => (
  <svg viewBox="0 0 60 100" className="h-full w-auto overflow-visible" style={{ transform: isMirrored ? "scaleX(-1)" : undefined }}>
    <g fill={GLOVE}>
      <rect x="6" y="20" width="10" height="36" rx="5" />
      <rect x="17" y="9" width="10" height="46" rx="5" />
      <rect x="28" y="7" width="10" height="48" rx="5" />
      <rect x="39" y="15" width="10" height="40" rx="5" />
      <rect x="6" y="40" width="44" height="50" rx="11" />
      <rect x="44" y="44" width="11" height="28" rx="5.5" transform="rotate(32 49.5 72)" />
    </g>
    <rect x="9" y="84" width="38" height="16" rx="2" fill={COAT_RED} />
  </svg>
);

// the clap that starts every transmutation: both hands slam in from the sides and meet in a white flash
const Clap = ({ isCalm }) => {
  const slam = (side) =>
    isCalm
      ? { initial: { opacity: 0 }, animate: { opacity: [0, 1, 1, 0] } }
      : { initial: { x: `${side * 60}vw`, opacity: 1 }, animate: { x: [`${side * 60}vw`, "0vw", "0vw", "0vw"], opacity: [1, 1, 1, 0] } };
  const timing = { duration: 0.8, times: [0, BEATS.clap / 0.8, 0.7, 1], ease: "easeIn" };

  return (
    <>
      <div className="absolute inset-x-0 top-1/2 flex h-[min(36vh,14rem)] -translate-y-1/2 justify-center" style={{ filter: `drop-shadow(0 0 16px ${ALCHEMY_BLUE})` }}>
        <motion.div {...slam(-1)} transition={timing} className="h-full">
          <Hand />
        </motion.div>
        <motion.div {...slam(1)} transition={timing} className="h-full">
          <Hand isMirrored />
        </motion.div>
      </div>
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, isCalm ? 0.35 : 0.9, 0] }}
        transition={{ duration: 0.4, delay: BEATS.clap, times: [0, 0.1, 1] }}
      />
    </>
  );
};

// alchemical lightning: a fresh set of jagged bolts every few frames, a blue glow with a white hot core
const Crackle = ({ isCalm }) => {
  const [bolts, setBolts] = useState(() => crackleBolts({ count: 8, floor: FLOOR }));

  useEffect(() => {
    const regrow = setInterval(() => setBolts(crackleBolts({ count: 8, floor: FLOOR })), isCalm ? CALM_CRACKLE_EVERY_MS : CRACKLE_EVERY_MS);
    return () => clearInterval(regrow);
  }, [isCalm]);

  const crackleLength = BEATS.crackleTo - BEATS.crackleFrom;
  return (
    <motion.svg
      viewBox="0 0 100 60"
      className="absolute inset-0 size-full overflow-visible"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: crackleLength, delay: BEATS.crackleFrom, times: [0, 0.08, 0.85, 1] }}
      style={{ mixBlendMode: "screen" }}
    >
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {bolts.map((points, index) => (
          <g key={index}>
            <polyline points={points} stroke={ALCHEMY_BLUE} strokeWidth="1.6" opacity="0.55" style={{ filter: "blur(1px)" }} />
            <polyline points={points} stroke="#e8f4ff" strokeWidth="0.45" />
          </g>
        ))}
      </g>
    </motion.svg>
  );
};

// the circle lying on the floor, drawn in perspective, with the lightning crackling around its rim
const FloorCircle = ({ isCalm }) => (
  <div className="absolute top-[67%] left-1/2 aspect-[100/60] w-[min(94vw,36rem)] -translate-x-1/2 -translate-y-1/2 [perspective:1600px]">
    <div className="absolute top-[60%] left-0 aspect-square w-full -translate-y-1/2 [transform:rotateX(64deg)]">
      <TransmutationCircle
        color={ALCHEMY_BLUE}
        strokeWidth={1.3}
        drawAt={BEATS.drawCircle}
        className="size-full"
        style={{ filter: `drop-shadow(0 0 4px ${ALCHEMY_BLUE}) drop-shadow(0 0 14px ${ALCHEMY_BLUE})` }}
      />
    </div>
    <Crackle isCalm={isCalm} />
  </div>
);

// the Flamel cross from Ed's coat, stamped down in the middle of the circle
const FlamelCross = ({ isCalm }) => (
  <motion.svg
    viewBox="0 0 100 120"
    className="absolute top-[67%] left-1/2 h-[min(34vh,13rem)] w-auto -translate-x-1/2 -translate-y-[62%] overflow-visible"
    initial={{ opacity: 0, scale: isCalm ? 1 : 2.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: isCalm ? 0.3 : 0.16, delay: BEATS.stamp - (isCalm ? 0 : 0.16), ease: "easeIn" }}
    style={{ filter: `drop-shadow(0 0 2px #2a0006) drop-shadow(0 0 18px ${FLAMEL_RED})` }}
  >
    <g fill={FLAMEL_RED}>
      <path d={FLAMEL.wing} />
      <path d={FLAMEL.wing} transform="translate(100 0) scale(-1 1)" />
      {FLAMEL.cross.map((path) => (
        <path key={path} d={path} />
      ))}
      <path d={FLAMEL.crown} />
      <path d={FLAMEL.serpent} fill="none" stroke={FLAMEL_RED} strokeWidth="5" strokeLinecap="round" />
      <path d={FLAMEL.serpent} fill="none" stroke="#2a0006" strokeWidth="1" strokeDasharray="2 4" />
      <path d={FLAMEL.serpentHead} />
    </g>
  </motion.svg>
);

// the transmutation this portfolio actually performed: one codebase traded for three brands
const Payoff = () => (
  <motion.p
    className="font-display text-[clamp(1.1rem,4.6vw,2rem)] leading-tight text-balance text-white"
    initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
    transition={{ duration: 0.6, delay: BEATS.payoff, ease: easeOutExpo }}
    style={{ textShadow: `0 0 18px ${ALCHEMY_BLUE}` }}
  >
    1 React codebase{" "}
    <motion.span
      className="inline-block"
      style={{ color: FLAMEL_RED, textShadow: `0 0 14px ${FLAMEL_RED}` }}
      initial={{ rotate: -180 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 0.6, delay: BEATS.payoff, ease: easeOutExpo }}
    >
      ⇄
    </motion.span>{" "}
    3 FirstWord brands
  </motion.p>
);

// the law of equivalent exchange, then what it means around here. starts low enough to clear the relic counter
const Narration = () => (
  <div className="absolute inset-x-4 top-[max(9vh,6.5rem)] flex flex-col items-center gap-3 text-center">
    <motion.p
      className="font-display text-[clamp(1.6rem,7.5vw,3.75rem)] leading-tight text-balance tracking-[0.08em] text-white"
      initial={{ opacity: 0, scale: 1.15, letterSpacing: "0.3em" }}
      animate={{ opacity: 1, scale: 1, letterSpacing: "0.08em" }}
      transition={{ duration: 0.7, delay: BEATS.title, ease: easeOutExpo }}
      style={{ textShadow: `0 0 24px ${ALCHEMY_BLUE}, 0 0 4px ${ALCHEMY_BLUE}` }}
    >
      EQUIVALENT EXCHANGE
    </motion.p>
    <p className="max-w-md font-serif text-sm text-pretty text-white/85 italic sm:text-base">
      <TypedText text="To obtain, something of equal value must be lost." startAt={BEATS.narration} perLetter={0.022} />
    </p>
    <Payoff />
    <motion.p
      className="font-mono text-xs tracking-[0.2em] uppercase sm:text-sm"
      style={{ color: ALCHEMY_BLUE }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: BEATS.tagline, ease: easeOutExpo }}
    >
      hard problems in, readable code out.
    </motion.p>
  </div>
);

/** Fullmetal Alchemist: a clap, a circle drawn on the floor crackling with blue lightning, and the Flamel cross stamped in red. */
const Transmutation = ({ onDone }) => {
  const isCalm = useReducedMotion();
  useMomentLength(BEATS.lastsMs, onDone);

  return (
    <EffectLayer background={veil(ALCHEMY_BLUE, 0.9)}>
      <FloorCircle isCalm={isCalm} />
      <div className="absolute inset-x-0 top-[67%] h-0">
        <Shockwave color={FLAMEL_RED} delay={BEATS.stamp} />
        {!isCalm && <Sparks colors={[ALCHEMY_BLUE, "#e8f4ff", FLAMEL_RED]} count={14} reach={36} delay={BEATS.stamp} />}
      </div>
      <FlamelCross isCalm={isCalm} />
      <Narration />
      <Clap isCalm={isCalm} />
    </EffectLayer>
  );
};

export default Transmutation;
