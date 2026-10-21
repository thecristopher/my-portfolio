import { motion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { easeOutExpo } from "../../../lib/motion";
import { BAT_PATH, SIGNAL_YELLOW } from "./helpers";

const STEEL = "#2a2f3a";
const STEEL_LIGHT = "#454c5c";

// a small storm cloud made of overlapping puffs, sized for the 80 wide trigger box
const CLOUD_PUFFS = [
  { cx: 22, cy: 27, r: 10 },
  { cx: 36, cy: 19, r: 13 },
  { cx: 52, cy: 20, r: 12 },
  { cx: 63, cy: 28, r: 8 },
];

const Cloud = ({ isLit }) => (
  <g fill={isLit ? "#4a5366" : "#323846"}>
    {CLOUD_PUFFS.map((puff) => (
      <circle key={puff.cx} {...puff} />
    ))}
    <rect x="13" y="25" width="56" height="12" rx="6" />
  </g>
);

/**
 * The Bat-Signal on a rooftop, its lamp aimed at a cloud. Dark until someone lights it; lit, the beam stays on and
 * the bat hangs on the cloud for good.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("bat");

  return (
    <RelicButton id="bat" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 80 128" className="h-32 w-auto overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="bat-signal-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={SIGNAL_YELLOW} stopOpacity="0.65" />
            <stop offset="100%" stopColor={SIGNAL_YELLOW} stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <motion.path
          d="M33 92 L47 92 L68 36 L12 36 Z"
          fill="url(#bat-signal-beam)"
          initial={false}
          animate={{ opacity: isFound ? 1 : 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
        />
        <Cloud isLit={isFound} />
        {isFound && (
          <g style={{ filter: `drop-shadow(0 0 5px ${SIGNAL_YELLOW})` }}>
            <ellipse cx="41" cy="24" rx="20" ry="10" fill={SIGNAL_YELLOW} />
            <path d={BAT_PATH} fill="#0a0a0d" transform="translate(24 15.5) scale(0.34)" />
          </g>
        )}
        {/* the lamp on its stand, lens up */}
        <path d="M34 116 L38 104 M46 116 L42 104" stroke={STEEL} strokeWidth="2.5" />
        <rect x="31" y="92" width="18" height="13" rx="2" fill={STEEL} stroke={STEEL_LIGHT} strokeWidth="1" />
        <rect x="29" y="96" width="3" height="5" rx="1" fill={STEEL_LIGHT} />
        <ellipse cx="40" cy="92" rx="9" ry="2.6" fill={isFound ? "#fff6c8" : "#14161c"} stroke={STEEL_LIGHT} strokeWidth="0.8" />
        {/* the rooftop ledge it stands on */}
        <rect x="4" y="116" width="72" height="8" rx="1" fill="#1b1f27" />
        <rect x="4" y="116" width="72" height="1.5" fill={STEEL_LIGHT} />
        <ellipse cx="40" cy="126" rx="34" ry="2" fill="black" opacity="0.35" />
      </svg>
    </RelicButton>
  );
};
