import { motion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { pixelSteps } from "../../../lib/motion";
import { TWIG_HALVES } from "./willow";
import { TwigHalf } from "./pieces";

/**
 * The One Wish Willow from Obsession, a twig lying where the page signs off. Once the wish is made it stays
 * snapped in two.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("willow");

  return (
    <RelicButton id="willow" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <span className="flex w-20 items-center" aria-hidden="true">
        {TWIG_HALVES.map((half) => (
          <motion.span
            key={half.side}
            className="block"
            style={{ flexGrow: half.rows[0].length }}
            initial={false}
            animate={isFound ? { x: half.side * 3, y: 2 } : { x: 0, y: 0 }}
            transition={{ duration: 0.4, ease: pixelSteps(3) }}
          >
            <TwigHalf half={half} className="block w-full" />
          </motion.span>
        ))}
      </span>
    </RelicButton>
  );
};
