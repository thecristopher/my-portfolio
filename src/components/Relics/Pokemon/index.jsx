import { motion, useReducedMotion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { BallPixels, PixelPaths } from "./pieces";
import { spritePaths } from "./helpers";
import { GRASS_PALETTE, GRASS_TILE } from "./sprites";

const GRASS_PATHS = spritePaths(GRASS_TILE, GRASS_PALETTE);
const BACK_ROW = [8, 24];
const FRONT_ROW = [0, 16, 32];

// a quick shiver every few seconds, like something just moved in there
const rustle = (delay) => ({
  animate: { skewX: [0, -9, 7, -4, 0] },
  transition: { duration: 0.6, delay, repeat: Infinity, repeatDelay: 2.8, ease: "easeInOut" },
});

const GrassRow = ({ tiles, top, delay, isStill }) => (
  <motion.g style={{ transformBox: "fill-box", originY: 1 }} {...(isStill ? {} : rustle(delay))}>
    {tiles.map((left) => (
      <g key={left} transform={`translate(${left} ${top})`}>
        <PixelPaths paths={GRASS_PATHS} />
      </g>
    ))}
  </motion.g>
);

/**
 * A patch of GBA tall grass in the hero that rustles now and then, the place every wild encounter starts.
 * Once the catch is made, a Poké Ball stays half hidden in it.
 */
export const Trigger = ({ className = "" }) => {
  const { isFound, touch } = useRelic("pokeball");
  const isStill = useReducedMotion();

  return (
    <RelicButton id="pokeball" isFound={isFound} onTouch={() => touch()} className={className}>
      <svg viewBox="0 0 48 14" shapeRendering="crispEdges" className="w-24 overflow-visible sm:w-28" aria-hidden="true">
        <GrassRow tiles={BACK_ROW} top={0} delay={0} isStill={isStill} />
        {isFound && (
          <g transform="translate(20 2)">
            <BallPixels />
          </g>
        )}
        <GrassRow tiles={FRONT_ROW} top={6} delay={0.12} isStill={isStill} />
      </svg>
    </RelicButton>
  );
};
