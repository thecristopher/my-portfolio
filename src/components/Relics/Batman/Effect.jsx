import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { bandedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import PixelArt from "../../PixelArt";
import {
  ARKHAM_ORANGE,
  BEATS,
  DETECTIVE_BLUE,
  GOTHAM_NIGHT,
  HUD_LINES,
  HUD_TIMING,
  LIT_WINDOWS,
  SIGNAL_YELLOW,
  SKYLINE,
  ovalRows,
  rainStreaks,
  scheduleLines,
  skylineRows,
  spriteAspect,
  stampCentered,
} from "./helpers";
import { BAT_ROWS, BOLT_ROWS, CLOUD_ROWS, GCPD_ROWS, LAMP_ROWS, RETICLE_ROWS, SIGNAL_PALETTE } from "./sprites";

const RAIN = rainStreaks(44);
const CASE_FILE = scheduleLines(HUD_LINES, HUD_TIMING);
const SIGNAL_ROWS = stampCentered(ovalRows(48, 28), BAT_ROWS);
const GOTHAM_ROWS = skylineRows(SKYLINE, { scale: 2, windows: LIT_WINDOWS });

// detective mode only sees the bat, so the scan paints it alone in x ray blue
const SCAN_PALETTE = { B: DETECTIVE_BLUE };
const CLOUD_PALETTE = { l: "#3a4458", C: "#2a3140", d: "#1c212c" };
const SKYLINE_PALETTE = { B: "#07090f", b: "#1a2233", w: `${SIGNAL_YELLOW}66` };
const BOLT_PALETTE = { K: "#7fa6ff", W: "#f4f8ff" };
const LAMP_PALETTE = { K: "#0b1622", y: "#fff6c8", M: "#3a4150", m: "#1b1f27" };
const RETICLE_PALETTE = { K: "#0b1622", O: ARKHAM_ORANGE };

// the spot where the signal lands on the clouds. the beam and the scanner overlay both sit on it, so they share the box
const EMBLEM_SPOT = "absolute left-1/2 top-[30vh] aspect-[48/28] w-[min(86vw,30rem,60vh)] -translate-x-1/2 -translate-y-1/2";

// heavy clouds low over the city: where they sit, how big, and how dark
const CLOUDS = [
  { left: "-10%", top: "6vh", width: "70vw", opacity: 0.8 },
  { left: "40%", top: "2vh", width: "80vw", opacity: 0.7 },
  { left: "10%", top: "20vh", width: "90vw", opacity: 0.6 },
  { left: "55%", top: "26vh", width: "60vw", opacity: 0.55 },
];

// the corners flip the one top left sprite, so all four share the exact same pixels
const RETICLE_CORNERS = [
  { place: "top-0 left-0", flip: "none" },
  { place: "top-0 right-0", flip: "scaleX(-1)" },
  { place: "bottom-0 left-0", flip: "scaleY(-1)" },
  { place: "bottom-0 right-0", flip: "scale(-1, -1)" },
];

const Clouds = () =>
  CLOUDS.map((cloud) => (
    <motion.span
      key={cloud.left}
      className="absolute"
      style={{ left: cloud.left, top: cloud.top, width: cloud.width, opacity: cloud.opacity }}
      animate={{ x: ["0vw", "4vw"] }}
      transition={{ duration: BEATS.end, ease: pixelSteps(12) }}
    >
      <PixelArt rows={CLOUD_ROWS} palette={CLOUD_PALETTE} className="block w-full" style={{ aspectRatio: spriteAspect(CLOUD_ROWS) }} />
    </motion.span>
  ));

// cropped from the top like the old slice: as wide as the screen, or wider when the screen is tall
const Skyline = () => (
  <div className="absolute inset-x-0 bottom-0 h-[24vh] overflow-hidden">
    <PixelArt
      rows={GOTHAM_ROWS}
      palette={SKYLINE_PALETTE}
      className="absolute bottom-0 left-1/2 -translate-x-1/2"
      style={{ width: "max(100%, 24vh * 10 / 3)", aspectRatio: spriteAspect(GOTHAM_ROWS) }}
    />
  </div>
);

// flat streaks that fall in a few frames each, the way rain ticks down in a 16 bit night stage
const Rain = () =>
  RAIN.map((drop) => (
    <motion.span
      key={drop.left}
      className="absolute top-0 w-[3px] bg-white/30"
      style={{ left: `${drop.left}%`, height: `${drop.length}vh` }}
      initial={{ y: "-20vh" }}
      animate={{ y: "120vh" }}
      transition={{ duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: pixelSteps(8) }}
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
    <motion.span
      className="absolute top-0 right-[12%] h-[38vh]"
      style={{ aspectRatio: spriteAspect(BOLT_ROWS) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0, 1, 0] }}
      transition={{ duration: 0.6, delay: BEATS.thunder, times: [0, 0.1, 0.3, 0.42, 1] }}
    >
      <PixelArt rows={BOLT_ROWS} palette={BOLT_PALETTE} className="block size-full" />
    </motion.span>
  </>
);

// the GCPD tower stands in the gap in the skyline, and the beam starts at the lens of the searchlight on its roof
const TOWER_HEIGHT = "18vh";
const BEAM_FROM = `calc(${TOWER_HEIGHT} + 40px)`;

// the searchlight on the GCPD roof. it stays put while the beam swings, so its pixels never tilt
const Rooftop = () => (
  <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2 flex-col items-center">
    <PixelArt rows={LAMP_ROWS} palette={LAMP_PALETTE} className="-mb-px w-14" style={{ aspectRatio: spriteAspect(LAMP_ROWS) }} />
    <PixelArt rows={GCPD_ROWS} palette={SKYLINE_PALETTE} className="w-auto" style={{ height: TOWER_HEIGHT, aspectRatio: spriteAspect(GCPD_ROWS) }} />
  </div>
);

// the beam swings up from the roof in a few chunky frames, three flat bands of light instead of a blurred glow
const Beam = ({ isStill }) => (
  <motion.div
    className="absolute left-1/2 h-[56vh] w-[min(92vw,36rem)] -translate-x-1/2"
    style={{ bottom: BEAM_FROM, transformOrigin: "50% 100%" }}
    initial={{ rotate: isStill ? 0 : -38, opacity: 0 }}
    animate={{ rotate: 0, opacity: 1 }}
    transition={{ rotate: { duration: 1.1, delay: BEATS.swing, ease: pixelSteps(8) }, opacity: { duration: 0.3, delay: BEATS.swing, ease: pixelSteps(3) } }}
  >
    <div
      className="absolute inset-0"
      style={{
        clipPath: "polygon(47% 100%, 53% 100%, 84% 0, 16% 0)",
        background: `linear-gradient(to top, ${SIGNAL_YELLOW}99 0 30%, ${SIGNAL_YELLOW}5c 30% 65%, ${SIGNAL_YELLOW}2b 65% 100%)`,
      }}
    />
  </motion.div>
);

const Emblem = () => (
  <motion.div
    className={EMBLEM_SPOT}
    initial={{ opacity: 0, scale: 0.35 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.9, delay: BEATS.lit - 0.6, ease: pixelSteps(6) }}
  >
    <span className="absolute -inset-[18%]" style={{ background: bandedGlow(SIGNAL_YELLOW, { strength: 0.35, bands: 4 }) }} />
    <PixelArt rows={SIGNAL_ROWS} palette={SIGNAL_PALETTE} className="relative block size-full" />
  </motion.div>
);

// detective mode: the whole night recolors to x ray blue and a scan band ticks down the screen
const DetectiveWash = ({ isStill }) => (
  <>
    <motion.div
      className="absolute inset-0"
      style={{ background: DETECTIVE_BLUE, mixBlendMode: "color" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.95 }}
      transition={{ duration: 0.35, delay: BEATS.detective, ease: pixelSteps(3) }}
    />
    <motion.div
      className="absolute inset-0"
      style={{ background: `repeating-linear-gradient(to bottom, ${DETECTIVE_BLUE}1f 0 2px, transparent 2px 6px)`, mixBlendMode: "screen" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: BEATS.detective, ease: pixelSteps(3) }}
    />
    {!isStill && (
      <motion.span
        className="absolute inset-x-0 h-28"
        style={{
          background: `linear-gradient(to bottom, transparent 0 25%, ${DETECTIVE_BLUE}44 25% 40%, ${DETECTIVE_BLUE}88 40% 60%, ${DETECTIVE_BLUE}44 60% 75%, transparent 75%)`,
        }}
        initial={{ top: "-15%" }}
        animate={{ top: "115%" }}
        transition={{ duration: 1.1, delay: BEATS.detective, ease: pixelSteps(10) }}
      />
    )}
  </>
);

// the scanner paints the bat blue from the top down, then the orange lock on box snaps tight around it
const LockOn = ({ isStill }) => (
  <div className={EMBLEM_SPOT}>
    <motion.div
      className="absolute inset-0"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      transition={{ duration: 0.7, delay: BEATS.detective + 0.1, ease: pixelSteps(7) }}
    >
      <PixelArt rows={SIGNAL_ROWS} palette={SCAN_PALETTE} className="block size-full" />
    </motion.div>
    <motion.div
      className="absolute inset-[6%]"
      initial={{ scale: isStill ? 1 : 1.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, delay: BEATS.lock, ease: pixelSteps(4) }}
    >
      {RETICLE_CORNERS.map(({ place, flip }) => (
        <PixelArt key={place} rows={RETICLE_ROWS} palette={RETICLE_PALETTE} className={`absolute size-7 ${place}`} style={{ transform: flip }} />
      ))}
      <span className="absolute -top-6 left-0 font-pixel text-xs tracking-[0.3em]" style={{ color: ARKHAM_ORANGE, textShadow: "2px 2px 0 #0b1622" }}>
        TARGET LOCKED
      </span>
    </motion.div>
  </div>
);

const CaseFile = () => (
  <motion.div
    className="absolute inset-x-4 top-[48vh] mx-auto max-w-sm border-2 bg-black/85 px-4 py-3 font-pixel text-xs leading-relaxed tracking-[0.08em] sm:text-sm"
    style={{ borderColor: ARKHAM_ORANGE, boxShadow: "0 0 0 2px #0b1622, 4px 4px 0 2px #0b1622" }}
    initial={{ opacity: 0, x: -12 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: BEATS.hud - 0.1, ease: pixelSteps(3) }}
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
      className="mt-3 inline-block border-[3px] px-3 py-1 text-[clamp(1.25rem,6vw,1.75rem)] font-bold tracking-[0.2em]"
      style={{ color: ARKHAM_ORANGE, borderColor: ARKHAM_ORANGE, textShadow: "3px 3px 0 #3a1a00" }}
      initial={{ opacity: 0, scale: 1.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: BEATS.closed, ease: pixelSteps(4) }}
    >
      CASE CLOSED
    </motion.p>
  </motion.div>
);

/**
 * Gotham at night in 16 bit: rain, lightning, the Bat-Signal swinging onto the clouds, then detective mode scans the
 * emblem and the case file types out until the case is closed.
 */
const BatSignal = ({ onDone }) => {
  const isStill = useReducedMotion();
  useMomentLength(BEATS.end * 1000, onDone);

  return (
    <EffectLayer background={GOTHAM_NIGHT}>
      <span
        className="absolute top-[20vh] left-1/2 size-[160vmax] -translate-x-1/2 -translate-y-1/2"
        style={{ background: bandedGlow("#1a2233", { strength: 0.9, bands: 5 }) }}
      />
      <Clouds />
      {!isStill && <Lightning />}
      <Beam isStill={isStill} />
      <Emblem />
      {!isStill && <Rain />}
      <Skyline />
      <Rooftop />
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
