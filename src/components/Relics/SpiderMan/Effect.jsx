import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import classicSpidey from "../../../assets/images/spider-man.gif";
import {
  COMIC_YELLOW,
  SPIDER_BLUE,
  SPIDER_RED,
  WEB_WHITE,
  pointOn,
  spokeAngles,
  squigglePath,
  starburstPoints,
  webRing,
} from "./helpers";

// the beats, in seconds, lined up with the tingle, the thwip and the theme in sound.js
const THWIP_AT = 1.1;
const DROP_AT = 1.45;
const CAPTION_AT = 3.1;
// the theme's last "can" rings out around 5.4 s, so the frame has settled by 6
const SETTLES_MS = 6000;

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

// red and blue rays fanning out from behind Spidey, the cover of every issue he ever led
const SUNBURST = `repeating-conic-gradient(from 0deg at 50% 42%, ${SPIDER_RED} 0deg 10deg, ${SPIDER_BLUE} 10deg 20deg)`;
const SPOTLIGHT = easedGlow(COMIC_YELLOW, { strength: 0.55, shape: "ellipse", at: "50% 42%", reach: 45 });
// comic halftone dots laid over the rays, the print every Spider-Man panel is made of
const HALFTONE = "radial-gradient(rgba(0,0,0,0.28) 1.2px, transparent 1.8px) 0 0 / 9px 9px";

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

// the classic Spidey drops in on his thread from above the screen and swings to a stop in the middle of the web
const SwingingSpidey = ({ isReduced }) => (
  <motion.div
    className="absolute top-1/2 left-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2"
    initial={isReduced ? { opacity: 0 } : { y: "-70vh", opacity: 0 }}
    animate={isReduced ? { opacity: 1 } : { y: 0, opacity: 1 }}
    transition={{ duration: 0.7, delay: DROP_AT, ease: easeOutExpo }}
  >
    <span className="absolute bottom-[80%] left-1/2 h-[70vh] w-px bg-white/90" />
    <motion.img
      src={classicSpidey}
      alt=""
      className="relative w-full [image-rendering:pixelated]"
      style={{ originY: 0, filter: "drop-shadow(4px 4px 0 #111111)" }}
      animate={isReduced ? undefined : { rotate: [0, 6, -4, 2, 0] }}
      transition={{ duration: 1.5, delay: DROP_AT + 0.5, ease: "easeInOut" }}
    />
  </motion.div>
);

// the tagline in a comic caption box, and the line that ties it to school
const Caption = () => (
  <div className="absolute inset-x-4 bottom-[max(7.5rem,12vh)] flex flex-col items-center gap-3 text-center">
    <motion.p
      className="w-full max-w-md -rotate-1 border-2 border-black px-5 py-3 font-sans text-base font-black tracking-wide text-black uppercase shadow-[4px_4px_0_#000]"
      style={{ background: COMIC_YELLOW }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: CAPTION_AT }}
    >
      <TypedText text="Your friendly neighborhood engineer." startAt={CAPTION_AT + 0.15} perLetter={0.04} />
    </motion.p>
    <motion.p
      className="max-w-md rounded-md bg-black/75 px-3 py-2 font-mono text-[clamp(0.7rem,2.8vw,0.8rem)] leading-relaxed text-pretty text-white/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: CAPTION_AT + 1.5 }}
    >
      Peter was a student first. So was Cristopher: B.S. in Computer Systems Engineering, Instituto Tecnológico de Tijuana.
    </motion.p>
  </div>
);

/** Spider-Man: the Spider-Sense tingles, a thwip spins the web, and the classic Spidey drops in while the 1967 theme plays. */
const FriendlyNeighborhood = ({ onDone }) => {
  const isReduced = useReducedMotion();
  useMomentLength(SETTLES_MS, onDone);

  // the screen shudders while the Spider-Sense screams
  const shudder = isReduced ? undefined : { x: [0, -5, 5, -4, 4, -2, 0], y: [0, 2, -2, 1, -1, 0, 0] };

  return (
    <EffectLayer background={`${HALFTONE}, ${SPOTLIGHT}, ${SUNBURST}`}>
      <motion.div className="absolute inset-0" animate={shudder} transition={{ duration: 0.9, delay: 0.1, ease: "linear" }}>
        <SpiderSense isReduced={isReduced} />
        <WebShots />
        <div className="absolute top-[42%] left-1/2 size-[min(80vw,24rem,48vh)] -translate-x-1/2 -translate-y-1/2">
          <SpunWeb />
          <Shockwave color={COMIC_YELLOW} delay={THWIP_AT} />
          <SwingingSpidey isReduced={isReduced} />
          <Thwip isReduced={isReduced} />
        </div>
        <Caption />
      </motion.div>
    </EffectLayer>
  );
};

export default FriendlyNeighborhood;
