import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, LightRays, Shockwave, Sparks } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { useLazyGetRollQuery } from "../../../api/rollApi";
import { verdictFor } from "../../../lib/dice";
import { easeOutExpo } from "../../../lib/motion";
import { playRecipe } from "../../../lib/sound";
import { Die } from "./Die";
import { D20_CRIMSON, D20_GOLD, PERSUASION_DC, TUMBLE_MS, VERDICT_LOOKS, VERDICT_SETTLE_MS, lastFace, nextFlickerFace, rollWithPatience } from "./helpers";
import { VERDICT_SOUNDS } from "./sound";

const PARCHMENT = "#efe3c4";
const PARCHMENT_DIM = "#b9ab8a";

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

// one gold flourish for the corners of the panel: a bracket, a curl and a diamond, drawn for the top left
const Filigree = ({ className, flip = "" }) => (
  <svg viewBox="0 0 40 40" className={`absolute size-10 ${className}`} style={{ transform: flip }} aria-hidden="true">
    <path d="M2 38 V12 Q2 2 12 2 H38" fill="none" stroke={D20_GOLD} strokeWidth="1.4" />
    <path d="M7 30 V14 Q7 7 14 7 H30" fill="none" stroke={D20_GOLD} strokeWidth="0.6" strokeOpacity="0.7" />
    <path d="M13 22 q0 -9 9 -9 q5 0 5 4 q0 3 -3 3 q-2 0 -2 -2" fill="none" stroke={D20_GOLD} strokeWidth="0.9" />
    <path d="M12 9 L14 12 L12 15 L10 12 Z" fill={D20_GOLD} />
  </svg>
);

const FrameOrnaments = () => (
  <>
    <Filigree className="top-1.5 left-1.5" />
    <Filigree className="top-1.5 right-1.5" flip="scaleX(-1)" />
    <Filigree className="bottom-1.5 left-1.5" flip="scaleY(-1)" />
    <Filigree className="right-1.5 bottom-1.5" flip="scale(-1,-1)" />
    <svg viewBox="0 0 60 12" className="absolute -top-1.5 left-1/2 w-16 -translate-x-1/2" aria-hidden="true">
      <path d="M0 6 H22 L30 0 L38 6 H60 M22 6 L30 12 L38 6" fill="#0d0a07" stroke={D20_GOLD} strokeWidth="1.2" />
    </svg>
  </>
);

const Header = () => (
  <motion.div
    className="flex flex-col items-center gap-1.5 text-center"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: easeOutExpo }}
  >
    <p className="font-display text-[clamp(1.5rem,7vw,2.25rem)] leading-none tracking-[0.22em]" style={{ color: D20_GOLD, textShadow: `0 0 20px ${D20_GOLD}55` }}>
      PERSUASION
    </p>
    <p className="flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase" style={{ color: PARCHMENT_DIM }}>
      <span className="h-px w-6 bg-current opacity-60" />
      Difficulty Class {PERSUASION_DC}
      <span className="h-px w-6 bg-current opacity-60" />
    </p>
  </motion.div>
);

// the jagged split that runs down the die on a natural 1
const Crack = () => (
  <motion.path
    d="M52 4 L46 24 L56 38 L43 55 L55 70 L47 96 M56 38 L68 44 M43 55 L30 58"
    fill="none"
    stroke={D20_CRIMSON}
    strokeWidth="2.2"
    strokeLinejoin="bevel"
    initial={{ pathLength: 0 }}
    animate={{ pathLength: 1 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    style={{ filter: `drop-shadow(0 0 3px ${D20_CRIMSON})` }}
  />
);

// how the die moves: a long tumble in from above while rolling, a pop (or a shudder on a 1) once it lands
const dieMotion = (verdict, isStill) => {
  if (isStill) return { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4 } };
  if (!verdict) {
    return {
      initial: { rotate: -720, rotateX: 0, scale: 0.35, y: -140 },
      animate: { rotate: [-720, -140, 20, 0], rotateX: [0, 540, 700, 720], scale: [0.35, 1.1, 0.95, 1], y: [-140, 10, -18, 0] },
      transition: { duration: TUMBLE_MS / 1000, times: [0, 0.55, 0.8, 1], ease: "easeOut" },
    };
  }
  const shudder = verdict.tone === "fumble" ? [0, -9, 8, -5, 3, 0] : 0;
  return { animate: { rotate: 0, scale: [1.18, 1], x: shudder }, transition: { duration: 0.6, ease: easeOutExpo } };
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

  return (
    <div className="relative grid size-[min(46vw,13rem,30vh)] place-items-center [perspective:700px]">
      {verdict && <Flourish key="landed" tone={verdict.tone} />}
      <motion.div
        className="relative size-full"
        {...dieMotion(verdict, isStill)}
        style={{
          filter: isDull ? "saturate(0.4) brightness(0.7)" : `drop-shadow(0 0 ${result ? 26 : 12}px ${D20_GOLD}88)`,
        }}
      >
        <Die face={result ? result.roll : flicker} numberColor={look && look.flourish === "crack" ? D20_CRIMSON : undefined} className="size-full">
          {look?.flourish === "crack" && <Crack />}
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
        className="font-display text-[clamp(1.4rem,7vw,2.6rem)] leading-tight uppercase"
        style={{ color, textShadow: `0 0 28px ${color}88` }}
        initial={{ opacity: 0, scale: 1.6, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, scale: 1, letterSpacing: "0.14em" }}
        transition={{ duration: 0.55, delay: 0.15, ease: easeOutExpo }}
      >
        {verdict.label}
      </motion.p>
      <motion.p
        className="max-w-xs text-sm text-pretty italic"
        style={{ color: PARCHMENT }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {line}
      </motion.p>
      {bonus && (
        <motion.p
          className="max-w-xs text-sm font-semibold text-pretty"
          style={{ color: D20_GOLD, textShadow: `0 0 14px ${D20_GOLD}66` }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
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
 * Baldur's Gate's dice roll: an ornate panel asks for persuasion against DC 8, the d20 tumbles and lands on the
 * API's roll, and the verdict stamps under it with its chord.
 */
const PersuasionCheck = ({ onDone }) => {
  const isStill = useReducedMotion();
  const result = useRoll();
  const verdict = result ? verdictFor(result) : null;

  return (
    <EffectLayer
      background={`${easedGlow("rgb(48 34 16)", { strength: 0.85, shape: "ellipse", reach: 90 })}, rgba(5,4,3,0.94)`}
      className="flex items-center justify-center px-4 pt-4 pb-24"
    >
      <motion.div
        className="relative flex w-full max-w-md flex-col items-center gap-6 border px-5 pt-9 pb-8 sm:px-8"
        style={{
          borderColor: `${D20_GOLD}99`,
          background: "linear-gradient(to bottom, #1a130b, #0d0a07)",
          boxShadow: `inset 0 0 0 4px #0d0a07, inset 0 0 0 5px ${D20_GOLD}44, 0 30px 80px rgba(0,0,0,0.7)`,
        }}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
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
