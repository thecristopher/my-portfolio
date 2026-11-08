import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Sprite from "../../components/Sprite";
import { pointOnCircle } from "../../lib/geometry";
import { METROID } from "../../lib/sprites/metroid";

const CENTER = { x: 50, y: 50 };
// how far it slips out from behind its tool when it peeks, in px, far enough to click clear of the chip, and how far
// a page held still leaves it showing
const PEEK = 30;
const STILL_PEEK = 12;
// how long it hides between peeks and how long each peek lasts: often enough to catch, long enough to click
const HIDES_FOR_MS = 1500;
const PEEKS_FOR_MS = 2200;

// out for a moment, back in for a while, over and over. Samus's shots only make it flinch, so her firing never cuts
// short the moment a visitor has to click it. a page held still never peeks, it just sits half out
const usePeek = (isStill) => {
  const [isPeeking, setIsPeeking] = useState(false);

  useEffect(() => {
    if (isStill) return undefined;
    let timer = null;
    const hide = () => {
      setIsPeeking(false);
      timer = setTimeout(peek, HIDES_FOR_MS);
    };
    const peek = () => {
      setIsPeeking(true);
      timer = setTimeout(hide, PEEKS_FOR_MS);
    };
    hide();
    return () => clearTimeout(timer);
  }, [isStill]);

  return isPeeking;
};

// floating while it's out, the way a larva drifts, and a flash of white the moment a shot hits it
const FLOAT = { y: [0, -3, 0, 2, 0], transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } };
const flinchFor = (isFlinching) => (isFlinching ? { filter: ["brightness(3)", "brightness(1)"], transition: { duration: 0.4 } } : {});

const BURN = { scale: [1, 1.6, 0], opacity: [1, 1, 0], filter: ["brightness(1)", "brightness(4)", "brightness(4)"], transition: { duration: 0.7, times: [0, 0.45, 1] } };

// how it leaves its tool, told by AnimatePresence's custom as it goes: hit, it flashes and darts off away from the
// core, defeated, it swells, burns white and is gone
const exitsFor = (flee) => ({
  gone: ({ isDefeated }) =>
    isDefeated ? BURN : { x: flee.x, y: flee.y, opacity: 0, scale: 0.4, filter: ["brightness(3)", "brightness(1)"], transition: { duration: 0.45 } },
});

/**
 * The Metroid larva hiding behind a tool on its ring, turning with it. Every couple of seconds it slips out a little,
 * away from the core, floating while it's out, and ducks back. Clicking it while it's out is a hit, the same as opening
 * its tool. A shot from below makes it flinch. Hit in a card, it flashes and darts off before showing up
 * behind another tool, and the last hit burns it away for good.
 * @param {{ angle: number, counterTurn: import("framer-motion").MotionValue<number>, spooked: number,
 *   onPeek: (larva: HTMLElement | null) => void, onHit: (larva: HTMLElement) => void }} props
 *   angle is where its tool sits on the ring, counterTurn keeps it upright while the ring turns, spooked counts the
 *   shots that reached it, onPeek gets the larva each time it slips out and null when it ducks back or leaves, onHit
 *   gets it when it's clicked
 */
const Metroid = ({ angle, counterTurn, spooked, onPeek, onHit }) => {
  const prefersReducedMotion = useReducedMotion();
  const larva = useRef(null);
  const isPeeking = usePeek(prefersReducedMotion);
  // shots from before it hid here belong to another hideout, so it only flinches at new ones
  const spookedOnArrival = useRef(spooked);
  const peeked = useRef(onPeek);
  peeked.current = onPeek;
  const spot = pointOnCircle(angle, 50, CENTER);
  // the peek runs along the ring's radius, measured before the counter turn so it always points away from the core
  const peek = pointOnCircle(angle, prefersReducedMotion ? STILL_PEEK : PEEK);
  const isOut = isPeeking || prefersReducedMotion;

  useEffect(() => {
    peeked.current(isPeeking ? larva.current : null);
  }, [isPeeking]);

  useEffect(() => () => peeked.current(null), []);

  return (
    <motion.span
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      variants={exitsFor(pointOnCircle(angle, PEEK * 5))}
      custom={{ isDefeated: false }}
      exit="gone"
    >
      {/* only catchable while it's out. keyboard users hit it by opening its tool, so it stays out of the tab order */}
      <motion.button
        ref={larva}
        type="button"
        tabIndex={-1}
        aria-label="Shoot the Metroid"
        disabled={!isOut}
        onClick={(event) => onHit(event.currentTarget)}
        className={`block ${isOut ? "pointer-events-auto cursor-crosshair" : ""}`}
        animate={isOut ? { x: peek.x, y: peek.y } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <motion.span className="block" style={{ rotate: counterTurn }} animate={isPeeking ? FLOAT : { y: 0 }}>
          <motion.span key={spooked} className="block" animate={flinchFor(spooked !== spookedOnArrival.current)}>
            <Sprite sheet={METROID} animation="pulse" />
          </motion.span>
        </motion.span>
      </motion.button>
    </motion.span>
  );
};

export default Metroid;
