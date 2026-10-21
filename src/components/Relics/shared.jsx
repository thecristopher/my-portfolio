import { motion } from "framer-motion";
import { RELICS } from "../../lib/relics";
import { easedGlow, softBeams, softRing } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

/**
 * The object a relic lives in: a real button, tiny and nearly see through, with no label, no glow and no cursor
 * change, so only a careful eye finds it. Hovering lifts it a little out of the page. Found, it keeps a touch more
 * color so a returning visit can spot its own finds.
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
      className={`group relative inline-grid touch-manipulation place-items-center outline-none ${className}`}
    >
      <span
        className={`relative transition-[opacity,filter] duration-700 group-hover:opacity-70 group-focus-visible:opacity-70 ${
          isFound ? "opacity-45 saturate-50" : "opacity-15 saturate-0"
        }`}
        style={{ zoom }}
      >
        {children}
      </span>
    </button>
  );
};

/**
 * The full screen layer every relic moment plays on: fades in over the page and out again when it leaves.
 * @param {{ background?: string, className?: string, children: React.ReactNode, fade?: number }} props
 */
export const EffectLayer = ({ background, className = "", children, fade = 0.4 }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: fade }}
    className={`pointer-events-none fixed inset-0 z-[70] overflow-hidden ${className}`}
    style={{ background }}
    aria-hidden="true"
  >
    {children}
  </motion.div>
);

/** Letters land one at a time, the way old game text boxes print. */
export const TypedText = ({ text, startAt = 0, perLetter = 0.04 }) =>
  [...text].map((letter, index) => (
    <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: startAt + index * perLetter }}>
      {letter}
    </motion.span>
  ));

/** A ring of light rolling out from the middle of the screen, the beat where a moment lands. */
export const Shockwave = ({ color, delay = 0, size = "min(80vw,30rem)" }) => (
  <motion.span
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
    style={{ width: size, height: size, background: softRing(color), mixBlendMode: "screen" }}
    initial={{ scale: 0.15, opacity: 0 }}
    animate={{ scale: 2.2, opacity: [0, 0.9, 0] }}
    transition={{ duration: 1.1, delay, ease: easeOutExpo }}
  />
);

/** Motes thrown out evenly around the middle of the screen, cycling through the moment's colors. */
export const Sparks = ({ colors, count = 14, reach = 40, delay = 0, round = false }) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const far = index % 2 === 0 ? reach : reach * 0.72;
    const color = colors[index % colors.length];
    return (
      <motion.span
        key={angle}
        className="absolute top-1/2 left-1/2 -mt-2 -ml-2 size-4"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
        animate={{ x: `${Math.cos(angle) * far}vmin`, y: `${Math.sin(angle) * far}vmin`, opacity: [0, 1, 0], scale: [0.4, 1.3, 0.6] }}
        transition={{ duration: 1.3, delay, ease: easeOutExpo }}
      >
        {round ? (
          <span className="block size-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        ) : (
          <svg viewBox="0 0 8 8" className="size-full" style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
            <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={color} />
          </svg>
        )}
      </motion.span>
    );
  });

// two sets of beams at uneven angles. the broad ones carry the glow, the thin ones give it the shafts of light
const BROAD_BEAMS = [
  { at: 8, width: 9, strength: 0.32 },
  { at: 61, width: 12, strength: 0.22 },
  { at: 104, width: 7, strength: 0.3 },
  { at: 158, width: 13, strength: 0.2 },
  { at: 207, width: 8, strength: 0.34 },
  { at: 251, width: 11, strength: 0.24 },
  { at: 302, width: 9, strength: 0.28 },
  { at: 339, width: 6, strength: 0.18 },
];
const THIN_BEAMS = [
  { at: 27, width: 3.6, strength: 0.3 },
  { at: 83, width: 3, strength: 0.22 },
  { at: 131, width: 4.2, strength: 0.28 },
  { at: 186, width: 2.8, strength: 0.2 },
  { at: 229, width: 4, strength: 0.3 },
  { at: 278, width: 3.2, strength: 0.24 },
  { at: 321, width: 3.6, strength: 0.26 },
];

// the beams are brightest at the source and thin out toward the edge, the way real light falls off
const BEAM_FALLOFF = easedGlow("black", { reach: 78 });

const BeamLayer = ({ beams, color, turn, duration, delay }) => (
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{ background: softBeams(beams, color), maskImage: BEAM_FALLOFF, mixBlendMode: "screen" }}
    initial={{ rotate: 0, opacity: 0 }}
    animate={{ rotate: turn, opacity: 1 }}
    transition={{ rotate: { duration, ease: "linear" }, opacity: { duration: 1.2, delay, ease: "easeOut" } }}
  />
);

/** God rays behind a "you got it" moment: broad glow and thin shafts turning against each other, a bloom at the core. */
export const LightRays = ({ color, delay = 0 }) => (
  <motion.div
    className="absolute top-1/2 left-1/2 size-[min(160vmax,72rem)] -translate-x-1/2 -translate-y-1/2"
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: [0.7, 1.04, 1], opacity: 1 }}
    transition={{ duration: 1.6, delay, ease: easeOutExpo }}
  >
    <BeamLayer beams={BROAD_BEAMS} color={color} turn={24} duration={6} delay={delay} />
    {/* the shafts are the item's own color washed toward white, so they glow instead of cutting like lasers */}
    <BeamLayer beams={THIN_BEAMS} color={`color-mix(in oklab, ${color} 45%, #fffbe8)`} turn={-40} duration={6} delay={delay + 0.15} />
    <motion.div
      className="absolute inset-[30%] rounded-full"
      style={{ background: `${easedGlow("#fffbe8", { strength: 0.75, reach: 45 })}, ${easedGlow(color, { strength: 0.45 })}`, mixBlendMode: "screen" }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 0.75], scale: [0.6, 1.1, 1] }}
      transition={{ duration: 1.4, delay: delay + 0.1, ease: easeOutExpo }}
    />
  </motion.div>
);
