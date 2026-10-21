import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import {
  ARKHAM_ORANGE,
  BAT_PATH,
  BEATS,
  DETECTIVE_BLUE,
  GOTHAM_NIGHT,
  HUD_LINES,
  HUD_TIMING,
  SIGNAL_YELLOW,
  SKYLINE,
  rainStreaks,
  scheduleLines,
  towerPath,
} from "./helpers";

const RAIN = rainStreaks(44);
const CASE_FILE = scheduleLines(HUD_LINES, HUD_TIMING);

// the spot where the signal lands on the clouds. the beam and the scanner overlay both sit on it, so they share the box
const EMBLEM_SPOT = "absolute left-1/2 top-[30vh] aspect-[16/10] w-[min(86vw,30rem,60vh)] -translate-x-1/2 -translate-y-1/2";

// heavy clouds low over the city: where they sit, how big, and how dark
const CLOUDS = [
  { left: "-10%", top: "6vh", width: "70vw", opacity: 0.8 },
  { left: "40%", top: "2vh", width: "80vw", opacity: 0.7 },
  { left: "10%", top: "20vh", width: "90vw", opacity: 0.6 },
  { left: "55%", top: "26vh", width: "60vw", opacity: 0.55 },
];

const RETICLE_CORNERS = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "bottom-0 right-0 border-b-2 border-r-2",
];

const Clouds = () =>
  CLOUDS.map((cloud) => (
    <motion.span
      key={cloud.left}
      className="absolute aspect-[3/1] rounded-full blur-2xl"
      style={{ left: cloud.left, top: cloud.top, width: cloud.width, background: easedGlow("#2a3140", { strength: cloud.opacity }) }}
      animate={{ x: ["0vw", "4vw"] }}
      transition={{ duration: BEATS.end, ease: "linear" }}
    />
  ));

const Skyline = () => (
  <svg viewBox="0 0 400 120" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[24vh] w-full">
    {SKYLINE.map((tower) => (
      <path key={tower.x} d={towerPath(tower)} fill="#07090f" />
    ))}
    {/* a few windows still lit, somebody in Gotham is always awake */}
    {[38, 62, 150, 158, 236, 262, 302, 360].map((x, index) => (
      <rect key={x} x={x} y={60 + (index % 3) * 14} width="3" height="4" fill={SIGNAL_YELLOW} opacity="0.35" />
    ))}
  </svg>
);

const Rain = () =>
  RAIN.map((drop) => (
    <motion.span
      key={drop.left}
      className="absolute top-0 w-px bg-gradient-to-b from-transparent to-white/35"
      style={{ left: `${drop.left}%`, height: `${drop.length}vh`, rotate: 12 }}
      initial={{ y: "-20vh" }}
      animate={{ y: "120vh" }}
      transition={{ duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: "linear" }}
    />
  ));

// two hard white flashes and a bolt, the way an Arkham night lights up before the signal goes on
const Lightning = () => (
  <>
    <motion.div
      className="absolute inset-0 bg-[#dfe8ff]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.8, 0.05, 0.55, 0] }}
      transition={{ duration: 0.7, delay: BEATS.thunder, times: [0, 0.1, 0.3, 0.42, 1] }}
    />
    <motion.svg
      viewBox="0 0 40 100"
      className="absolute top-0 right-[12%] h-[38vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0, 1, 0] }}
      transition={{ duration: 0.6, delay: BEATS.thunder, times: [0, 0.1, 0.3, 0.42, 1] }}
      style={{ filter: "drop-shadow(0 0 8px #cfe0ff)" }}
    >
      <path d="M22 0 L14 34 L24 36 L10 70 L18 72 L6 100" fill="none" stroke="#f4f8ff" strokeWidth="1.6" />
    </motion.svg>
  </>
);

// the searchlight on the GCPD roof
const Lamp = () => (
  <svg viewBox="0 0 40 30" className="absolute bottom-0 left-1/2 w-14 -translate-x-1/2" aria-hidden="true">
    <path d="M12 30 L18 16 M28 30 L22 16" stroke="#2a2f3a" strokeWidth="2.5" />
    <rect x="9" y="4" width="22" height="14" rx="2" fill="#1b1f27" stroke="#3a4150" strokeWidth="1" />
    <ellipse cx="20" cy="4" rx="11" ry="3" fill="#fff6c8" />
  </svg>
);

// the beam swings up from the roof and the emblem blooms on the clouds where it lands
const Signal = ({ isStill }) => (
  <motion.div
    className="absolute bottom-[14vh] left-1/2 h-[56vh] w-[min(92vw,36rem)] -translate-x-1/2"
    style={{ transformOrigin: "50% 100%" }}
    initial={{ rotate: isStill ? 0 : -38, opacity: 0 }}
    animate={{ rotate: 0, opacity: 1 }}
    transition={{ rotate: { duration: 1.1, delay: BEATS.swing, ease: easeOutExpo }, opacity: { duration: 0.3, delay: BEATS.swing } }}
  >
    <div className="absolute inset-0 blur-[6px]">
      <div
        className="absolute inset-0"
        style={{
          clipPath: "polygon(47% 100%, 53% 100%, 84% 0, 16% 0)",
          background: `linear-gradient(to top, ${SIGNAL_YELLOW}99, ${SIGNAL_YELLOW}22)`,
        }}
      />
    </div>
    <Lamp />
  </motion.div>
);

