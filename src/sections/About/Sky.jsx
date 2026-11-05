import { motion, useReducedMotion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";
import { SKY_COLORS, arcPoint, dayPart, skyPosition } from "./actions";

const SKY = { width: 200, height: 92 };
const SEA = 26;
const ARC = `M0 ${SKY.height}A${SKY.width / 2} ${SKY.height} 0 0 1 ${SKY.width} ${SKY.height}`;
const WAVELENGTH = 20;

// a wave line wider than the tile, so sliding it one wavelength sideways loops without a seam
const wavePath = (y, amplitude) => {
  let path = `M-40 ${y}`;
  for (let x = -40; x < SKY.width + 40; x += WAVELENGTH) path += `q${WAVELENGTH / 4} ${-amplitude} ${WAVELENGTH / 2} 0t${WAVELENGTH / 2} 0`;
  return path;
};

const WAVES = [
  { y: SKY.height + 6, amplitude: 1.6, seconds: 5, opacity: 0.9 },
  { y: SKY.height + 13, amplitude: 1.3, seconds: 7, opacity: 0.6 },
  { y: SKY.height + 20, amplitude: 1, seconds: 9, opacity: 0.35 },
];

const Waves = ({ isStill }) =>
  WAVES.map((wave) => (
    <motion.path
      key={wave.y}
      d={wavePath(wave.y, wave.amplitude)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      opacity={wave.opacity}
      className="text-line-strong"
      animate={isStill ? undefined : { x: [0, -WAVELENGTH] }}
      transition={{ duration: wave.seconds, repeat: Infinity, ease: "linear" }}
    />
  ));

// the Rosarito pier walking out to sea on its stilts
const PIER = { from: 128, to: SKY.width + 10, deck: SKY.height + 3, posts: 9 };
const Pier = () => (
  <g className="text-muted" fill="currentColor">
    <rect x={PIER.from} y={PIER.deck} width={PIER.to - PIER.from} height="2.2" rx="0.6" />
    {Array.from({ length: PIER.posts }, (_, index) => (
      <rect key={index} x={PIER.from + 4 + index * 9} y={PIER.deck} width="1.4" height={SEA - 4} opacity="0.8" />
    ))}
    <rect x={PIER.from + 2} y={PIER.deck - 7} width="1" height="7" />
    <circle cx={PIER.from + 2.5} cy={PIER.deck - 7.5} r="1.4" />
  </g>
);

// a gull crossing the sky every so often, flapping as it goes
const Gull = () => (
  <motion.g
    initial={{ x: -20, y: 30 }}
    animate={{ x: [-20, SKY.width + 20], y: [30, 22, 28] }}
    transition={{ duration: 11, repeat: Infinity, repeatDelay: 9, ease: "linear", delay: 2 }}
  >
    <motion.path
      d="M-5 0Q-2.5 -3 0 0Q2.5 -3 5 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      className="text-muted"
      animate={{ scaleY: [1, -0.5, 1] }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
    />
  </motion.g>
);

// the sun's light laid across the water right under it
const Glint = ({ x, isDay }) => (
  <g opacity={isDay ? 0.8 : 0.45} stroke={isDay ? "#ffb35c" : "#e8e4d8"} strokeWidth="1.2" strokeLinecap="round">
    <line x1={x - 7} x2={x + 7} y1={SKY.height + 3} y2={SKY.height + 3} />
    <line x1={x - 4} x2={x + 4} y1={SKY.height + 9} y2={SKY.height + 9} />
    <line x1={x - 2} x2={x + 2} y1={SKY.height + 15} y2={SKY.height + 15} />
  </g>
);

// a handful of stars over the sea at night, twinkling out of step
const STARS = [
  [18, 14, 0.8],
  [42, 30, 0.6],
  [64, 10, 0.9],
  [88, 38, 0.5],
  [112, 18, 0.7],
  [150, 28, 0.6],
  [172, 8, 0.9],
  [190, 44, 0.5],
];

const Stars = ({ isStill }) =>
  STARS.map(([x, y, r], index) => (
    <motion.circle
      key={`${x}-${y}`}
      cx={x}
      cy={y}
      r={r}
      fill="#f4efd9"
      animate={isStill ? undefined : { opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2.4 + (index % 3) * 0.7, repeat: Infinity, delay: index * 0.4, ease: "easeInOut" }}
    />
  ));

// the sky's own colors for the hour, washed over the tile from the top down to the horizon, fading into the sea
const SkyWash = ({ part }) => {
  const colors = SKY_COLORS[part];
  return (
    <>
      <linearGradient id="sky-wash" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={colors.top} style={{ transition: "stop-color 2s" }} />
        <stop offset="100%" stopColor={colors.horizon} style={{ transition: "stop-color 2s" }} />
      </linearGradient>
      <linearGradient id="sea-wash" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor={colors.horizon} stopOpacity="0.5" />
        <stop offset="100%" stopColor={colors.horizon} stopOpacity="0" />
      </linearGradient>
    </>
  );
};

/**
 * The sky over Rosarito right now, over the sea and in the colors of the hour: the sun on its arc during the day, the moon at night, both moving
 * with the clock, their light on the water, the pier walking out into the waves and now and then a gull.
 * @param {{ hour: number, minute: number }} props the time where I live
 */
const Sky = ({ hour, minute }) => {
  const isStill = useReducedMotion();
  const { isDay, progress } = skyPosition(hour, minute);
  const body = arcPoint(progress, SKY);
  const part = dayPart(hour, minute);
  return (
    <svg viewBox={`-10 -10 ${SKY.width + 20} ${SKY.height + SEA + 10}`} className="w-full overflow-hidden rounded-2xl" aria-hidden="true">
      <defs>
        <SkyWash part={part} />
        <radialGradient id="sun">
          <stop offset="0%" stopColor="#fff2c2" />
          <stop offset="100%" stopColor="#ff8a3d" />
        </radialGradient>
        {/* the sun sinks behind the horizon instead of floating over the water */}
        <clipPath id="sky-above">
          <rect x="-10" y="-10" width={SKY.width + 20} height={SKY.height + 10} />
        </clipPath>
        <clipPath id="sky-frame">
          <rect x="-10" y="-10" width={SKY.width + 20} height={SKY.height + SEA + 10} />
        </clipPath>
      </defs>
      <g clipPath="url(#sky-frame)">
        <rect x="-10" y="-10" width={SKY.width + 20} height={SKY.height + 10} fill="url(#sky-wash)" className="opacity-45 dark:opacity-60" />
        <rect x="-10" y={SKY.height} width={SKY.width + 20} height={SEA} fill="url(#sea-wash)" className="opacity-60" />
        {part === "night" && <Stars isStill={isStill} />}
        <path d={ARC} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" className="text-line-strong" />
        {isDay && !isStill && <Gull />}
        <g clipPath="url(#sky-above)">
          <motion.circle
            cx={body.x}
            cy={body.y}
            r={isDay ? 9 : 7}
            fill={isDay ? "url(#sun)" : "#e8e4d8"}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.3, ease: easeOutExpo }}
            style={{ filter: `drop-shadow(0 0 ${isDay ? 12 : 6}px ${isDay ? "#ff9a3d" : "#e8e4d8"})` }}
          />
        </g>
        <line x1="-10" x2={SKY.width + 10} y1={SKY.height} y2={SKY.height} stroke="currentColor" strokeWidth="1" className="text-line-strong" />
        <Glint x={body.x} isDay={isDay} />
        <Waves isStill={isStill} />
        <Pier />
      </g>
    </svg>
  );
};

export default Sky;
