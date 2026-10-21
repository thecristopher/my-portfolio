import { motion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { easedGlow } from "../../../actions";
import { GRACE_GOLD, GRACE_SIGIL } from "./grace";

// the threads of light that curl up off a grace, each with its own lean and pace
const STREAMS = [
  { x: -9, lean: -6, delay: 0 },
  { x: -3, lean: 3, delay: 0.6 },
  { x: 4, lean: -2, delay: 1.1 },
  { x: 9, lean: 6, delay: 0.3 },
];

/**
 * A site of grace on the ground at the end of the page: a point of gold light with threads curling up off it.
 * Before it's touched it gutters low and pale; touched, it burns bright gold and the sigil hangs above it.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("grace");
  const strength = isFound ? 1 : 0.55;

  return (
    <RelicButton id="grace" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <span className="relative block h-24 w-20" aria-hidden="true">
        <span
          className="absolute inset-x-0 bottom-0 h-6 rounded-full"
          style={{ background: easedGlow(GRACE_GOLD, { strength: 0.5 * strength, shape: "ellipse" }) }}
        />
        {STREAMS.map(({ x, lean, delay }) => (
          <motion.span
            key={x}
            className="absolute bottom-3 left-1/2 h-14 w-[2px] origin-bottom rounded-full"
            style={{ x, background: `linear-gradient(to top, ${GRACE_GOLD}, transparent)`, opacity: strength }}
            animate={{ rotate: [lean, -lean, lean], scaleY: [0.7, 1, 0.7] }}
            transition={{ duration: 2.6, delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <span
          className="absolute bottom-2.5 left-1/2 size-3 -translate-x-1/2 rounded-full"
          style={{ background: "#fffbe8", boxShadow: `0 0 18px 6px ${GRACE_GOLD}`, opacity: 0.6 + 0.4 * strength }}
        />
        {isFound && (
          <svg viewBox="0 0 16 16" className="absolute top-0 left-1/2 size-7 -translate-x-1/2" style={{ filter: `drop-shadow(0 0 4px ${GRACE_GOLD})` }}>
            {GRACE_SIGIL.map((path) => (
              <path key={path} d={path} fill="none" stroke={GRACE_GOLD} strokeWidth="0.9" strokeLinecap="round" />
            ))}
          </svg>
        )}
      </span>
    </RelicButton>
  );
};
