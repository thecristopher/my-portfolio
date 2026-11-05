import { motion } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { lampWindows, starField } from "./actions";

const STARS = starField(26);
const SPARKLE = "M5 0C5.4 3 7 4.6 10 5C7 5.4 5.4 7 5 10C4.6 7 3 5.4 0 5C3 4.6 4.6 3 5 0Z";

// on the light page the stars are drawn in the dusk violet so they still show against a pale sky
const STAR_COLOR = "text-sunset-3 dark:text-[#fff4d6]";
const LAMP_COLOR = "text-sunset-1 dark:text-[#ffd28a]";
const PIER_COLOR = "text-[color-mix(in_oklab,var(--color-fg)_40%,var(--color-ink))]";

const Star = ({ star, progress, isStill }) => {
  const opacity = useScrollRange(progress, [star.at, star.at + 0.08], [0, 1]);
  return (
    <motion.svg
      viewBox="0 0 10 10"
      className={`absolute ${STAR_COLOR}`}
      style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size, opacity: isStill ? 1 : opacity }}
      animate={{ scale: [1, 0.6, 1] }}
      transition={{ duration: 2 + (star.size % 3), repeat: Infinity, ease: "easeInOut" }}
    >
      <path d={SPARKLE} fill="currentColor" />
    </motion.svg>
  );
};

/**
 * The stars coming out one by one as the sun goes down.
 * @param {{ progress: import("framer-motion").MotionValue<number>, isStill: boolean, height: string }} props height of the sky
 */
export const Stars = ({ progress, isStill, height }) => (
  <div className="absolute inset-x-0 top-0" style={{ height }}>
    {STARS.map((star) => (
      <Star key={`${star.x}-${star.y}`} star={star} progress={progress} isStill={isStill} />
    ))}
  </div>
);

/**
 * The moon rising out of the sea at the far edge of the sky, clear of the headline, once the sun is nearly gone. It
 * lives inside the sky's clip so it climbs out from behind the horizon.
 * @param {{ progress: import("framer-motion").MotionValue<number>, isStill: boolean }} props
 */
export const Moon = ({ progress, isStill }) => {
  const y = useScrollRange(progress, [0.5, 1], ["120%", "-260%"]);
  return (
    <motion.span
      className="absolute bottom-0 left-[90%] aspect-square -translate-x-1/2 w-[min(10vmin,4.5rem)] rounded-full ring-1 ring-black/5 dark:ring-0"
      style={{
        y: isStill ? "-260%" : y,
        background: "radial-gradient(circle at 38% 35%, #fffaf0 0%, #efe6d2 55%, #d9cdb4 100%)",
        boxShadow: "0 0 40px 6px rgb(255 244 214 / 0.35), inset -8px -6px 0 rgb(0 0 0 / 0.06)",
      }}
    />
  );
};

// the pier runs out from the shore on the left and gets smaller as it goes, the way the real one does from the beach
const POSTS = [12, 44, 76, 106, 134, 160, 184, 206, 226, 244, 260, 274];
const LAMPS = [
  { x: 28, top: 4, base: 21 },
  { x: 92, top: 7, base: 22 },
  { x: 150, top: 10, base: 23 },
  { x: 200, top: 13, base: 24 },
  { x: 240, top: 15, base: 24.5 },
  { x: 270, top: 17, base: 25 },
];
const LAMP_WINDOWS = lampWindows(LAMPS.length, [0.45, 0.85]);

const Lamp = ({ lamp, window, progress, isStill }) => {
  const light = useScrollRange(progress, window, [0, 1]);
  const opacity = isStill ? 1 : light;
  return (
    <g>
      <line x1={lamp.x} x2={lamp.x} y1={lamp.top} y2={lamp.base} stroke="currentColor" strokeWidth="0.8" className={PIER_COLOR} />
      <motion.g style={{ opacity }} className={LAMP_COLOR}>
        <circle cx={lamp.x} cy={lamp.top} r="1.8" fill="currentColor" style={{ filter: "drop-shadow(0 0 3px currentColor)" }} />
        <rect x={lamp.x - 0.6} y="30" width="1.2" height={10 - lamp.top / 3} fill="currentColor" opacity="0.45" style={{ filter: "blur(0.6px)" }} />
      </motion.g>
    </g>
  );
};

/**
 * The pier off Rosarito in silhouette on the horizon, its lamps turning on one by one as the light goes.
 * @param {{ progress: import("framer-motion").MotionValue<number>, isStill: boolean, horizon: string }} props horizon is
 *   where the sea starts, from the top of the scene
 */
export const Pier = ({ progress, isStill, horizon }) => (
  <svg viewBox="0 0 300 44" className="absolute left-0 w-[min(60vw,34rem)] -translate-y-1/2" style={{ top: horizon }}>
    <g className={PIER_COLOR} fill="currentColor">
      <polygon points="0,20 290,24.5 290,26 0,24" />
      {POSTS.map((x, index) => (
        <rect key={x} x={x} y="23" width={Math.max(0.8, 2.4 - index * 0.14)} height={Math.max(4, 16 - index)} />
      ))}
    </g>
    {LAMPS.map((lamp, index) => (
      <Lamp key={lamp.x} lamp={lamp} window={LAMP_WINDOWS[index]} progress={progress} isStill={isStill} />
    ))}
  </svg>
);
