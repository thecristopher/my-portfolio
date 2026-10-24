import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, LightRays, Shockwave, Sparks } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { useLazyGetRollQuery } from "../../../api/rollApi";
import { verdictFor } from "../../../lib/dice";
import { pixelSteps } from "../../../lib/motion";
import { playRecipe } from "../../../lib/sound";
import PixelArt from "../../PixelArt";
import { Die } from "./Die";
import {
  D20_CRIMSON,
  D20_GOLD,
  PERSUASION_DC,
  TUMBLE_MS,
  VERDICT_LOOKS,
  VERDICT_SETTLE_MS,
  crackRows,
  lastFace,
  nextFlickerFace,
  rollWithPatience,
} from "./helpers";
import { CREST_ROWS, FILIGREE_ROWS } from "./sprites";
import { VERDICT_SOUNDS } from "./sound";

const PARCHMENT = "#efe3c4";
const PARCHMENT_DIM = "#b9ab8a";
const PANEL_DARK = "#0d0a07";
// a hard shadow one pixel step down and right, the way 16 bit menus lift their text off the panel
const PIXEL_SHADOW = `2px 2px 0 ${PANEL_DARK}`;

// the die in the moment is drawn on a bigger grid than the one on the page, so the hero gets more detail
const HERO_SIZE = 40;
const CRACK_ROWS = crackRows(HERO_SIZE);
const CRACK_PALETTE = { c: D20_CRIMSON };
const ORNAMENT_PALETTE = { G: D20_GOLD, h: "#fbe9b4", d: "#8d6a28", K: PANEL_DARK };

/**
 * Rolls once on mount: asks the API, falls back to a local roll, and only lands after the die has tumbled a while.
 * When it lands the face is remembered for the die on the page and the verdict plays its chord.
 * @returns {{ roll: number, dc: number, success: boolean, message: string } | null} null while the die is still tumbling
 */
const useRoll = () => {
  const [requestRoll] = useLazyGetRollQuery();
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isLive = true;
    let landTimer;
    const startedAt = Date.now();

    rollWithPatience(() => requestRoll(undefined, false).unwrap()).then((rolled) => {
      if (!isLive) return;
      const stillTumbling = Math.max(0, TUMBLE_MS - (Date.now() - startedAt));
      landTimer = setTimeout(() => {
        setResult(rolled);
        lastFace.set(rolled.roll);
        playRecipe(VERDICT_SOUNDS[verdictFor(rolled).tone]);
      }, stillTumbling);
    });

    return () => {
      isLive = false;
      clearTimeout(landTimer);
    };
  }, [requestRoll]);

  return result;
};

// numbers flash across the front face while the die spins, like the real roll in camp
const useFlicker = (isRolling) => {
  const [face, setFace] = useState(20);
  useEffect(() => {
    if (!isRolling) return undefined;
    const timer = setInterval(() => setFace((previous) => nextFlickerFace(previous)), 70);
    return () => clearInterval(timer);
  }, [isRolling]);
  return face;
};

// the corners flip the one top left flourish, so all four share the exact same pixels
const FILIGREE_CORNERS = [
  { place: "top-1.5 left-1.5", flip: "none" },
  { place: "top-1.5 right-1.5", flip: "scaleX(-1)" },
  { place: "bottom-1.5 left-1.5", flip: "scaleY(-1)" },
  { place: "right-1.5 bottom-1.5", flip: "scale(-1, -1)" },
];

const FrameOrnaments = () => (
  <>
    {FILIGREE_CORNERS.map(({ place, flip }) => (
      <PixelArt key={place} rows={FILIGREE_ROWS} palette={ORNAMENT_PALETTE} className={`absolute size-9 ${place}`} style={{ transform: flip }} />
    ))}
    <PixelArt rows={CREST_ROWS} palette={ORNAMENT_PALETTE} className="absolute -top-3.5 left-1/2 h-7 w-[3.75rem] -translate-x-1/2" />
  </>
);

const Header = () => (
  <motion.div
    className="flex flex-col items-center gap-1.5 text-center"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: pixelSteps(5) }}
  >
    <p className="font-pixel text-[clamp(1.5rem,7vw,2.25rem)] leading-none tracking-[0.22em]" style={{ color: D20_GOLD, textShadow: `3px 3px 0 ${PANEL_DARK}` }}>
      PERSUASION
    </p>
    <p className="flex items-center gap-2 font-pixel text-xs tracking-[0.3em] uppercase" style={{ color: PARCHMENT_DIM, textShadow: PIXEL_SHADOW }}>
      <span className="h-0.5 w-6 bg-current opacity-60" />
      Difficulty Class {PERSUASION_DC}
      <span className="h-0.5 w-6 bg-current opacity-60" />
    </p>
  </motion.div>
);

// the jagged split that runs down the die on a natural 1, cracking open from the top in a few frames
const Crack = () => (
  <motion.span
    className="absolute inset-0"
    initial={{ clipPath: "inset(0 0 100% 0)" }}
    animate={{ clipPath: "inset(0 0 0% 0)" }}
    transition={{ duration: 0.35, ease: pixelSteps(5) }}
  >
    <PixelArt rows={CRACK_ROWS} palette={CRACK_PALETTE} className="block size-full" />
  </motion.span>
);

