import { motion, useReducedMotion } from "framer-motion";

const WARM = "#ffcf8a";

/**
 * A desk lamp standing on the desk beside the laptop: a round base, two arm segments with their joints reaching above
 * the lid, and a cone shade tipped down toward the keyboard, its bulb and the beam it throws as bright as `light` says.
 * @param {{ light: import("framer-motion").MotionValue<number> | number, className?: string }} props light from 0 (off) to 1
 */
export const Lamp = ({ light, className = "" }) => (
  <svg viewBox="0 0 230 520" className={`overflow-visible ${className}`} aria-hidden="true">
    <defs>
      <linearGradient id="lamp-beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={WARM} stopOpacity="0.32" />
        <stop offset="100%" stopColor={WARM} stopOpacity="0" />
      </linearGradient>
    </defs>
    {/* the base, seen a little from above: its shadow, its side and its top */}
    <ellipse cx="62" cy="514" rx="58" ry="7" fill="#000" opacity="0.5" />
    <path d="M12 500 L112 500 L112 508 Q62 518 12 508 Z" fill="#1c1c20" />
    <ellipse cx="62" cy="500" rx="50" ry="10" fill="#3a3a41" />
    <ellipse cx="62" cy="498" rx="42" ry="7" fill="#46464e" />
    {/* the two arms and the joints between them */}
    <path d="M62 494 L30 262" stroke="#2e2e34" strokeWidth="9" strokeLinecap="round" />
    <path d="M30 262 L141 62" stroke="#2e2e34" strokeWidth="8" strokeLinecap="round" />
    <path d="M55 460 L34 280" stroke="#5a5a62" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <circle cx="62" cy="492" r="8" fill="#4a4a52" />
    <circle cx="30" cy="262" r="9" fill="#4a4a52" />
    <circle cx="141" cy="62" r="8" fill="#4a4a52" />
    {/* the shade hangs from the top joint and points down and to the right, at the keyboard */}
    <g transform="translate(141 62) rotate(-30)">
      <motion.path d="M-36 62 L36 62 L170 330 L-120 330 Z" fill="url(#lamp-beam)" style={{ opacity: light }} />
      <path d="M-10 -4 L10 -4 L38 60 L-38 60 Z" fill="#2c2c32" />
      <path d="M-10 -4 L10 -4 L15 8 L-15 8 Z" fill="#45454c" />
      <path d="M-26 34 L-33 52" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="0" cy="60" rx="38" ry="9" fill="#1a1a1e" />
      <motion.ellipse cx="0" cy="60" rx="34" ry="7.5" fill={WARM} style={{ opacity: light }} />
      <motion.circle cx="0" cy="55" r="12" fill="#fff4dc" style={{ opacity: light }} />
    </g>
  </svg>
);

const STEAM = ["M22 2 C14 -10 30 -18 22 -32 C16 -42 26 -48 22 -58", "M40 2 C48 -10 32 -20 42 -34 C48 -44 38 -50 42 -62", "M31 0 C25 -12 39 -20 31 -34"];

// one wisp of steam curling up off the coffee and fading as it goes
const Wisp = ({ d, delay, isStill }) => (
  <motion.path
    d={d}
    fill="none"
    stroke="#f3efe6"
    strokeWidth="2.4"
    strokeLinecap="round"
    initial={{ opacity: isStill ? 0.25 : 0, y: 0 }}
    animate={isStill ? undefined : { opacity: [0, 0.4, 0], y: [2, -6, -16] }}
    transition={{ duration: 3.4, delay, repeat: Infinity, ease: "easeOut" }}
  />
);

/**
 * A mug of coffee on the desk, sized like a real one next to a laptop (a little under half the lid's height), seen
 * from the same raised view, and still steaming, because nothing gets shipped at night without one.
 */
export const Mug = ({ className = "" }) => {
  const isStill = useReducedMotion();
  return (
    <svg viewBox="-2 -74 96 160" className={`overflow-visible ${className}`} aria-hidden="true">
      {STEAM.map((d, index) => (
        <Wisp key={d} d={d} delay={index * 1.1} isStill={isStill} />
      ))}
      <ellipse cx="34" cy="80" rx="36" ry="5" fill="#000" opacity="0.45" />
      <path d="M62 14 C88 14 90 54 62 54" fill="none" stroke="#b9482f" strokeWidth="8" strokeLinecap="round" />
      <path d="M4 4 L64 4 L62 72 Q61 78 54 78 L14 78 Q7 78 6 72 Z" fill="#d8623f" />
      <path d="M4 4 L64 4 L64 12 L4 12 Z" fill="#e8805c" opacity="0.6" />
      <ellipse cx="34" cy="4" rx="30" ry="6" fill="#ea8a65" />
      <ellipse cx="34" cy="5" rx="26" ry="4.2" fill="#2b170c" />
      <path d="M14 18 L15 66" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

const STARS = [
  [14, 18, 1.2],
  [38, 10, 0.9],
  [62, 28, 1.1],
  [80, 14, 0.8],
  [26, 40, 0.7],
  [72, 46, 0.9],
  [50, 52, 0.6],
];

/** The window behind the desk: a slice of the night over Rosarito, a moon and a few stars blinking. */
export const NightWindow = ({ className = "" }) => {
  const isStill = useReducedMotion();
  return (
    <svg viewBox="0 0 100 80" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="night-window-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1030" />
          <stop offset="100%" stopColor="#2a1d4a" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="100" height="80" rx="3" fill="url(#night-window-sky)" />
      {STARS.map(([x, y, r], index) => (
        <motion.circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={r}
          fill="#f3efe6"
          animate={isStill ? undefined : { opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.6 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
        />
      ))}
      <circle cx="78" cy="24" r="9" fill="#f6efd8" />
      <circle cx="82" cy="21" r="8" fill="#191a3c" />
      <path d="M0 66 L100 66 L100 80 L0 80 Z" fill="#090b1a" />
      <path d="M50 0 L50 80 M0 40 L100 40" stroke="#16161b" strokeWidth="3" />
      <rect x="0" y="0" width="100" height="80" rx="3" fill="none" stroke="#1d1d22" strokeWidth="4" />
    </svg>
  );
};
