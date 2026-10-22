import { motion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { easeOutExpo } from "../../../lib/motion";
import { SNAP_POINT, TWIG_HALVES } from "./willow";
import { TwigHalf } from "./pieces";

/**
 * The One Wish Willow from Obsession, a twig lying where the page signs off. Once the wish is made it stays
 * snapped in two.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("willow");

  return (
    <RelicButton id="willow" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 40 16" className="w-20 overflow-visible" aria-hidden="true">
        {TWIG_HALVES.map((half) => (
          <motion.g
            key={half.side}
            initial={false}
            animate={isFound ? { rotate: half.side * 12, x: half.side * 1.5, y: 1 } : { rotate: 0, x: 0, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            style={{ transformOrigin: `${SNAP_POINT.x}px ${SNAP_POINT.y}px` }}
          >
            <TwigHalf half={half} />
          </motion.g>
        ))}
      </svg>
    </RelicButton>
  );
};
