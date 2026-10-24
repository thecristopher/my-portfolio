import { motion } from "framer-motion";
import { RELICS } from "../../lib/relics";
import { easedGlow, pixelBeams, pixelRingRows } from "../../actions";
import { pixelSteps } from "../../lib/motion";
import PixelArt from "../PixelArt";

/**
 * The object a relic lives in: a real button, the size of an icon and nearly see through, with no label and no
 * cursor change, so only a careful eye finds it. The reward for finding it comes on hover: it wakes up in its own
 * color, glows and lifts out of the page. Found, it keeps a touch more color so a returning visit can spot its own finds.
 * @param {{ id: string, isFound: boolean, onTouch: () => void, className?: string, zoom?: number, children: React.ReactNode }} props
 *   zoom shrinks the object without leaving its full size behind in the layout
 */
// every relic is one simple emblem drawn at this size, then each spot on the page scales it with zoom
export const EMBLEM_CLASS = "block size-16 overflow-visible";

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
        className={`relative block transition-[opacity,filter,scale] duration-500 group-hover:scale-125 group-hover:opacity-100 group-hover:saturate-100 group-hover:drop-shadow-[0_0_6px_var(--relic-glow)] group-focus-visible:scale-125 group-focus-visible:opacity-100 group-focus-visible:saturate-100 ${
          // found relics keep their franchise color and glow so the hunter can tell at a glance what's already theirs
          isFound ? "opacity-100 saturate-100 drop-shadow-[0_0_6px_var(--relic-glow)]" : "opacity-[0.12] saturate-0"
        }`}
      >
        <span className="block" style={{ zoom }}>
          {children}
        </span>
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

// the shockwave ring and the spark star, drawn on the same pixel grid as the relics
const RING_ROWS = pixelRingRows(24, 2);
const SPARK_ROWS = ["...#...", "...#...", "..#w#..", "##www##", "..#w#..", "...#...", "...#..."];
const DOT_ROWS = ["##", "##"];

/** A ring of pixels rolling out from the middle of the screen in a few chunky frames, the beat where a moment lands. */
export const Shockwave = ({ color, delay = 0, size = "min(80vw,30rem)" }) => (
  <motion.span
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
    style={{ width: size, height: size, mixBlendMode: "screen", filter: `drop-shadow(0 0 6px ${color})` }}
    initial={{ scale: 0.15, opacity: 0 }}
    animate={{ scale: 2.2, opacity: [0, 0.9, 0] }}
    transition={{ duration: 1.1, delay, ease: pixelSteps(9) }}
  >
    <PixelArt rows={RING_ROWS} palette={{ "#": color }} className="size-full" />
  </motion.span>
);

/** Pixel motes thrown out evenly around the middle of the screen, cycling through the moment's colors. */
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
        transition={{ duration: 1.3, delay, ease: pixelSteps(10) }}
      >
        <PixelArt
          rows={round ? DOT_ROWS : SPARK_ROWS}
          palette={{ "#": color, w: "#ffffff" }}
          className={round ? "m-auto block size-2.5" : "block size-full"}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </motion.span>
    );
  });

// two sets of beams at uneven angles. the broad ones carry the glow, the thin ones give it the shafts of light
const BROAD_BEAMS = [
  { at: 8, width: 6, strength: 0.26 },
  { at: 61, width: 8, strength: 0.18 },
  { at: 104, width: 5, strength: 0.24 },
  { at: 158, width: 9, strength: 0.16 },
  { at: 207, width: 6, strength: 0.28 },
  { at: 251, width: 7, strength: 0.2 },
  { at: 302, width: 6, strength: 0.24 },
  { at: 339, width: 4, strength: 0.16 },
];
const THIN_BEAMS = [
  { at: 27, width: 1.6, strength: 0.34 },
  { at: 83, width: 1.2, strength: 0.26 },
  { at: 131, width: 1.8, strength: 0.32 },
  { at: 186, width: 1.2, strength: 0.24 },
  { at: 229, width: 1.6, strength: 0.34 },
  { at: 278, width: 1.4, strength: 0.28 },
  { at: 321, width: 1.6, strength: 0.3 },
];

// the beams fade out smoothly toward the edge, so they read as light instead of rings cut into them
const BEAM_FALLOFF = easedGlow("black", { reach: 78 });

const BeamLayer = ({ beams, color, turn, duration, delay }) => (
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{ background: pixelBeams(beams, color), maskImage: BEAM_FALLOFF, mixBlendMode: "screen" }}
    initial={{ rotate: 0, opacity: 0 }}
    animate={{ rotate: turn, opacity: 1 }}
    transition={{ rotate: { duration, ease: pixelSteps(Math.abs(turn)) }, opacity: { duration: 0.6, delay, ease: pixelSteps(4) } }}
  />
);

/**
 * God rays behind a "you got it" moment, 16 bit style: hard edged beams ticking around in steps and a soft bloom at
 * the core. at moves their source, so they pour out of the item itself instead of the middle of its box.
 * @param {{ color: string, delay?: number, at?: { x: string, y: string } }} props at is a css position in the parent
 */
export const LightRays = ({ color, delay = 0, at = { x: "50%", y: "50%" } }) => (
  <motion.div
    className="absolute size-[min(160vmax,72rem)] -translate-x-1/2 -translate-y-1/2"
    style={{ left: at.x, top: at.y }}
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: [0.7, 1.04, 1], opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: pixelSteps(6) }}
  >
    <BeamLayer beams={BROAD_BEAMS} color={color} turn={24} duration={6} delay={delay} />
    {/* the shafts are the item's own color washed toward white, so they glow instead of cutting like lasers */}
    <BeamLayer beams={THIN_BEAMS} color={`color-mix(in oklab, ${color} 45%, #fffbe8)`} turn={-40} duration={6} delay={delay + 0.15} />
    <motion.div
      className="absolute inset-[30%] rounded-full"
      style={{ background: `${easedGlow("#fffbe8", { strength: 0.75, reach: 45 })}, ${easedGlow(color, { strength: 0.45 })}`, mixBlendMode: "screen" }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 0.75], scale: [0.6, 1.1, 1] }}
      transition={{ duration: 1.2, delay: delay + 0.1, ease: pixelSteps(6) }}
    />
  </motion.div>
);
