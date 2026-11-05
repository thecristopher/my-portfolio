import { motion } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { starField } from "./actions";

const STARS = starField(26);
const SPARKLE = "M5 0C5.4 3 7 4.6 10 5C7 5.4 5.4 7 5 10C4.6 7 3 5.4 0 5C3 4.6 4.6 3 5 0Z";

// on the light page the stars are drawn in the dusk violet so they still show against a pale sky
const STAR_COLOR = "text-sunset-3 dark:text-[#fff4d6]";

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
