import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { HAORI_BLACK, HAORI_GREEN, SUMI_INK, SUN_RED } from "./helpers";

const CARD = "#f4efe2";
const RING = "#c9c3b4";
const DIM_SUN = "#8f3a33";

// the rays fanning out of the sun on the card, twelve short strokes all the way around
const RAYS = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2;
  const point = (radius) => `${(20 + Math.cos(angle) * radius).toFixed(1)} ${(32 + Math.sin(angle) * radius).toFixed(1)}`;
  return `M${point(7.2)} L${point(9)}`;
});

/**
 * Tanjiro's hanafuda earring, hanging off its ring over a swatch of his checkered haori and swaying.
 * Once Total Concentration is reached, the sun on the card burns and glows for good.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("hanafuda");
  const isReduced = useReducedMotion();
  // react's ids carry characters a url(#id) reference can trip on
  const checkerId = `haori${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const sun = isFound ? SUN_RED : DIM_SUN;

  return (
    <RelicButton id="hanafuda" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 40 80" className="h-20 w-10 overflow-visible" aria-hidden="true">
        <defs>
          <pattern id={checkerId} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill={HAORI_BLACK} />
            <rect width="4" height="4" fill={HAORI_GREEN} />
            <rect x="4" y="4" width="4" height="4" fill={HAORI_GREEN} />
          </pattern>
        </defs>
        {/* the strip of haori the earring hangs in front of */}
        <rect x="4" y="12" width="32" height="66" rx="3" fill={`url(#${checkerId})`} stroke={HAORI_BLACK} strokeWidth="1" />
        <circle cx="20" cy="6" r="4" fill="none" stroke={RING} strokeWidth="1.6" />
        {/* the card swings from the ring, like it does every time Tanjiro turns his head */}
        <motion.g
          style={{ transformOrigin: "20px 9px" }}
          animate={isReduced ? undefined : { rotate: [-7, 7, -7] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="19.2" y="9" width="1.6" height="5" fill={RING} />
          <rect x="11" y="14" width="18" height="56" rx="1.5" fill={CARD} stroke={SUMI_INK} strokeWidth="1" />
          <g style={{ filter: isFound ? `drop-shadow(0 0 4px ${SUN_RED})` : undefined }}>
            {RAYS.map((ray) => (
              <path key={ray} d={ray} stroke={sun} strokeWidth="1.4" strokeLinecap="round" />
            ))}
            <circle cx="20" cy="32" r="5.6" fill={sun} />
          </g>
          {/* the bands across the bottom of the card */}
          <path d="M13 52 H27 M13 56 H27 M13 60 H27" stroke={SUMI_INK} strokeWidth="1.2" />
        </motion.g>
      </svg>
    </RelicButton>
  );
};
