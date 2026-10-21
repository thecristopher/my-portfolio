import { motion } from "framer-motion";
import { PRUSSIAN_BLUE, SUMI_INK, WATER_BLUE, foamClaws, waveBodyPath, waveCrests } from "./helpers";

const FOAM = "#f7f3e8";
const SPRAY = "#bfe6ff";

const BASELINE = 44;
const CREST_WIDTH = 60;

// the big front wave and a smaller paler one rolling inside it, with a crest every 60 units along a sheet 90 tall
const buildSheet = (count) => {
  const width = count * CREST_WIDTH;
  const front = waveCrests({ count, crestWidth: CREST_WIDTH, height: 32 });
  const inner = waveCrests({ start: -18, count: Math.ceil(width / 54) + 1, crestWidth: 54, height: 17 });
  return {
    width,
    front: waveBodyPath(front, { baseline: BASELINE, thickness: 30 }),
    inner: waveBodyPath(inner, { baseline: 56, thickness: 18 }),
    claws: front.flatMap((crest) => foamClaws(crest, BASELINE, 4)),
    // the pale currents running through the water, the lines a woodblock carver leaves in the blue
    currents: [
      `M0 63 C${width * 0.2} 58 ${width * 0.4} 67 ${width * 0.6} 61 S${width * 0.85} 57 ${width} 62`,
      `M8 70 C${width * 0.23} 65 ${width * 0.46} 73 ${width * 0.7} 67 S${width * 0.93} 64 ${width} 68`,
      `M20 76 C${width * 0.3} 72 ${width * 0.53} 79 ${width} 74`,
    ],
  };
};

// phones get five crests and wider screens eight, so the wave keeps its shape instead of stretching
const SHEETS = [
  { ...buildSheet(5), className: "block w-[max(100vw,44rem)] sm:hidden" },
  { ...buildSheet(8), className: "hidden w-[max(100vw,60rem)] sm:block" },
];

// spray flung up by the blade, spread along the cut. fixed so every replay throws the same water
const SPRAY_DROPS = Array.from({ length: 14 }, (_, index) => ({
  left: 4 + index * 7,
  rise: 8 + (index % 4) * 5,
  size: index % 3 === 0 ? 10 : 6,
  lag: index * 0.025,
}));

// one woodblock print of the wave: blue bodies outlined in ink, pale currents, and foam claws inked then whitened
const WaveSheet = ({ sheet }) => (
  <svg viewBox={`0 0 ${sheet.width} 90`} className={sheet.className}>
    <path d={sheet.front} fill={PRUSSIAN_BLUE} stroke={SUMI_INK} strokeWidth="1.2" strokeLinejoin="round" />
    <path d={sheet.inner} fill={WATER_BLUE} stroke={SUMI_INK} strokeWidth="0.8" strokeLinejoin="round" />
    {sheet.currents.map((current) => (
      <path key={current} d={current} fill="none" stroke={SPRAY} strokeWidth="1.1" strokeLinecap="round" opacity="0.8" />
    ))}
    {sheet.claws.map((claw) => (
      <path key={`ink ${claw}`} d={claw} fill="none" stroke={SUMI_INK} strokeWidth="3.4" strokeLinecap="round" />
    ))}
    {sheet.claws.map((claw) => (
      <path key={claw} d={claw} fill="none" stroke={FOAM} strokeWidth="2" strokeLinecap="round" />
    ))}
  </svg>
);

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
        transition={{ duration: 0.4, delay: startAt, times: [0, 0.2, 1] }}
      />
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: `${cutAt}%`, filter: `drop-shadow(0 10px 24px ${PRUSSIAN_BLUE}66)` }}
        {...reveal}
        transition={{ duration: 0.45, delay: startAt, ease: "easeOut" }}
      >
        {SHEETS.map((sheet) => (
          <WaveSheet key={sheet.width} sheet={sheet} />
        ))}
      </motion.div>
      {/* the edge of the blade, a hairline of light running just ahead of the water */}
      <motion.span
        className="absolute left-0 h-[3px] w-full origin-left rounded-full bg-white"
        style={{ top: `${cutAt}%`, boxShadow: `0 0 14px 4px ${WATER_BLUE}` }}
        initial={{ scaleX: 0, opacity: 1 }}
        animate={{ scaleX: 1, opacity: [1, 1, 0] }}
        transition={{ duration: 0.5, delay: startAt - 0.08, ease: "easeOut" }}
      />
      {!isReduced &&
        SPRAY_DROPS.map(({ left, rise, size, lag }) => (
          <motion.span
            key={left}
            className="absolute rounded-full"
            style={{ left: `${left}%`, top: `${cutAt}%`, width: size, height: size, background: SPRAY, boxShadow: `0 0 8px ${WATER_BLUE}` }}
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: ["0vh", `-${rise}vh`, `${rise * 1.6}vh`], opacity: [0, 1, 0] }}
            transition={{ duration: 1.3, delay: startAt + lag, ease: "easeOut" }}
          />
        ))}
    </>
  );
};

export default WaterSurfaceSlash;
