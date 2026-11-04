import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bloom, Burst, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { D20 } from "../emblems";
import { useLazyGetRollQuery } from "../../../api/rollApi";
import { verdictFor } from "../../../lib/dice";
import { easeOutExpo } from "../../../lib/motion";
import { playRecipe } from "../../../lib/sound";
import { D20_GOLD, PERSUASION_DC, TUMBLE_MS, VERDICT_LOOKS, VERDICT_SETTLE_MS, lastFace, nextFlickerFace, rollWithPatience } from "./helpers";
import { VERDICT_SOUNDS } from "./sound";

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

// numbers flash on the die while it tumbles, never the same one twice
const useFlickerFace = (isRolling) => {
  const [face, setFace] = useState(20);
  useEffect(() => {
    if (!isRolling) return;
    const timer = setInterval(() => setFace((previous) => nextFlickerFace(previous)), 90);
    return () => clearInterval(timer);
  }, [isRolling]);
  return face;
};

// the die tumbles in spinning, then lands with a pop, or a shudder on a natural 1
const Die = ({ result }) => {
  const flicker = useFlickerFace(!result);
  const isFumble = result?.roll === 1;
  return (
    <motion.div
      className="absolute top-[36%] left-1/2 size-[min(34vmin,14rem)] -translate-x-1/2 -translate-y-1/2"
      initial={{ y: "-60vh", rotate: -720, scale: 0.5 }}
      animate={result ? { y: 0, rotate: 0, scale: [1.2, 1], x: isFumble ? [0, -10, 10, -6, 0] : 0 } : { y: 0, rotate: [0, 360], scale: 0.85 }}
      transition={result ? { duration: 0.5, ease: easeOutExpo } : { y: { duration: 0.8, ease: easeOutExpo }, rotate: { duration: 0.6, repeat: Infinity, ease: "linear" }, scale: { duration: 0.8 } }}
      style={{ filter: `drop-shadow(0 0 24px ${D20_GOLD}66)` }}
    >
      <D20 face={result ? result.roll : flicker} className="size-full" />
    </motion.div>
  );
};

// a natural 1 cracks the die: dark lines spreading out from the middle
const Cracks = () => (
  <svg viewBox="0 0 64 64" className="absolute top-[36%] left-1/2 size-[min(34vmin,14rem)] -translate-x-1/2 -translate-y-1/2">
    {["M32 32L20 14", "M32 32L50 22", "M32 32L28 54", "M32 32L46 48"].map((d) => (
      <motion.path key={d} d={d} stroke="#c8443c" strokeWidth="1.6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: easeOutExpo }} />
    ))}
  </svg>
);

// mounts once the die has landed, so the moment only counts as settled after the verdict
const Verdict = ({ result, onDone }) => {
  useMomentLength(VERDICT_SETTLE_MS, onDone);
  const { label, tone } = verdictFor(result);
  const look = VERDICT_LOOKS[tone];
  return (
    <>
      {look.flourish !== "none" && look.flourish !== "crack" && <Bloom color={look.color} size="min(50vmin,24rem)" className="top-[36%]" />}
      {look.flourish === "burst" && <Burst color={look.color} count={22} className="top-[36%]" />}
      {look.flourish === "crack" && <Cracks />}
      <MomentCopy color={look.color} eyebrow={`Baldur's Gate 3 · Persuasion, DC ${PERSUASION_DC} · rolled ${result.roll}`} title={`${label}.`} lines={[look.line, look.bonus].filter(Boolean)} />
    </>
  );
};

/** Baldur's Gate 3: a persuasion check. The d20 tumbles in, lands on the API's roll, and the verdict rises under it. */
const PersuasionMoment = ({ onDone }) => {
  const result = useRoll();
  return (
    <MomentLayer color={D20_GOLD} glowAt="50% 36%">
      <motion.p
        className="absolute top-[12%] inset-x-0 text-center text-sm font-semibold tracking-wide text-white/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: result ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        Persuasion check · DC {PERSUASION_DC}
      </motion.p>
      <Die result={result} />
      {result && <Verdict result={result} onDone={onDone} />}
    </MomentLayer>
  );
};

export default PersuasionMoment;
