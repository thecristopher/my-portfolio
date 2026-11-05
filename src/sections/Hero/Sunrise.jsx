import { motion } from "framer-motion";
import Pier, { PIER_LAMPS } from "../../components/Pier";
import { useStep } from "../../hooks/useStep";
import { useScrollRange } from "../../hooks/useScrollRange";
import { isLampLit } from "./actions";

const HORIZON = "70%";
const SUN_SIZE = "min(46vmin, 26rem)";

// the last stars of the night, scattered by hand so they never land on the same spots twice in a row
const STARS = [
  [6, 12, 2], [14, 30, 1.5], [22, 8, 1], [31, 22, 2], [38, 40, 1], [47, 10, 1.5], [55, 32, 1], [62, 6, 2],
  [69, 26, 1], [76, 14, 1.5], [84, 36, 1], [91, 9, 2], [96, 28, 1], [10, 48, 1], [44, 52, 1], [88, 54, 1.5],
];

/**
 * Dawn over the sea off Rosarito, the mirror of the sunset that closes the page: as the opening scrolls, the last stars
 * fade, the sun climbs out of the water behind the photo and the pier's lamps go out one by one, farthest first.
 * @param {{ progress: import("framer-motion").MotionValue<number> }} props how far the sunrise has gone, from 0 to 1
 */
const Sunrise = ({ progress }) => {
  const step = useStep(progress);
  const lit = Array.from({ length: PIER_LAMPS }, (_, index) => isLampLit(index, PIER_LAMPS, step));
  const sunY = useScrollRange(progress, [0, 1], ["105%", "-40%"]);
  const sky = useScrollRange(progress, [0, 1], [0.12, 0.5]);
  const halo = useScrollRange(progress, [0.1, 0.8], [0, 0.7]);
  const stars = useScrollRange(progress, [0, 0.35], [1, 0]);
  const reflection = useScrollRange(progress, [0.15, 0.9], [0, 0.75]);
  const reflectionReach = useScrollRange(progress, [0.15, 1], [0.2, 1]);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.div className="bg-sunset absolute inset-x-0 top-0 blur-3xl" style={{ height: HORIZON, opacity: sky, maskImage: "linear-gradient(to bottom, transparent 20%, black)" }} />
      <motion.div className="absolute inset-x-0 top-0 hidden dark:block" style={{ height: HORIZON, opacity: stars }}>
        {STARS.map(([left, top, size]) => (
          <span key={`${left}-${top}`} className="absolute rounded-full bg-white" style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }} />
        ))}
      </motion.div>
      <motion.span
        className="absolute left-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ top: HORIZON, width: `calc(${SUN_SIZE} * 2.4)`, height: `calc(${SUN_SIZE} * 1.6)`, opacity: halo, background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-sunset-1) 55%, transparent), transparent)" }}
      />
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
        <motion.span
          className="absolute bottom-0 left-[28%] aspect-square -translate-x-1/2 rounded-full"
          style={{
            width: SUN_SIZE,
            y: sunY,
            background: "radial-gradient(circle at 50% 40%, #fff4d1 0%, var(--color-sunset-1) 45%, var(--color-sunset-2) 100%)",
            boxShadow: "0 0 120px 30px color-mix(in oklab, var(--color-sunset-1) 45%, transparent)",
          }}
        />
      </div>
      <div className="sea absolute inset-x-0 bottom-0" style={{ top: HORIZON }}>
        <motion.span
          className="absolute top-0 left-[28%] h-[80%] -translate-x-1/2 origin-top blur-[2px]"
          style={{
            width: `calc(${SUN_SIZE} * 0.9)`,
            opacity: reflection,
            scaleY: reflectionReach,
            background: "linear-gradient(to bottom, var(--color-sunset-1), transparent)",
            maskImage: "repeating-linear-gradient(to bottom, black 0 5px, transparent 5px 13px)",
          }}
        />
      </div>
      <span className="absolute inset-x-0 h-px bg-[color-mix(in_oklab,var(--color-sunset-1)_60%,transparent)]" style={{ top: HORIZON }} />
      <Pier lit={lit} horizon={HORIZON} className="[--pier:min(86vw,32rem)] sm:[--pier:min(52vw,44rem)]" />
    </div>
  );
};

export default Sunrise;
