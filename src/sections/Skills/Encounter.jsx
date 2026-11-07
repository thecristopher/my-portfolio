import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Sprite from "../../components/Sprite";
import AnchoredSprite from "../../components/Sprite/Anchored";
import { METROID } from "../../lib/sprites/metroid";
import { SAMUS, SAMUS_SHOT } from "../../lib/sprites/samus";
import { aimPoseFor, encounterCues, encounterLine, encounterStage, energyLeft, fromAnchor, hasLanded, travel } from "./actions";

const PIXEL = { fontFamily: '"Pixelify Sans", ui-monospace, monospace' };
// the larva drawn big enough to read clearly on the card
const LARVA_SCALE = 2;
const LARVA_SIZE = { width: METROID.cell.width * LARVA_SCALE, height: METROID.cell.height * LARVA_SCALE };
// Samus under the card, at a whole multiple so her pixels stay sharp, and her shot twice as big again so it reads
// clearly as it flies
const SAMUS_SCALE = 2;
const SHOT_SCALE = 4;
// where she aims from and how far her spin's middle sits over her feet, in sprite px
const CHEST = 26;
const SPIN_LIFT = 20;

// the fight's stage, moving through every part on its own timer from the moment the card opens
const useStage = (isFinisher) => {
  const [stage, setStage] = useState("arriving");

  useEffect(() => {
    const timers = encounterCues(isFinisher).map((at) => setTimeout(() => setStage(encounterStage(at, isFinisher)), at));
    return () => timers.forEach(clearTimeout);
  }, [isFinisher]);

  return stage;
};

// where everything stands on the card, measured from its layout so the card's own grow in doesn't skew it: the larva
// on top of the planet, Samus's feet under the card's corner, her shot's path from the arm cannon and her leap's path
// to the larva. it's measured a frame after mounting, since the card hands over its ref only after its children mount
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
  const feet = { x: SAMUS.anchor.x * SAMUS_SCALE, y: card.offsetHeight + SAMUS.anchor.y * SAMUS_SCALE };
  const pose = aimPoseFor({ x: feet.x, y: feet.y - CHEST * SAMUS_SCALE }, larva);
  const tip = fromAnchor(SAMUS.muzzles[pose], SAMUS.anchor, "right");
  const muzzle = { x: feet.x + tip.x * SAMUS_SCALE, y: feet.y - (SAMUS.anchor.y - tip.y) * SAMUS_SCALE };
  // the leap puts the middle of her spin right on the larva
  const leap = { x: larva.x - feet.x, y: larva.y + SPIN_LIFT * SAMUS_SCALE - feet.y };
  return { larva, feet, pose, muzzle, path: travel(muzzle, larva), leap };
};

// the larva stays hurt from the moment the hit lands until it flees or burns away
const isHurtIn = (stage) => stage === "hurt" || stage === "striking" || stage === "falling";

const HURT = { x: [0, -7, 7, -5, 5, -2, 0], filter: ["brightness(1)", "brightness(2.6) saturate(2)", "brightness(1)"] };

