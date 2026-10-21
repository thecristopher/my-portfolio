import { motion, useReducedMotion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { SPIDER_RED } from "./helpers";

// the little spider from the chest of the suit: two body segments and four legs a side, on a 16 unit grid
const SPIDER_LEGS = [
  "M6.6 6.6 L3.5 3.8 L2.6 1",
  "M9.4 6.6 L12.5 3.8 L13.4 1",
  "M6.3 8.2 L2.6 7.2 L1 9",
  "M9.7 8.2 L13.4 7.2 L15 9",
  "M6.4 9.8 L3.2 11.6 L2.2 15",
  "M9.6 9.8 L12.8 11.6 L13.8 15",
  "M6.9 11.4 L5 13.5 L4.6 15.4",
  "M9.1 11.4 L11 13.5 L11.4 15.4",
];

/**
 * A little spider hanging off the top of the degree on its silk, swinging gently. Peter Parker was a student first.
 * Once its thread is pulled, it wears the classic red for good.
 */
export const Trigger = ({ className = "" }) => {
  const { isFound, touch } = useRelic("spider");
  const isReduced = useReducedMotion();
  const fill = isFound ? SPIDER_RED : "currentColor";

  return (
    <RelicButton id="spider" isFound={isFound} onTouch={() => touch()} className={className}>
      <svg viewBox="0 0 24 64" className="h-16 w-6 overflow-visible text-muted" aria-hidden="true">
        {/* it swings from the top of its thread, so the pivot is where the silk is anchored */}
        <motion.g
          style={{ transformOrigin: "12px 0px" }}
          animate={isReduced ? undefined : { rotate: [-9, 9, -9] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M12 0 V43" stroke="currentColor" strokeWidth="0.6" opacity="0.7" />
          <g transform="translate(0.8 40) scale(1.4)" style={{ filter: isFound ? `drop-shadow(0 0 3px ${SPIDER_RED})` : undefined }}>
            {SPIDER_LEGS.map((leg) => (
              <path key={leg} d={leg} fill="none" stroke={fill} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
            ))}
            <ellipse cx="8" cy="6.4" rx="1.5" ry="1.7" fill={fill} stroke="#111111" strokeWidth={isFound ? 0.3 : 0} />
            <ellipse cx="8" cy="10.2" rx="1.9" ry="2.6" fill={fill} stroke="#111111" strokeWidth={isFound ? 0.3 : 0} />
          </g>
        </motion.g>
      </svg>
    </RelicButton>
  );
};
