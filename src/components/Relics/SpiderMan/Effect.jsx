import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import { SpiderMask, SymbioteEmblem } from "./Mask";
import {
  COMIC_YELLOW,
  SPIDER_BLUE,
  SPIDER_RED,
  SYMBIOTE_BLACK,
  WEB_WHITE,
  pointOn,
  spokeAngles,
  squigglePath,
  starburstPoints,
  tendrilPath,
  webRing,
} from "./helpers";

// the beats, in seconds, lined up with the tingle, the thwip, the brass and the growl in sound.js
const THWIP_AT = 1.1;
const DROP_AT = 1.45;
const CRAWL_AT = 2.6;
const TAKEOVER_AT = 3.15;
const EMBLEM_AT = 3.8;
const CAPTION_AT = 4.2;
const LENGTH_MS = 6000;

// the Spider-Sense: jagged lines crackling around the edges of the screen, and a tighter ring around the middle
const EDGE_SQUIGGLES = spokeAngles(16, 0.25).map((angle) => squigglePath({ center: [0, 0], angle, from: 31, to: 49, zigs: 7, amplitude: 1.6 }));
const CORE_SQUIGGLES = spokeAngles(10).map((angle) => squigglePath({ center: [0, 0], angle, from: 6, to: 14, zigs: 4, amplitude: 1 }));

// the thwip: web lines from the middle of the stage out to every corner and the sides
const STAGE_MIDDLE = [50, 42];
const WEB_SHOTS = [
  [0, 0],
  [100, 0],
  [0, 100],
  [100, 100],
  [0, 46],
  [100, 38],
].map(([x, y]) => `M${STAGE_MIDDLE[0]} ${STAGE_MIDDLE[1]} L${x} ${y}`);

// the web the mask hangs in: eight spokes and rings that sag between them
const WEB_SPOKES = spokeAngles(8);
const WEB_SPOKE_LINES = WEB_SPOKES.map((angle) => {
  const [x, y] = pointOn([50, 50], angle, 48);
  return `M50 50 L${x} ${y}`;
});
const WEB_RINGS = [12, 22, 32, 43].map((radius) => webRing({ center: [50, 50], radius, spokes: WEB_SPOKES, sag: 0.82 }));

const STARBURST = starburstPoints({ spikes: 12, outer: 48, inner: 34 });

// the symbiote rising out of the floor, thick at the ground and reaching up for the mask
const FLOOR_TENDRILS = [
  { baseX: 10, baseWidth: 10, tipX: 28, tipY: 50, sway: 10 },
  { baseX: 24, baseWidth: 6, tipX: 14, tipY: 64, sway: -6 },
  { baseX: 32, baseWidth: 12, tipX: 42, tipY: 60, sway: 8 },
  { baseX: 50, baseWidth: 15, tipX: 50, tipY: 66, sway: 6 },
  { baseX: 68, baseWidth: 12, tipX: 58, tipY: 58, sway: -8 },
  { baseX: 78, baseWidth: 6, tipX: 88, tipY: 62, sway: 6 },
  { baseX: 90, baseWidth: 10, tipX: 72, tipY: 48, sway: -10 },
].map(tendrilPath);

// the same reach on the mask itself, climbing from the chin before the black swallows the red
const MASK_TENDRILS = [
  "M50 118 C44 100 30 96 24 80",
  "M50 118 C56 98 72 94 78 76",
  "M50 118 C48 96 40 80 42 58",
  "M50 118 C54 94 62 78 60 56",
  "M50 118 C38 108 20 104 14 92",
  "M50 118 C64 108 82 104 88 90",
];

const NIGHT = `${easedGlow(SPIDER_RED, { strength: 0.2, shape: "ellipse", at: "50% 42%", reach: 75 })}, ${easedGlow(SPIDER_BLUE, { strength: 0.25, shape: "ellipse", at: "50% 100%", reach: 70 })}, rgba(8,10,26,0.95)`;
// comic halftone dots laid over the night, the print every Spider-Man panel is made of
const HALFTONE = `radial-gradient(${SPIDER_RED}33 1px, transparent 1.6px) 0 0 / 9px 9px`;

