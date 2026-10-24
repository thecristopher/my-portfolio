import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength, veil } from "../moment";
import PixelArt from "../../PixelArt";
import { easedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import { FloorPixelCircle } from "./Circle";
import { ALCHEMY_BLUE, EXCHANGE_ARROWS, FLAMEL_RED, GLOVE_PALETTE, GLOVE_ROWS } from "./flamel";
import { FlamelSprite } from "./Emblem";
import { BEATS, FLOOR, crackleJoints, haloPixels, pathPixels, pixelPath } from "./helpers";

const CRACKLE_CORE = "#e8f4ff";
// how often the lightning grows a new shape. a few frames apart reads as crackle, every frame reads as noise
const CRACKLE_EVERY_MS = 70;
const CALM_CRACKLE_EVERY_MS = 400;
// a hard pixel outline in place of a soft glow, the way a sprite gets lit on a 16 bit screen
const pixelOutline = (color, size = 3) =>
  `drop-shadow(${size}px 0 0 ${color}) drop-shadow(-${size}px 0 0 ${color}) drop-shadow(0 ${size}px 0 ${color}) drop-shadow(0 -${size}px 0 ${color})`;

// one frame of lightning as two pixel paths: the blue halo and the white hot core on top of it
const crackleFrame = () => {
  const core = crackleJoints({ count: 8, floor: FLOOR }).flatMap(pathPixels);
  return { halo: pixelPath(haloPixels(core)), bolt: pixelPath(core) };
};

/** One white glove, palm out and fingers up, with the red coat cuff at the wrist. */
const Hand = ({ isMirrored }) => (
  <PixelArt rows={GLOVE_ROWS} palette={GLOVE_PALETTE} className="h-full w-auto" style={{ transform: isMirrored ? "scaleX(-1)" : undefined }} />
);

// the clap that starts every transmutation: both hands slam in from the sides and meet in a white flash
const Clap = ({ isCalm }) => {
  const slam = (side) =>
    isCalm
      ? { initial: { opacity: 0 }, animate: { opacity: [0, 1, 1, 0] } }
      : { initial: { x: `${side * 60}vw`, opacity: 1 }, animate: { x: [`${side * 60}vw`, "0vw", "0vw", "0vw"], opacity: [1, 1, 1, 0] } };
  const timing = { duration: 0.8, times: [0, BEATS.clap / 0.8, 0.7, 1], ease: pixelSteps(4) };

  return (
    <>
      <div className="absolute inset-x-0 top-1/2 flex h-[min(36vh,14rem)] -translate-y-1/2 justify-center" style={{ filter: pixelOutline(ALCHEMY_BLUE) }}>
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
        transition={{ duration: 0.4, delay: BEATS.clap, times: [0, 0.1, 1], ease: pixelSteps(3) }}
      />
    </>
  );
};

// alchemical lightning: a fresh set of jagged pixel bolts every few frames, a blue halo with a white hot core
const Crackle = ({ isCalm }) => {
  const [frame, setFrame] = useState(crackleFrame);

  useEffect(() => {
    const regrow = setInterval(() => setFrame(crackleFrame()), isCalm ? CALM_CRACKLE_EVERY_MS : CRACKLE_EVERY_MS);
    return () => clearInterval(regrow);
  }, [isCalm]);

  const crackleLength = BEATS.crackleTo - BEATS.crackleFrom;
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: crackleLength, delay: BEATS.crackleFrom, times: [0, 0.08, 0.85, 1], ease: pixelSteps(3) }}
    >
      <path d={frame.halo} fill={ALCHEMY_BLUE} opacity="0.7" />
      <path d={frame.bolt} fill={CRACKLE_CORE} />
    </motion.g>
  );
};

// the circle lying on the floor and the lightning crackling around its rim, all on one 100 by 60 pixel grid
const FloorCircle = ({ isCalm }) => (
  <svg
    viewBox="0 0 100 60"
    shapeRendering="crispEdges"
    className="absolute top-[67%] left-1/2 aspect-[100/60] w-[min(94vw,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
    aria-hidden="true"
  >
    <FloorPixelCircle color={ALCHEMY_BLUE} drawAt={BEATS.drawCircle} />
    <Crackle isCalm={isCalm} />
  </svg>
);

// the Flamel cross from Ed's coat, stamped down in the middle of the circle over a banded red glow
const FlamelCross = ({ isCalm }) => (
  <motion.div
    className="absolute top-[67%] left-1/2 aspect-[22/27] h-[min(34vh,13rem)] -translate-x-1/2 -translate-y-[62%]"
    initial={{ opacity: 0, scale: isCalm ? 1 : 2.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: isCalm ? 0.3 : 0.16, delay: BEATS.stamp - (isCalm ? 0 : 0.16), ease: pixelSteps(4) }}
  >
    <div className="absolute -inset-[40%]" style={{ background: easedGlow(FLAMEL_RED, { strength: 0.5 }) }} />
    <FlamelSprite className="relative block size-full" style={{ filter: "drop-shadow(3px 3px 0 #2a0006)" }} />
  </motion.div>
);

// the transmutation this portfolio actually performed: one codebase traded for three brands
const Payoff = () => (
  <motion.p
    className="flex flex-wrap items-center justify-center gap-x-3 font-pixel text-[clamp(1.1rem,4.6vw,2rem)] leading-tight text-balance text-white [text-shadow:3px_3px_0_#0b1f3d]"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay: BEATS.payoff, ease: pixelSteps(4) }}
  >
    <span>1 React codebase</span>
    {/* the arrows flip over once, the trade happening */}
    <motion.span
      className="inline-block h-[0.9em] w-[0.8em]"
      initial={{ scaleX: -1 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.6, delay: BEATS.payoff, ease: pixelSteps(2) }}
    >
      <PixelArt rows={EXCHANGE_ARROWS} palette={{ "#": FLAMEL_RED }} className="block size-full" style={{ filter: "drop-shadow(2px 2px 0 #2a0006)" }} />
    </motion.span>
    <span>3 FirstWord brands</span>
  </motion.p>
);

// the law of equivalent exchange, then what it means around here. starts low enough to clear the relic counter
const Narration = () => (
  <div className="absolute inset-x-4 top-[max(9vh,6.5rem)] flex flex-col items-center gap-3 text-center">
    <motion.p
      className="font-pixel text-[clamp(1.6rem,7.5vw,3.75rem)] leading-tight text-balance tracking-[0.08em] text-white"
      initial={{ opacity: 0, scale: 1.15, letterSpacing: "0.3em" }}
      animate={{ opacity: 1, scale: 1, letterSpacing: "0.08em" }}
      transition={{ duration: 0.7, delay: BEATS.title, ease: pixelSteps(5) }}
      style={{ textShadow: `3px 3px 0 #0b1f3d, -2px 0 0 ${ALCHEMY_BLUE}, 2px 0 0 ${ALCHEMY_BLUE}` }}
    >
      EQUIVALENT EXCHANGE
    </motion.p>
    <p className="max-w-md font-pixel text-sm text-pretty text-white/85 [text-shadow:2px_2px_0_#0b1f3d] sm:text-base">
      <TypedText text="To obtain, something of equal value must be lost." startAt={BEATS.narration} perLetter={0.022} />
    </p>
    <Payoff />
    <motion.p
      className="font-pixel text-xs tracking-[0.2em] uppercase [text-shadow:2px_2px_0_#0b1f3d] sm:text-sm"
      style={{ color: ALCHEMY_BLUE }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: BEATS.tagline, ease: pixelSteps(4) }}
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