// how the die moves: a long tumble in from above while rolling, a pop (or a shudder on a 1) once it lands. sprites
// never rotate, so the spin is the die flipping on its side like a coin, frame by frame
const dieMotion = (verdict, isStill) => {
  if (isStill) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, ease: pixelSteps(3) } };
  if (!verdict) {
    return {
      initial: { scaleX: 1, scale: 0.35, y: -140 },
      animate: { scaleX: [1, -1, 1, -1, 1, -1, 1], scale: [0.35, 1.1, 0.95, 1], y: [-140, 10, -18, 0] },
      transition: {
        scaleX: { duration: (TUMBLE_MS / 1000) * 0.8, ease: pixelSteps(2) },
        default: { duration: TUMBLE_MS / 1000, times: [0, 0.55, 0.8, 1], ease: pixelSteps(4) },
      },
    };
  }
  const shudder = verdict.tone === "fumble" ? [0, -9, 8, -5, 3, 0] : 0;
  return { animate: { scaleX: 1, scale: [1.18, 1], x: shudder }, transition: { duration: 0.6, ease: pixelSteps(3) } };
};

const Flourish = ({ tone }) => {
  const look = VERDICT_LOOKS[tone];
  if (look.flourish === "burst") {
    return (
      <>
        <LightRays color={D20_GOLD} />
        <Sparks colors={[D20_GOLD, "#fff1c4"]} count={16} reach={38} />
        <Shockwave color={D20_GOLD} size="100%" />
      </>
    );
  }
  if (look.flourish === "ring") return <Shockwave color={D20_GOLD} size="100%" />;
  if (look.flourish === "crack") return <Shockwave color={D20_CRIMSON} size="100%" />;
  return null;
};

const TumblingDie = ({ result, verdict, isStill }) => {
  const flicker = useFlicker(!result);
  const look = verdict ? VERDICT_LOOKS[verdict.tone] : null;
  const isDull = verdict?.tone === "failure";
  const isCracked = look?.flourish === "crack";

  return (
    <div className="relative grid size-[min(46vw,13rem,30vh)] place-items-center">
      {verdict && <Flourish key="landed" tone={verdict.tone} />}
      {!isDull && (
        <span className="absolute -inset-[20%]" style={{ background: easedGlow(D20_GOLD, { strength: result ? 0.45 : 0.25 }) }} />
      )}
      <motion.div className="relative size-full" {...dieMotion(verdict, isStill)} style={{ filter: isDull ? "saturate(0.4) brightness(0.7)" : undefined }}>
        <Die face={result ? result.roll : flicker} size={HERO_SIZE} numberColor={isCracked ? D20_CRIMSON : undefined} className="block size-full">
          {isCracked && <Crack />}
        </Die>
      </motion.div>
    </div>
  );
};

const Verdict = ({ verdict }) => {
  const { color, line, bonus } = VERDICT_LOOKS[verdict.tone];
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <motion.p
        className="font-pixel text-[clamp(1.4rem,7vw,2.6rem)] leading-tight uppercase"
        style={{ color, textShadow: `3px 3px 0 ${PANEL_DARK}` }}
        initial={{ opacity: 0, scale: 1.6, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, scale: 1, letterSpacing: "0.14em" }}
        transition={{ duration: 0.55, delay: 0.15, ease: pixelSteps(5) }}
      >
        {verdict.label}
      </motion.p>
      <motion.p
        className="max-w-xs font-pixel text-sm text-pretty"
        style={{ color: PARCHMENT, textShadow: PIXEL_SHADOW }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: pixelSteps(3) }}
      >
        {line}
      </motion.p>
      {bonus && (
        <motion.p
          className="max-w-xs font-pixel text-sm font-semibold text-pretty"
          style={{ color: D20_GOLD, textShadow: PIXEL_SHADOW }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1, ease: pixelSteps(3) }}
        >
          {bonus}
        </motion.p>
      )}
    </div>
  );
};

// mounts only once the die has landed, so the moment counts as settled after the roll and never while it tumbles
const SettlesAfterLanding = ({ onDone }) => {
  useMomentLength(VERDICT_SETTLE_MS, onDone);
  return null;
};

/**
 * Baldur's Gate's dice roll in 16 bit: an ornate pixel panel asks for persuasion against DC 8, the d20 tumbles and lands on the
 * API's roll, and the verdict stamps under it with its chord.
 */
const PersuasionCheck = ({ onDone }) => {
  const isStill = useReducedMotion();
  const result = useRoll();
  const verdict = result ? verdictFor(result) : null;

  return (
    <EffectLayer
      background={`${easedGlow("rgb(48 34 16)", { strength: 0.85, reach: 90 })}, rgba(5,4,3,0.94)`}
      className="flex items-center justify-center px-4 pt-4 pb-24"
    >
      <motion.div
        className="relative flex w-full max-w-md flex-col items-center gap-6 border-[3px] px-5 pt-10 pb-8 sm:px-8"
        style={{
          borderColor: D20_GOLD,
          // the panel darkens toward the bottom in flat bands, and its shadow is a solid block instead of a blur
          background: `linear-gradient(to bottom, #1a130b 0 40%, #140f09 40% 75%, ${PANEL_DARK} 75%)`,
          boxShadow: `0 0 0 3px ${PANEL_DARK}, inset 0 0 0 3px ${PANEL_DARK}, inset 0 0 0 5px ${D20_GOLD}55, 10px 10px 0 3px rgba(0,0,0,0.6)`,
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: pixelSteps(4) }}
      >
        <FrameOrnaments />
        <Header />
        <TumblingDie result={result} verdict={verdict} isStill={isStill} />
        <div className="flex min-h-28 items-start justify-center">{verdict && <Verdict verdict={verdict} />}</div>
        {verdict && <SettlesAfterLanding onDone={onDone} />}
      </motion.div>
    </EffectLayer>
  );
};

export default PersuasionCheck;