const larvaMotion = (stage, isDefeated, isStill) => {
  if (isHurtIn(stage) && !isStill) return HURT;
  if (stage !== "leaving" && stage !== "done") return { x: 0, filter: "brightness(1)" };
  if (isDefeated) return { scale: [1, 1.7, 0], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(5)", "brightness(5)"] };
  return isStill ? { opacity: 0 } : { x: 160, y: -140, scale: 0.4, opacity: 0 };
};

// the larva on top of the planet: pulsing, then hurt with its hull flickering away, then gone
const Larva = ({ at, stage, isDefeated, isStill }) => {
  const isHurt = isHurtIn(stage);
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

// her shot, leaving the arm cannon with a flash along its own angle and slamming into the larva
const Shot = ({ from, path }) => {
  const width = SAMUS_SHOT.width * SHOT_SCALE;
  const height = SAMUS_SHOT.height * SHOT_SCALE;
  return (
    <>
      <motion.span
        className="absolute size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffffff_0%,#fff6a8_40%,transparent_70%)]"
        style={{ left: from.x, top: from.y }}
        initial={{ scale: 0.4, opacity: 1 }}
        animate={{ scale: 1.8, opacity: 0 }}
        transition={{ duration: 0.2 }}
      />
      <motion.img
        src={SAMUS_SHOT.src}
        alt=""
        width={width}
        height={height}
        className="absolute max-w-none drop-shadow-[0_0_10px_#7dff9a] [image-rendering:pixelated]"
        style={{ left: from.x - width / 2, top: from.y - height / 2, rotate: path.angle }}
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{ x: path.dx, y: path.dy, opacity: [1, 1, 0] }}
        transition={{ duration: 0.28, ease: "linear", opacity: { duration: 0.3, times: [0, 0.85, 1] } }}
      />
    </>
  );
};

// the flash where the shot lands, bigger and hotter for the screw attack
const Burst = ({ at, isBig }) => (
  <motion.span
    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffffff_0%,#9cf3ff_35%,transparent_70%)] ${isBig ? "size-28" : "size-16"}`}
    style={{ left: at.x, top: at.y }}
    initial={{ scale: 0.2, opacity: 1 }}
    animate={{ scale: isBig ? 2.6 : 2.2, opacity: 0 }}
    transition={{ duration: isBig ? 0.6 : 0.45, ease: "easeOut" }}
  />
);

// her pose through a hit: aiming, holding the aim while the larva shakes, then lowering it
const shotPose = (stage, aim) => (stage === "aiming" || stage === "firing" || stage === "hurt" ? aim : "aim");

// her pose through the last hit: the space jump up, the screw attack through the larva, a somersault down, then facing you
const SCREW_POSES = { leaping: "spaceJump", striking: "screwAttack", falling: "somersault", leaving: "forward", done: "forward" };

// her body's trip on the last hit: up to the larva, spinning there, back down to her spot
const leapMotion = (stage, leap) => {
  if (stage === "leaping") return { x: leap.x, y: leap.y, transition: { duration: 0.45, ease: [0.2, 0.9, 0.3, 1] } };
  if (stage === "striking") return { x: [leap.x, leap.x + 6, leap.x - 6, leap.x], y: leap.y, transition: { duration: 0.35, repeat: 1 } };
  return { x: 0, y: 0, transition: { duration: 0.5, ease: [0.5, 0, 0.9, 0.6] } };
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

// Samus under the card, running in from the side and then shooting or leaping
const Hunter = ({ plan, stage, isFinisher, isStill }) => {
  const pose = isFinisher ? (SCREW_POSES[stage] ?? "aim") : shotPose(stage, plan.pose);
  return (
    <motion.span
      className="absolute"
      style={{ left: plan.feet.x, top: plan.feet.y }}
      initial={isStill ? false : { opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.span className="absolute" animate={isFinisher && !isStill ? leapMotion(stage, plan.leap) : { x: 0, y: 0 }}>
        <AnchoredSprite sheet={SAMUS} animation={pose} scale={SAMUS_SCALE} />
      </motion.span>
    </motion.span>
  );
};

/**
 * The fight that plays in an opened card when the Metroid larva was hiding behind that tool: it clings to the top of
 * the planet and Samus steps up under the card. A hit is a beam from her arm cannon that leaves the larva shaking with
 * its hull flickering away before it flees. The last hit is her screw attack: she space jumps up through the larva,
 * spins down and faces you while it burns away. The result shows over the card.
 * @param {{ encounter: { hits: number, isDefeated: boolean }, cardRef: { current: HTMLElement | null }, sphereRef: { current: HTMLElement | null } }} props
 *   encounter is the hunt right after this hit, cardRef the card and sphereRef its planet, to stage the fight around them
 */
const Encounter = ({ encounter, cardRef, sphereRef }) => {
  const isStill = useReducedMotion();
  const isFinisher = encounter.isDefeated;
  const stage = useStage(isFinisher);
  const plan = useStagePlan(cardRef, sphereRef);
  if (!plan) return null;
  const isLanded = hasLanded(stage);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden={!isLanded}>
      <Larva at={plan.larva} stage={stage} isDefeated={encounter.isDefeated} isStill={isStill} />
      <AnimatePresence>{stage !== "arriving" && <Hunter plan={plan} stage={stage} isFinisher={isFinisher} isStill={isStill} />}</AnimatePresence>
      {stage === "firing" && <Shot from={plan.muzzle} path={plan.path} />}
      {(stage === "hurt" || stage === "striking") && <Burst at={plan.larva} isBig={stage === "striking"} />}
      {isLanded && <Result encounter={encounter} />}
    </div>
  );
};

export default Encounter;