const Emblem = () => (
  <motion.div
    className={`${EMBLEM_SPOT} grid place-items-center`}
    initial={{ opacity: 0, scale: 0.35 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.9, delay: BEATS.lit - 0.6, ease: easeOutExpo }}
  >
    <span
      className="absolute inset-0 rounded-[50%]"
      style={{
        background: `radial-gradient(ellipse closest-side, #fff6c8 0%, ${SIGNAL_YELLOW} 55%, ${SIGNAL_YELLOW}66 80%, transparent 100%)`,
        boxShadow: `0 0 80px ${SIGNAL_YELLOW}55`,
      }}
    />
    <svg viewBox="0 0 100 50" className="relative w-[74%]">
      <path d={BAT_PATH} fill="#0a0a0d" />
    </svg>
  </motion.div>
);

// detective mode: the whole night recolors to x ray blue and a scan line rolls down the screen
const DetectiveWash = ({ isStill }) => (
  <>
    <motion.div
      className="absolute inset-0"
      style={{ background: DETECTIVE_BLUE, mixBlendMode: "color" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.95 }}
      transition={{ duration: 0.35, delay: BEATS.detective }}
    />
    <motion.div
      className="absolute inset-0"
      style={{ background: `repeating-linear-gradient(to bottom, ${DETECTIVE_BLUE}1f 0 1px, transparent 1px 4px)`, mixBlendMode: "screen" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: BEATS.detective }}
    />
    {!isStill && (
      <motion.span
        className="absolute inset-x-0 h-28"
        style={{ background: `linear-gradient(to bottom, transparent, ${DETECTIVE_BLUE}88, transparent)` }}
        initial={{ top: "-15%" }}
        animate={{ top: "115%" }}
        transition={{ duration: 1.1, delay: BEATS.detective, ease: "easeInOut" }}
      />
    )}
  </>
);

// the scanner traces the bat in blue, then the orange lock on box snaps tight around it
const LockOn = ({ isStill }) => (
  <div className={EMBLEM_SPOT}>
    <svg viewBox="0 0 100 50" className="absolute top-1/2 left-1/2 w-[74%] -translate-x-1/2 -translate-y-1/2 overflow-visible">
      <motion.path
        d={BAT_PATH}
        fill="none"
        stroke={DETECTIVE_BLUE}
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: BEATS.detective + 0.1, ease: "easeInOut" }}
        style={{ filter: `drop-shadow(0 0 4px ${DETECTIVE_BLUE})` }}
      />
    </svg>
    <motion.div
      className="absolute inset-[6%]"
      initial={{ scale: isStill ? 1 : 1.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, delay: BEATS.lock, ease: easeOutExpo }}
    >
      {RETICLE_CORNERS.map((corner) => (
        <span key={corner} className={`absolute size-6 ${corner}`} style={{ borderColor: ARKHAM_ORANGE, filter: `drop-shadow(0 0 4px ${ARKHAM_ORANGE})` }} />
      ))}
      <span className="absolute -top-5 left-0 font-mono text-[10px] tracking-[0.3em]" style={{ color: ARKHAM_ORANGE }}>
        TARGET LOCKED
      </span>
    </motion.div>
  </div>
);

const CaseFile = () => (
  <motion.div
    className="absolute inset-x-4 top-[52vh] mx-auto max-w-sm border-l-2 bg-black/60 px-4 py-3 font-mono text-[11px] leading-relaxed tracking-[0.12em] backdrop-blur-sm sm:text-xs"
    style={{ borderColor: ARKHAM_ORANGE }}
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: BEATS.hud - 0.1 }}
  >
    {CASE_FILE.map((line) => (
      <p key={line.label}>
        <span style={{ color: ARKHAM_ORANGE }}>
          <TypedText text={`${line.label}: `} startAt={line.at} perLetter={HUD_TIMING.perLetter} />
        </span>
        <span className="text-[#dbeeff]">
          <TypedText text={line.value} startAt={line.at + (line.label.length + 2) * HUD_TIMING.perLetter} perLetter={HUD_TIMING.perLetter} />
        </span>
      </p>
    ))}
    <motion.p
      className="mt-3 inline-block border-2 px-3 py-1 text-[clamp(1.25rem,6vw,1.75rem)] font-black tracking-[0.2em]"
      style={{ color: ARKHAM_ORANGE, borderColor: ARKHAM_ORANGE, textShadow: `0 0 18px ${ARKHAM_ORANGE}` }}
      initial={{ opacity: 0, scale: 1.6, rotate: -4 }}
      animate={{ opacity: 1, scale: 1, rotate: -4 }}
      transition={{ duration: 0.4, delay: BEATS.closed, ease: easeOutExpo }}
    >
      CASE CLOSED
    </motion.p>
  </motion.div>
);

/**
 * Gotham at night: rain, lightning, the Bat-Signal swinging onto the clouds, then detective mode scans the emblem
 * and the case file types out until the case is closed.
 */
const BatSignal = ({ onDone }) => {
  const isStill = useReducedMotion();
  useMomentLength(BEATS.end * 1000, onDone);

  return (
    <EffectLayer background={`${easedGlow("#1a2233", { strength: 0.9, shape: "ellipse", at: "50% 20%" })}, ${GOTHAM_NIGHT}`}>
      <Clouds />
      {!isStill && <Lightning />}
      <Signal isStill={isStill} />
      <Emblem />
      {!isStill && <Rain />}
      <Skyline />
      <DetectiveWash isStill={isStill} />
      <LockOn isStill={isStill} />
      <div className="absolute inset-x-0 top-[30vh]">
        <Shockwave color={DETECTIVE_BLUE} delay={BEATS.lock} size="min(70vw,24rem)" />
      </div>
      <CaseFile />
    </EffectLayer>
  );
};

export default BatSignal;