// the tingle: squiggles crackle on and off around the edges while the middle of the screen flashes
const SpiderSense = ({ isReduced }) => (
  <>
    <motion.span
      className="absolute inset-0"
      style={{ background: `${easedGlow("#ffffff", { strength: 0.8, reach: 30 })}, ${easedGlow(SPIDER_RED, { strength: 0.5, reach: 70 })}` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.15, 0.9, 0.1, 0.8, 0] }}
      transition={{ duration: THWIP_AT, ease: "linear" }}
    />
    <motion.svg
      viewBox="-50 -50 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      style={{ filter: `drop-shadow(0 0 6px ${SPIDER_RED})` }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: [0, 1, 0.2, 1, 0.3, 1, 0], scale: isReduced ? 1 : [0.94, 1, 0.97, 1.02, 0.98, 1.04, 1.06] }}
      transition={{ duration: THWIP_AT + 0.1, ease: "linear" }}
    >
      {[...EDGE_SQUIGGLES, ...CORE_SQUIGGLES].map((squiggle) => (
        <path key={squiggle} d={squiggle} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </motion.svg>
  </>
);

// web shot out to every corner of the screen the instant the thwip lands
const WebShots = () => (
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
    {WEB_SHOTS.map((shot, index) => (
      <motion.path
        key={shot}
        d={shot}
        stroke={WEB_WHITE}
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 1, 0.5] }}
        transition={{ duration: 0.3, delay: THWIP_AT + index * 0.04, ease: "easeOut" }}
      />
    ))}
  </svg>
);

// the web spinning itself behind the mask: spokes first, then the rings wound around them
const SpunWeb = () => (
  <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
    {WEB_SPOKE_LINES.map((line, index) => (
      <motion.path
        key={line}
        d={line}
        stroke={WEB_WHITE}
        strokeWidth="0.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: THWIP_AT + 0.15 + index * 0.04, ease: "easeOut" }}
      />
    ))}
    {WEB_RINGS.map((ring, index) => (
      <motion.path
        key={ring}
        d={ring}
        fill="none"
        stroke={WEB_WHITE}
        strokeWidth="0.45"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, delay: THWIP_AT + 0.4 + index * 0.14, ease: "easeInOut" }}
      />
    ))}
  </svg>
);

// the comic sound effect, punched out on a red burst
const Thwip = ({ isReduced }) => (
  <motion.div
    className="absolute -top-[8%] -left-[4%] grid w-[62%] place-items-center"
    initial={{ opacity: 0, scale: isReduced ? 1 : 0.3, rotate: -14 }}
    animate={{ opacity: [0, 1, 1, 0], scale: isReduced ? 1 : [0.3, 1.15, 1, 1], rotate: -12 }}
    transition={{ duration: 1.4, delay: THWIP_AT, times: [0, 0.12, 0.75, 1], ease: easeOutExpo }}
  >
    <svg viewBox="0 0 100 100" className="col-start-1 row-start-1 w-full">
      <polygon points={STARBURST} fill={SPIDER_RED} stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
    <p
      className="col-start-1 row-start-1 font-sans text-[clamp(1.6rem,8vw,3.25rem)] font-black tracking-tight italic"
      style={{ color: COMIC_YELLOW, WebkitTextStroke: "2px #111111", textShadow: "3px 3px 0 #111111" }}
    >
      THWIP!
    </p>
  </motion.div>
);

// the red mask, with the symbiote climbing its chin and the black suit swallowing it from the bottom up
const TakenMask = () => (
  <div className="relative">
    <SpiderMask className="w-full" />
    <svg viewBox="0 0 100 120" className="absolute inset-0 size-full overflow-visible">
      {MASK_TENDRILS.map((tendril, index) => (
        <motion.path
          key={tendril}
          d={tendril}
          fill="none"
          stroke={SYMBIOTE_BLACK}
          strokeWidth="5"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.8, delay: TAKEOVER_AT - 0.3 + index * 0.05, ease: "easeIn" }}
        />
      ))}
    </svg>
    <motion.div
      className="absolute inset-0"
      initial={{ clipPath: "circle(0% at 50% 100%)" }}
      animate={{ clipPath: "circle(140% at 50% 100%)" }}
      transition={{ duration: 0.8, delay: TAKEOVER_AT, ease: [0.7, 0, 0.3, 1] }}
    >
      <SpiderMask className="w-full" suit="symbiote" />
    </motion.div>
  </div>
);

