import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import AnchoredSprite from "../../components/Sprite/Anchored";
import { JILL, JILL_ROCKET } from "../../lib/sprites/jill";

// she dashes in from off stage, landing on her spot just before the dash finishes
const WALK_IN = { distance: 260, seconds: 0.5 };
// her victory jump leaves the ground: the frames only raise her arms, so the hop comes from here, in sprite px
const HOP = 14;

// the rocket launcher moves live on their own bigger sheet, everything else on her main one
const sheetFor = (pose) => (JILL_ROCKET.animations[pose] ? JILL_ROCKET : JILL);

const hopFor = (pose, scale, isStill) => {
  if (pose !== "happy" || isStill) return { y: 0 };
  return { y: [0, -HOP * scale, 0, -HOP * scale * 0.5, 0], transition: { duration: 1, times: [0, 0.3, 0.55, 0.75, 1] } };
};

/**
 * Jill beside the email, facing the buttons. She dashes in the first time she shows up, then plays whatever pose she's
 * told to, standing on the same spot whichever sheet the pose lives on. She's a button too: pressing her sends her
 * after the nearest enemy.
 * @param {{ state: { pose: string, take: number }, scale?: number, onArrive: () => void, onEnded: () => void, onFight: () => void }} props
 *   onArrive fires once she has landed on her spot, onEnded each time a one shot move finishes
 */
const Jill = ({ state, scale = 1, onArrive, onEnded, onFight }) => {
  const prefersReducedMotion = useReducedMotion();
  // watched on a spot that never moves, since she starts outside the screen where she'd never count as seen
  const spot = useRef(null);
  const isInView = useInView(spot, { once: true, margin: "-80px" });

  return (
    <div ref={spot}>
      <motion.button
        type="button"
        onClick={onFight}
        aria-label="Send Jill after the enemies"
        initial={prefersReducedMotion ? false : { x: WALK_IN.distance, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : undefined}
        transition={{ x: { duration: WALK_IN.seconds, ease: "easeOut" }, opacity: { duration: 0.2 } }}
        onAnimationComplete={onArrive}
        className="relative block cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent"
        style={{ width: JILL.cell.width * scale, height: JILL.cell.height * scale }}
      >
        {/* her feet: every sheet she's drawn from lands its anchor on this point */}
        <motion.span className="absolute" style={{ left: JILL.anchor.x * scale, top: JILL.anchor.y * scale }} animate={hopFor(state.pose, scale, prefersReducedMotion)}>
          {/* the take restarts a move that's asked for again while it's still playing */}
          <AnchoredSprite key={`${state.pose}-${state.take}`} sheet={sheetFor(state.pose)} animation={state.pose} scale={scale} facing="left" onEnd={onEnded} />
        </motion.span>
      </motion.button>
    </div>
  );
};

export default Jill;
