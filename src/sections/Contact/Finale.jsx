import { motion } from "framer-motion";
import AnchoredSprite from "../../components/Sprite/Anchored";
import { TYRANT } from "../../lib/sprites/creatures";
import { BLAST, MISSILE } from "../../lib/sprites/jill";

// how fast the rocket flies, in px a second
const ROCKET_SPEED = 1400;
// how big the explosion is drawn next to everything else, so it swallows him whole
const BLAST_GROWTH = 1.6;

// a point in the lane, drawn from its ground up
const Spot = ({ at, children, ...motionProps }) => (
  <motion.span className="pointer-events-none absolute size-0" style={{ left: at.x, bottom: at.up }} {...motionProps}>
    {children}
  </motion.span>
);

// once the rocket lands he flashes white and sinks back into his hole
const SINK = { filter: ["brightness(1)", "brightness(4)", "brightness(4)"], y: [0, 0, 60], opacity: [1, 1, 0], transition: { duration: 1.1, times: [0, 0.3, 1] } };

/**
 * The Tyrant: the ground breaking open, him climbing out facing Jill, roaring while she takes aim, and sinking away in
 * the blast once the rocket lands.
 * @param {{ x: number, stage: "emerge" | "roar" | "hit", scale: number, onRisen: () => void }} props
 *   x is where he stands in the lane, onRisen fires once he's all the way out
 */
export const Tyrant = ({ x, stage, scale, onRisen }) => (
  <Spot at={{ x, up: 0 }} animate={stage === "hit" ? SINK : { opacity: 1 }}>
    {/* he climbs out facing right on his sheet, and his roar is drawn facing left, so it gets turned to her */}
    <AnchoredSprite
      key={stage === "emerge" ? "emerge" : "roar"}
      sheet={TYRANT}
      animation={stage === "emerge" ? "emerge" : "roar"}
      scale={scale}
      facing={stage === "emerge" ? "right" : "left"}
      onEnd={onRisen}
    />
  </Spot>
);

/**
 * The rocket: a flash at the muzzle, then the rocket itself streaking across to his chest.
 * @param {{ from: { x: number, up: number }, to: { x: number, up: number }, scale: number, onHit: () => void }} props
 */
export const Rocket = ({ from, to, scale, onHit }) => {
  const dx = to.x - from.x;
  const dy = from.up - to.up;
  return (
    <>
      <Spot at={from} initial={{ opacity: 1, scale: 0.6 }} animate={{ opacity: 0, scale: 1.4 }} transition={{ duration: 0.25 }}>
        <AnchoredSprite sheet={MISSILE} animation="flash" scale={scale} facing="left" />
      </Spot>
      <Spot at={from} initial={{ x: 0, y: 0 }} animate={{ x: dx, y: dy }} transition={{ duration: Math.hypot(dx, dy) / ROCKET_SPEED, ease: "easeIn" }} onAnimationComplete={onHit}>
        <AnchoredSprite sheet={MISSILE} animation="fly" scale={scale} facing="left" />
      </Spot>
    </>
  );
};

/**
 * The explosion where the rocket lands, shaking the stage.
 * @param {{ at: { x: number, up: number }, scale: number, onDone: () => void }} props
 */
export const Blast = ({ at, scale, onDone }) => (
  <Spot at={at}>
    <AnchoredSprite sheet={BLAST} animation="explode" scale={scale * BLAST_GROWTH} onEnd={onDone} />
  </Spot>
);
