import { AnimatePresence, motion, useTransform } from "framer-motion";
import Sprite from "../../../components/Sprite";
import { LINK } from "../../../lib/sprites/link";
import PixelArt from "./PixelArt";
import { PRIZE_STAR, TWINKLE } from "./art";

const RING = [0, 60, 120, 180, 240, 300];

// the finale: twinkles circling the prize, each blinking on its own beat
const Sparkles = () => (
  <motion.span
    className="absolute top-1/2 left-1/2 size-0"
    animate={{ rotate: 360 }}
    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
  >
    {RING.map((angle, index) => (
      <span key={angle} className="absolute -top-[5px] -left-[5px]" style={{ transform: `rotate(${angle}deg) translateY(-34px)` }}>
        <motion.span
          className="block"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: 1.1, delay: index * 0.18, repeat: Infinity }}
        >
          <PixelArt art={TWINKLE} pixel={2} />
        </motion.span>
      </span>
    ))}
  </motion.span>
);

// what Link holds over his head: a star that pops up out of the chest, bigger for the title I hold now
const Prize = ({ isFinal }) => (
  <motion.span
    initial={{ opacity: 0, y: 16, scale: 0.3 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.3 }}
    transition={{ type: "spring", stiffness: 420, damping: 14 }}
    className="absolute bottom-[calc(100%-0.25rem)] left-1/2 -translate-x-1/2"
  >
    <span className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,#fff3a8aa,transparent_70%)]" aria-hidden="true" />
    <PixelArt art={PRIZE_STAR} pixel={isFinal ? 4 : 3} className="relative" />
    {isFinal && <Sparkles />}
  </motion.span>
);

const poseFor = ({ isEntering, isWalking, isHolding }) => {
  if (isEntering) return "walkUp";
  if (isWalking) return "walk";
  return isHolding ? "itemGet" : "stand";
};

/**
 * Link on the road: walking with the scroll, standing still when it rests, holding the title up at a chest, and
 * walking off up the screen into a chapter when one is opened. His left edge travels from the first stop to the last
 * as the row slides, so he always lands beside the chest he's reaching.
 * @param {{ progress: import("framer-motion").MotionValue<number>, world: object, scale: number, isEntering: boolean, isFinal: boolean }} props
 */
const Walker = ({ progress, world, scale, isEntering, isFinal }) => {
  const left = useTransform(progress, (at) => `calc(var(--gutter) + 1.25rem + ${at} * (100vw - 2 * var(--gutter) - var(--step)))`);
  const isHolding = world.isAt && !world.isWalking && !isEntering;
  const pose = poseFor({ isEntering, isWalking: world.isWalking, isHolding });

  return (
    <motion.span style={{ left }} className="pointer-events-none absolute bottom-[var(--feet)] z-10">
      <motion.span
        className="relative block"
        animate={isEntering ? { y: -70, opacity: 0, scale: 0.8 } : { y: 0, opacity: 1, scale: 1 }}
        transition={isEntering ? { duration: 0.6, ease: "easeIn" } : { duration: 0.3 }}
      >
        <AnimatePresence>{isHolding && <Prize key={world.index} isFinal={isFinal} />}</AnimatePresence>
        <Sprite sheet={LINK} animation={pose} scale={scale} isFlipped={pose === "walk" && world.facing === "left"} />
        <span className="absolute inset-x-1 -bottom-1 h-1.5 rounded-full bg-black/25 blur-[2px]" aria-hidden="true" />
      </motion.span>
    </motion.span>
  );
};

export default Walker;
