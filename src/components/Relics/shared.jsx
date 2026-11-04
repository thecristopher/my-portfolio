import { motion } from "framer-motion";
import { RELICS } from "../../lib/relics";
import { easeOutExpo } from "../../lib/motion";
import { burstSpokes } from "./actions";

// every emblem is drawn on a 64 unit square, then each spot on the page scales it with zoom
export const EMBLEM_CLASS = "block size-16 overflow-visible";

/**
 * The object a relic lives in: a real button, the size of an icon and nearly see through, with no label and no
 * cursor change, so only a careful eye finds it. On hover it wakes up in its own color and lifts out of the page.
 * Found, it keeps its color so a returning visit can spot its own finds.
 * @param {{ id: string, isFound: boolean, onTouch: () => void, className?: string, zoom?: number, children: React.ReactNode }} props
 *   zoom shrinks the object without leaving its full size behind in the layout
 */
export const RelicButton = ({ id, isFound, onTouch, className = "", zoom = 1, children }) => {
  const relic = RELICS[id];
  return (
    <button
      type="button"
      onClick={onTouch}
      aria-label={isFound ? `${relic.name}, ${relic.franchise}` : "?"}
      data-relic={id}
      className={`group relative inline-grid touch-manipulation place-items-center p-1 outline-none ${className}`}
      style={{ "--relic-glow": relic.color }}
    >
      <span
        className={`relative block transition-[opacity,filter,scale] duration-500 group-hover:scale-125 group-hover:opacity-100 group-hover:grayscale-0 group-hover:drop-shadow-[0_0_8px_var(--relic-glow)] group-focus-visible:scale-125 group-focus-visible:opacity-100 group-focus-visible:grayscale-0 ${
          isFound ? "opacity-100 drop-shadow-[0_0_6px_var(--relic-glow)]" : "opacity-[0.16] grayscale"
        }`}
      >
        <span className="block" style={{ zoom }}>
          {children}
        </span>
      </span>
    </button>
  );
};

const NIGHT = "#05050a";

/**
 * The stage every moment plays on: the page blurs away behind a dark lit from the middle in the relic's own color.
 * Text on it is always light, whatever the theme, the way a keynote goes dark for its big reveal.
 * @param {{ color: string, children: React.ReactNode, className?: string, glowAt?: string }} props glowAt moves the light, like "50% 40%"
 */
export const MomentLayer = ({ color, children, className = "", glowAt = "50% 42%" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6, ease: easeOutExpo }}
    className={`pointer-events-none fixed inset-0 z-[70] overflow-hidden text-white backdrop-blur-2xl ${className}`}
    style={{ background: `radial-gradient(ellipse 70% 60% at ${glowAt}, color-mix(in oklab, ${color} 30%, ${NIGHT}) 0%, color-mix(in oklab, ${NIGHT} 94%, transparent) 72%)` }}
    aria-hidden="true"
  >
    {children}
  </motion.div>
);

const reveal = (at) => ({
  initial: { opacity: 0, y: 24, filter: "blur(12px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.1, delay: at, ease: easeOutExpo },
});

/**
 * What a moment says, set like a keynote slide under the art: the franchise small in the relic's color, one huge
 * line, then the story in a few calm lines. Each piece rises out of a blur on its own beat.
 * @param {{ color: string, eyebrow: string, title: React.ReactNode, lines?: React.ReactNode[], at?: number, className?: string }} props
 *   at is when the eyebrow lands, in seconds, the rest follow it
 */
export const MomentCopy = ({ color, eyebrow, title, lines = [], at = 0, className = "" }) => (
  <div className={`absolute inset-x-0 bottom-[12vh] flex flex-col items-center gap-4 px-6 text-center ${className}`}>
    <motion.p {...reveal(at)} className="text-sm font-semibold tracking-wide" style={{ color }}>
      {eyebrow}
    </motion.p>
    <motion.p
      {...reveal(at + 0.15)}
      className="max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-balance"
      style={{ backgroundImage: `linear-gradient(100deg, #ffffff 30%, ${color} 120%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
    >
      {title}
    </motion.p>
    {lines.map((line, index) => (
      <motion.p key={index} {...reveal(at + 0.45 + index * 0.35)} className="max-w-xl text-lg leading-snug text-white/70 text-pretty sm:text-xl">
        {line}
      </motion.p>
    ))}
  </div>
);

/**
 * A stroke that draws itself, the pen of every emblem in a moment.
 * @param {{ d: string, color: string, at?: number, duration?: number, width?: number, fill?: string }} props
 */
export const DrawnPath = ({ d, color, at = 0, duration = 1.2, width = 1.5, fill = "none" }) => (
  <motion.path
    d={d}
    fill={fill}
    stroke={color}
    strokeWidth={width}
    strokeLinecap="round"
    strokeLinejoin="round"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ pathLength: { duration, delay: at, ease: easeOutExpo }, opacity: { duration: 0.2, delay: at } }}
  />
);

/**
 * A soft bloom of light that swells behind the art and settles, the beat where a moment lands.
 * @param {{ color: string, at?: number, size?: string, className?: string }} props
 */
export const Bloom = ({ color, at = 0, size = "min(90vmin,44rem)", className = "top-[40%]" }) => (
  <motion.span
    className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${className}`}
    style={{ width: size, height: size, background: `radial-gradient(circle, ${color} 0%, transparent 65%)` }}
    initial={{ opacity: 0, scale: 0.4 }}
    animate={{ opacity: [0, 0.9, 0.55], scale: [0.4, 1.15, 1] }}
    transition={{ duration: 1.8, delay: at, ease: easeOutExpo }}
  />
);

/**
 * Thin lines of light thrown out from a point, a clean spark burst.
 * @param {{ color: string, at?: number, count?: number, className?: string }} props
 */
export const Burst = ({ color, at = 0, count = 16, className = "top-[40%]" }) => (
  <svg viewBox="-100 -100 200 200" className={`absolute left-1/2 size-[min(80vmin,38rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible ${className}`}>
    {burstSpokes(count).map((spoke) => (
      <motion.line
        key={spoke.angle}
        x1={spoke.inner.x}
        y1={spoke.inner.y}
        x2={spoke.outer.x}
        y2={spoke.outer.y}
        stroke={color}
        strokeWidth={spoke.isLong ? 1.4 : 0.8}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, delay: at, ease: easeOutExpo }}
      />
    ))}
  </svg>
);

/**
 * Text that writes itself one letter at a time, for the lines a game would type out.
 * @param {{ text: string, at?: number, perLetter?: number }} props
 */
export const TypedText = ({ text, at = 0, perLetter = 0.035 }) =>
  [...text].map((letter, index) => (
    <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: at + index * perLetter }}>
      {letter}
    </motion.span>
  ));
