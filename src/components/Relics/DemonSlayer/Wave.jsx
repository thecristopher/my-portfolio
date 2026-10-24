import { motion } from "framer-motion";
import { pixelSteps } from "../../../lib/motion";
import PixelArt from "../../PixelArt";
import { PRUSSIAN_BLUE, WATER_BLUE } from "./helpers";
import { DROP_ROWS, WAVE_PALETTE, WAVE_ROWS_NARROW, WAVE_ROWS_WIDE } from "./sprites";

// phones get five crests and wider screens eight, so the wave keeps its shape instead of stretching
const SHEETS = [
  { rows: WAVE_ROWS_NARROW, className: "block h-auto w-[max(100vw,44rem)] sm:hidden" },
  { rows: WAVE_ROWS_WIDE, className: "hidden h-auto w-[max(100vw,60rem)] sm:block" },
];

// spray flung up by the blade, spread along the cut. fixed so every replay throws the same water
const SPRAY_DROPS = Array.from({ length: 14 }, (_, index) => ({
  left: 4 + index * 7,
  rise: 8 + (index % 4) * 5,
  size: index % 3 === 0 ? 16 : 12,
  lag: index * 0.025,
}));

/**
 * Water Surface Slash: a Hokusai wave cuts across the screen left to right, foam claws and all, with spray flying off the blade.
 * @param {{ startAt: number, cutAt: number, isReduced: boolean }} props when the blade lands, the height it crosses (percent of the screen) and whether to keep motion small
 */
const WaterSurfaceSlash = ({ startAt, cutAt, isReduced }) => {
  // the reveal is the blade itself: the wave exists only where the edge has already passed
  const reveal = isReduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : { initial: { clipPath: "inset(0 100% 0 0)", x: "-4%" }, animate: { clipPath: "inset(0 0% 0 0)", x: "0%" } };

  return (
    <>
      {/* the flash of the cut */}
      <motion.span
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.75, 0] }}
        transition={{ duration: 0.4, delay: startAt, times: [0, 0.2, 1], ease: pixelSteps(2) }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${cutAt}%`, filter: `drop-shadow(0 8px 0 ${PRUSSIAN_BLUE}66)` }}
        {...reveal}
        transition={{ duration: 0.45, delay: startAt, ease: pixelSteps(8) }}
      >
        {SHEETS.map(({ rows, className }) => (
          <PixelArt key={className} rows={rows} palette={WAVE_PALETTE} className={className} />
        ))}
      </motion.div>
      {/* the edge of the blade, a bar of light with flat blue bands instead of a blurred glow, running just ahead of the water */}
      <motion.span
        className="absolute left-0 h-1 w-full origin-left bg-white"
        style={{ top: `${cutAt}%`, boxShadow: `0 -4px 0 ${WATER_BLUE}, 0 4px 0 ${WATER_BLUE}` }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{ duration: 0.5, delay: startAt - 0.08, ease: pixelSteps(8) }}
      />
      {!isReduced &&
        SPRAY_DROPS.map(({ left, rise, size, lag }) => (
          <motion.span
            key={left}
            className="absolute block"
            style={{ left: `${left}%`, top: `${cutAt}%`, width: size, height: size }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: ["0vh", `-${rise}vh`, `${rise * 1.6}vh`], opacity: [0, 1, 0] }}
            transition={{ duration: 1.3, delay: startAt + lag, ease: pixelSteps(5) }}
          >
            <PixelArt rows={DROP_ROWS} palette={WAVE_PALETTE} className="block size-full" />
          </motion.span>
        ))}
    </>
  );
};

export default WaterSurfaceSlash;
