import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Sprite from "../../components/Sprite";
import { METROID } from "../../lib/sprites/metroid";
import { ZERO_SUIT } from "../../lib/sprites/samus";
import { aimPoseFor, encounterCues, encounterLine, encounterStage, energyLeft, travel } from "./actions";

const PIXEL = { fontFamily: '"Pixelify Sans", ui-monospace, monospace' };
// the larva drawn big enough to read clearly on the card
const LARVA_SCALE = 2;
const LARVA_SIZE = { width: METROID.cell.width * LARVA_SCALE, height: METROID.cell.height * LARVA_SCALE };

// the fight's stage, moving through every part on its own timer from the moment the card opens
const useStage = () => {
  const [stage, setStage] = useState("arriving");

  useEffect(() => {
    const timers = encounterCues().map((at) => setTimeout(() => setStage(encounterStage(at)), at));
    return () => timers.forEach(clearTimeout);
  }, []);

  return stage;
};

// where everything stands on the card, measured from its layout so the card's own grow in doesn't skew it: the larva
// on top of the planet, Samus under the card's corner, and the beam between her Paralyzer and the larva. it's
// measured a frame after mounting, since the card hands over its ref only after its children have mounted
const useStagePlan = (cardRef, sphereRef) => {
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setPlan(planFor(cardRef.current, sphereRef.current)));
    return () => cancelAnimationFrame(frame);
  }, [cardRef, sphereRef]);

  return plan;
};

const planFor = (card, sphere) => {
  if (!card || !sphere) return null;
  // on top of the planet and toward the card's edge, clear of the text beside it
  const larva = { x: sphere.offsetLeft + sphere.offsetWidth * 0.35, y: sphere.offsetTop + sphere.offsetHeight * 0.05 };
  const samus = { left: 0, top: card.offsetHeight };
  const chest = { x: ZERO_SUIT.cell.width / 2, y: samus.top + ZERO_SUIT.cell.height * 0.4 };
  const pose = aimPoseFor(chest, larva);
  const muzzle = { x: ZERO_SUIT.muzzles[pose].x, y: samus.top + ZERO_SUIT.muzzles[pose].y };
  return { larva, samus, pose, muzzle, beam: travel(muzzle, larva) };
};

const larvaMotion = (stage, isDefeated, isStill) => {
  if (stage === "hurt" && !isStill) return { x: [0, -7, 7, -5, 5, -2, 0], filter: ["brightness(1)", "brightness(2.6) saturate(2)", "brightness(1)"] };
  if (stage !== "leaving" && stage !== "done") return { x: 0, filter: "brightness(1)" };
  if (isDefeated) return { scale: [1, 1.7, 0], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(5)", "brightness(5)"] };
  return isStill ? { opacity: 0 } : { x: 160, y: -140, scale: 0.4, opacity: 0 };
};

// the larva on top of the planet: pulsing, then hurt with its hull flickering away, then gone
const Larva = ({ at, stage, isDefeated, isStill }) => {
  const isHurt = stage === "hurt";
  return (
    <motion.span
      className="absolute"
      style={{ left: at.x - LARVA_SIZE.width / 2, top: at.y - LARVA_SIZE.height / 2 }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1, ...larvaMotion(stage, isDefeated, isStill) }}
      transition={{ duration: stage === "leaving" ? 0.7 : 0.6 }}
    >
      <Sprite key={isHurt ? "hurt" : "pulse"} sheet={METROID} animation={isHurt ? "hurt" : "pulse"} scale={LARVA_SCALE} />
    </motion.span>
  );
};

// the Paralyzer's beam: a bolt of light that shoots out of the pistol and slams into the larva
const Beam = ({ from, beam }) => (
  <motion.span
    className="absolute h-1.5 origin-left rounded-full bg-[linear-gradient(90deg,#d6fbff,#5ee7ff_40%,#ffffff)] shadow-[0_0_14px_4px_rgba(94,231,255,0.75)]"
    style={{ left: from.x, top: from.y - 3, width: beam.length, rotate: beam.angle }}
    initial={{ scaleX: 0, opacity: 1 }}
    animate={{ scaleX: 1, opacity: [1, 1, 0] }}
    transition={{ duration: 0.25, ease: "easeOut", opacity: { duration: 0.6, times: [0, 0.5, 1] } }}
  />
);

// the flash where the beam lands
const Burst = ({ at }) => (
  <motion.span
    className="absolute size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffffff_0%,#9cf3ff_35%,transparent_70%)]"
    style={{ left: at.x, top: at.y }}
    initial={{ scale: 0.2, opacity: 1 }}
    animate={{ scale: 2.2, opacity: 0 }}
    transition={{ duration: 0.45, ease: "easeOut" }}
  />
);

const samusPose = (stage, pose) => {
  if (stage === "aiming" || stage === "firing" || stage === "hurt") return pose;
  return "idle";
};

// the result, in big pixel type over the card: the hit count with the larva's energy left, or the win
const Result = ({ encounter }) => (
  <motion.p
    role="status"
    className="absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#0b1430] px-4 py-2 text-sm whitespace-nowrap text-white uppercase shadow-xl sm:text-base"
    style={PIXEL}
    initial={{ opacity: 0, y: 10, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 420, damping: 18 }}
  >
    {encounterLine(encounter)}
    <span className="flex gap-1" aria-hidden="true">
      {energyLeft(encounter.hits).map((isLeft, index) => (
        <span key={index} className={`size-2.5 rounded-sm ${isLeft ? "bg-[#ff4d6d]" : "bg-white/20"}`} />
      ))}
    </span>
  </motion.p>
);

/**
 * The fight that plays in an opened card when the Metroid larva was hiding behind that tool: it clings to the top of
 * the planet, Samus steps up under the card and fires her Paralyzer, the larva shakes with its hull flickering
 * away, and then it flees, or burns away on the last hit, leaving the result over the card.
 * @param {{ encounter: { hits: number, isDefeated: boolean }, cardRef: { current: HTMLElement | null }, sphereRef: { current: HTMLElement | null } }} props
 *   encounter is the hunt right after this hit, cardRef the card and sphereRef its planet, to stage the fight around them
 */
const Encounter = ({ encounter, cardRef, sphereRef }) => {
  const isStill = useReducedMotion();
  const stage = useStage();
  const plan = useStagePlan(cardRef, sphereRef);
  if (!plan) return null;
  const hasSamus = stage !== "arriving";
  const hasLanded = stage === "hurt" || stage === "leaving" || stage === "done";

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!hasLanded}>
      <Larva at={plan.larva} stage={stage} isDefeated={encounter.isDefeated} isStill={isStill} />
      <AnimatePresence>
        {hasSamus && (
          <motion.span
            className="absolute"
            style={{ left: plan.samus.left, top: plan.samus.top }}
            initial={isStill ? false : { opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Sprite sheet={ZERO_SUIT} animation={samusPose(stage, plan.pose)} />
          </motion.span>
        )}
      </AnimatePresence>
      {stage === "firing" && <Beam from={plan.muzzle} beam={plan.beam} />}
      {stage === "hurt" && <Burst at={plan.larva} />}
      {hasLanded && <Result encounter={encounter} />}
    </div>
  );
};

export default Encounter;
