import { motion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { easeOutExpo } from "../../../lib/motion";
import { TRIFORCE_PIECES, ZELDA_GOLD } from "./pieces";

const WOOD = "#7a4a22";
const WOOD_DARK = "#4f2e14";
const TRIM = "#d9b04a";

/**
 * The treasure chest at the end of the side quests, the kind every dungeon hides behind its last door.
 * Opened, the lid stays up and the Triforce glows inside.
 */
export const Trigger = ({ className = "" }) => {
  const { isFound, touch } = useRelic("triforce");

  return (
    <RelicButton id="triforce" isFound={isFound} onTouch={() => touch()} className={className}>
      <svg viewBox="0 0 64 56" className="w-20 overflow-visible sm:w-24" aria-hidden="true">
        {isFound && (
          <g style={{ filter: `drop-shadow(0 0 6px ${ZELDA_GOLD})` }} transform="translate(24 8) scale(1)">
            {TRIFORCE_PIECES.map((path) => (
              <path key={path} d={path} fill={ZELDA_GOLD} />
            ))}
          </g>
        )}
        {/* the body */}
        <rect x="6" y="26" width="52" height="26" rx="3" fill={WOOD} />
        <rect x="6" y="26" width="52" height="26" rx="3" fill="none" stroke={TRIM} strokeWidth="2.5" />
        <rect x="18" y="26" width="3" height="26" fill={TRIM} />
        <rect x="43" y="26" width="3" height="26" fill={TRIM} />
        <rect x="27" y="30" width="10" height="11" rx="1.5" fill={TRIM} />
        <circle cx="32" cy="35" r="1.6" fill={WOOD_DARK} />
        {/* the lid, hinged at the back. it swings up and stays up once opened */}
        <motion.g
          initial={false}
          animate={isFound ? { y: -14, scaleY: 0.55 } : { y: 0, scaleY: 1 }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
          style={{ transformOrigin: "32px 26px" }}
        >
          <path d="M6 26 V18 Q6 8 32 8 Q58 8 58 18 V26 Z" fill={WOOD} stroke={TRIM} strokeWidth="2.5" />
          <rect x="18" y="9" width="3" height="17" fill={TRIM} />
          <rect x="43" y="9" width="3" height="17" fill={TRIM} />
        </motion.g>
        <ellipse cx="32" cy="54" rx="28" ry="2.5" fill="black" opacity="0.35" />
      </svg>
    </RelicButton>
  );
};