// the mask drops in on its thread from above the screen and swings to a stop in the middle of the web
const DroppingMask = ({ isReduced }) => (
  <>
    <motion.span
      className="absolute bottom-1/2 left-1/2 h-screen w-px origin-top bg-white/80"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: isReduced ? 0.01 : 0.6, delay: DROP_AT, ease: easeOutExpo }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 w-[44%] -translate-x-1/2 -translate-y-1/2"
      initial={isReduced ? { opacity: 0 } : { y: "-60vh", opacity: 0 }}
      animate={isReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: DROP_AT, ease: easeOutExpo }}
    >
      <div className="absolute -inset-1/3 rounded-full" style={{ background: easedGlow(SPIDER_RED, { strength: 0.35 }) }} />
      <motion.div
        className="relative"
        style={{ originY: 0 }}
        animate={isReduced ? undefined : { rotate: [0, 8, -5, 3, 0] }}
        transition={{ duration: 1.5, delay: DROP_AT + 0.5, ease: "easeInOut" }}
      >
        <TakenMask />
      </motion.div>
    </motion.div>
  </>
);

// the black suit's white spider, slammed in behind the mask once the symbiote has it
const Emblem = ({ isReduced }) => (
  <motion.div
    className="absolute -inset-[18%]"
    style={{ filter: "drop-shadow(0 0 16px rgba(255,255,255,0.55))" }}
    initial={{ opacity: 0, scale: isReduced ? 1 : 0.5 }}
    animate={{ opacity: 0.95, scale: 1 }}
    transition={{ duration: 0.5, delay: EMBLEM_AT, ease: easeOutExpo }}
  >
    <SymbioteEmblem className="size-full" />
  </motion.div>
);

// the black rising off the floor and the dark settling over the whole screen as the symbiote wins
const SymbioteRising = ({ isReduced }) => (
  <>
    <motion.span
      className="absolute inset-0"
      style={{ background: `${easedGlow("#3a3f52", { strength: 0.35, at: "50% 42%", reach: 60 })}, ${SYMBIOTE_BLACK}` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.88 }}
      transition={{ duration: 0.9, delay: TAKEOVER_AT - 0.1 }}
    />
    <motion.svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 size-full"
      initial={isReduced ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)" }}
      animate={isReduced ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 0.8, delay: CRAWL_AT, ease: "easeIn" }}
    >
      {FLOOR_TENDRILS.map((tendril) => (
        <path key={tendril} d={tendril} fill={SYMBIOTE_BLACK} stroke="#3a3f52" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
    </motion.svg>
  </>
);

// the game's tagline in a comic caption box, and the line that ties it to school
const Caption = () => (
  <div className="absolute inset-x-4 bottom-[7vh] flex flex-col items-center gap-3 text-center">
    <motion.p
      className="w-full max-w-md -rotate-1 border-2 border-black px-5 py-3 font-sans text-base font-black tracking-wide text-black uppercase shadow-[4px_4px_0_#000]"
      style={{ background: COMIC_YELLOW }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: CAPTION_AT }}
    >
      <TypedText text="Be greater. Together." startAt={CAPTION_AT + 0.15} perLetter={0.045} />
    </motion.p>
    <motion.p
      className="font-mono text-xs text-white/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: CAPTION_AT + 1.1 }}
    >
      Peter was a student first.
    </motion.p>
  </div>
);

/** Spider-Man 2: the Spider-Sense tingles, a thwip spins the web, the mask drops in and the symbiote takes it black. */
const BeGreater = ({ onDone }) => {
  const isReduced = useReducedMotion();
  useMomentLength(LENGTH_MS, onDone);

  // the screen shudders while the Spider-Sense screams, the way the game shakes the camera
  const shudder = isReduced ? undefined : { x: [0, -5, 5, -4, 4, -2, 0], y: [0, 2, -2, 1, -1, 0, 0] };

  return (
    <EffectLayer background={`${HALFTONE}, ${NIGHT}`}>
      <motion.div className="absolute inset-0" animate={shudder} transition={{ duration: 0.9, delay: 0.1, ease: "linear" }}>
        <SpiderSense isReduced={isReduced} />
        <WebShots />
        <SymbioteRising isReduced={isReduced} />
        <div className="absolute top-[42%] left-1/2 size-[min(80vw,24rem,48vh)] -translate-x-1/2 -translate-y-1/2">
          <Emblem isReduced={isReduced} />
          <SpunWeb />
          <Shockwave color={SPIDER_RED} delay={THWIP_AT} />
          <Shockwave color="#f7f7f2" delay={EMBLEM_AT} />
          <DroppingMask isReduced={isReduced} />
          <Thwip isReduced={isReduced} />
        </div>
        <Caption />
      </motion.div>
    </EffectLayer>
  );
};

export default BeGreater;
