import { motion, useReducedMotion } from "framer-motion";

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
 * A mug of coffee on the desk, sized like a real one next to the keyboard and seen from the same raised view: its rim
 * opens into an ellipse as wide as the keyboard's foreshortening, so you look down into the coffee, and it's still
 * steaming, because nothing gets shipped at night without one.
 */
export const Mug = ({ className = "" }) => {
  const isStill = useReducedMotion();
  return (
    <svg viewBox="-2 -74 96 160" className={`overflow-visible ${className}`} aria-hidden="true">
      {STEAM.map((d, index) => (
        <Wisp key={d} d={d} delay={index * 1.1} isStill={isStill} />
      ))}
      <ellipse cx="36" cy="80" rx="40" ry="9" fill="#000" opacity="0.45" />
      {/* the handle, a loop seen from above and to the side, so its far half hides behind the body */}
      <path d="M63 24 C90 22 92 58 64 62" fill="none" stroke="#b9482f" strokeWidth="9" strokeLinecap="round" />
      <path d="M64 28 C82 28 84 54 64 57" fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="2" />
      {/* the body, its bottom curving with the same foreshortening as the rim */}
      <path d="M4 12 L68 12 L65 70 Q36 86 7 70 Z" fill="#d8623f" />
      <path d="M4 12 L68 12 L67 22 Q36 34 5 22 Z" fill="#e8805c" opacity="0.5" />
      <path d="M14 26 L16 68" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" />
      {/* the rim and the coffee inside it, a crema ring catching the screen's light */}
      <ellipse cx="36" cy="12" rx="32" ry="11" fill="#ea8a65" />
      <ellipse cx="36" cy="13" rx="27.5" ry="8.6" fill="#2b170c" />
      <ellipse cx="36" cy="13" rx="27.5" ry="8.6" fill="none" stroke="#7a4a2a" strokeOpacity="0.7" strokeWidth="1.6" />
      <ellipse cx="29" cy="11" rx="8" ry="2.2" fill="#f3efe6" opacity="0.12" />
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
