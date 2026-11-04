import { motion } from "framer-motion";
import { DrawnPath, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { WATER_BLUE } from "../artwork";
import { easeOutExpo } from "../../../lib/motion";

// the beats in sound.js: taiko under the haori wipe, the shamisen while the breath is drawn, and the slash
const WIPE_AT = 0;
const BREATH_AT = 1.1;
const SLASH_AT = 2.7;
const COPY_AT = 3.2;
const MOMENT_MS = 4800;

const HAORI = "repeating-conic-gradient(#1f7a4d 0 25%, #121212 0 50%) 0 0 / 56px 56px";

// Tanjiro's checkered haori sweeps across the screen in columns, then falls away
const HaoriWipe = () => (
  <div className="absolute inset-0 flex">
    {Array.from({ length: 6 }, (_, column) => (
      <motion.span
        key={column}
        className="h-full flex-1"
        style={{ background: HAORI, backgroundPosition: `${column * -56}px 0` }}
        initial={{ y: "-100%" }}
        animate={{ y: ["-100%", "0%", "0%", "100%"] }}
        transition={{ duration: 1.3, delay: WIPE_AT + column * 0.05, times: [0, 0.35, 0.65, 1], ease: easeOutExpo }}
      />
    ))}
  </div>
);

// the breath drawn as rolling water, the stroke Water Surface Slash leaves in the air
const WATER_LINES = [
  "M-10 50C20 30 40 70 70 50S120 30 150 50 200 70 230 50",
  "M-10 62C25 44 45 80 75 62S125 44 155 62 205 80 235 62",
  "M-10 38C15 22 38 54 65 38S112 22 140 38 192 54 220 38",
];

const Water = () => (
  <svg viewBox="0 0 220 100" preserveAspectRatio="none" className="absolute top-[26%] left-0 h-[22vh] w-full overflow-visible" style={{ filter: `drop-shadow(0 0 8px ${WATER_BLUE})` }}>
    {WATER_LINES.map((d, index) => (
      <DrawnPath key={d} d={d} color={index === 0 ? "#e8f6ff" : WATER_BLUE} at={BREATH_AT + index * 0.2} duration={1.4} width={index === 0 ? 2.2 : 1.2} />
    ))}
  </svg>
);

// the slash: one bright line across the screen, and the two halves of it slipping apart
const Slash = () => (
  <>
    <motion.span
      className="absolute top-[37%] left-0 h-[3px] w-full -rotate-6 bg-white"
      style={{ boxShadow: `0 0 24px 6px ${WATER_BLUE}`, originX: 0 }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: [0, 1, 1, 0.4] }}
      transition={{ duration: 0.35, delay: SLASH_AT, ease: "easeIn" }}
    />
    <motion.span
      className="absolute inset-0 bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.7, 0] }}
      transition={{ duration: 0.5, delay: SLASH_AT + 0.3 }}
    />
  </>
);

/** Demon Slayer: the haori sweeps in, the breath is drawn as water, and one slash cuts the screen in two. */
const WaterBreathingMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={WATER_BLUE} glowAt="50% 36%">
      <HaoriWipe />
      <Water />
      <Slash />
      <MomentCopy
        color={WATER_BLUE}
        eyebrow="Demon Slayer"
        title="Total Concentration."
        lines={["First Form: AWS Certified Developer, Associate.", "Second Form: AWS Certified Cloud Practitioner."]}
        at={COPY_AT}
      />
    </MomentLayer>
  );
};

export default WaterBreathingMoment;
