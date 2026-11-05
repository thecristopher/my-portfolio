import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Sprite from "../../components/Sprite";
import { JILL } from "../../lib/sprites/jill";

const WALK_IN = { distance: 140, seconds: 1.6 };

/**
 * Jill beside the email, facing the buttons. She walks in the first time she shows up, then plays whatever pose she's
 * told to. She's a button too: pressing her sends her after the nearest bug.
 * @param {{ state: { pose: string, take: number }, scale?: number, onArrive: () => void, onEnded: () => void, onFight: () => void }} props
 *   onArrive fires once she's done walking in, onEnded each time a one shot move finishes
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
        aria-label="Send Jill after the bugs"
        initial={prefersReducedMotion ? false : { x: WALK_IN.distance, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : undefined}
        transition={{ x: { duration: WALK_IN.seconds, ease: "linear" }, opacity: { duration: 0.3 } }}
        onAnimationComplete={onArrive}
        className="block cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* the take restarts a move that's asked for again while it's still playing */}
        <Sprite key={`${state.pose}-${state.take}`} sheet={JILL} animation={state.pose} scale={scale} isFlipped onEnd={onEnded} />
      </motion.button>
    </div>
  );
};

export default Jill;
