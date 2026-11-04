import { motion } from "framer-motion";
import { Bloom, Burst, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { POKE_RED } from "../artwork";
import { easeOutExpo } from "../../../lib/motion";

// each beat lines up with sound.js: the encounter sting, the throw, three wobbles, the lock and the caught jingle
const FLASHES_AT = 0;
const THROW_AT = 1.2;
const OPEN_AT = 1.9;
const WOBBLES = [2.8, 3.3, 3.9];
const LOCK_AT = 4.3;
const COPY_AT = 4.6;
const MOMENT_MS = 6000;

// the encounter: the screen flashes white three times before the battle starts
const EncounterFlash = () => (
  <motion.span
    className="absolute inset-0 bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 0.9, 0, 0.9, 0, 0.9, 0] }}
    transition={{ duration: 0.9, delay: FLASHES_AT, ease: "linear" }}
  />
);

// the ball as two halves, so the top can swing open on the catch
const Ball = () => (
  <motion.div
    className="absolute top-[36%] left-1/2 size-[min(30vmin,12rem)] -translate-x-1/2 -translate-y-1/2"
    initial={{ x: "-60vw", y: "40vh", rotate: -540, scale: 0.4 }}
    animate={{ x: 0, y: 0, rotate: [-540, 0, 0, -18, 18, -14, 14, -8, 0], scale: 1 }}
    transition={{
      x: { duration: 0.7, delay: THROW_AT, ease: easeOutExpo },
      y: { duration: 0.7, delay: THROW_AT, ease: [0.3, 1.6, 0.6, 1] },
      scale: { duration: 0.7, delay: THROW_AT, ease: easeOutExpo },
      rotate: { duration: 3.1, delay: THROW_AT, times: [0, 0.22, 0.48, 0.52, 0.58, 0.67, 0.73, 0.86, 1], ease: "easeInOut" },
    }}
  >
    <svg viewBox="0 0 64 64" className="size-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
      <motion.g
        style={{ transformOrigin: "6px 32px" }}
        initial={{ rotate: 0 }}
        animate={{ rotate: [0, -50, -50, 0] }}
        transition={{ duration: 0.8, delay: OPEN_AT, times: [0, 0.25, 0.7, 1], ease: easeOutExpo }}
      >
        <path d="M6 32a26 26 0 0 1 52 0Z" fill={POKE_RED} stroke="#1a1a1a" strokeWidth="3" />
      </motion.g>
      <path d="M6 32a26 26 0 0 0 52 0Z" fill="#f4f4f4" stroke="#1a1a1a" strokeWidth="3" />
      <path d="M6 32h52" stroke="#1a1a1a" strokeWidth="3.5" />
      <motion.circle
        cx="32"
        cy="32"
        r="8"
        stroke="#1a1a1a"
        strokeWidth="3"
        initial={{ fill: "#f4f4f4" }}
        animate={{ fill: ["#f4f4f4", "#ff6b6b", "#f4f4f4", "#ff6b6b", "#f4f4f4", "#ff6b6b", "#f4f4f4"] }}
        transition={{ duration: 1.6, delay: WOBBLES[0], ease: "linear" }}
      />
    </svg>
  </motion.div>
);

// the light the ball pulls the catch in with, a beam that collapses into the button
const CaptureBeam = () => (
  <motion.span
    className="absolute top-[36%] left-1/2 h-[60vh] w-[30vmin] -translate-x-1/2 -translate-y-full rounded-full blur-2xl"
    style={{ background: `linear-gradient(to top, #ffffff, ${POKE_RED}00)` }}
    initial={{ opacity: 0, scaleY: 0 }}
    animate={{ opacity: [0, 1, 0], scaleY: [0, 1, 0] }}
    transition={{ duration: 0.8, delay: OPEN_AT, ease: easeOutExpo }}
  />
);

// the three little stars that pop out once it clicks shut
const CaughtStars = () =>
  [-1, 0, 1].map((side) => (
    <motion.span
      key={side}
      className="absolute top-[36%] left-1/2 text-3xl text-[#ffe066]"
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{ x: `${side * 9}vmin`, y: ["0vmin", "-16vmin", "-12vmin"], opacity: [0, 1, 0], scale: [0, 1.3, 0.8] }}
      transition={{ duration: 1.2, delay: LOCK_AT, ease: easeOutExpo }}
    >
      ★
    </motion.span>
  ));

/** Pokémon: the encounter flashes, the ball is thrown and opens, wobbles three times and clicks shut. */
const CatchMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={POKE_RED} glowAt="50% 36%">
      <EncounterFlash />
      <CaptureBeam />
      <Bloom color="#ffffff" at={OPEN_AT} size="min(50vmin,24rem)" className="top-[36%]" />
      <Bloom color={POKE_RED} at={LOCK_AT} className="top-[36%]" />
      <Ball />
      <Burst color="#ffe066" at={LOCK_AT} count={12} className="top-[36%]" />
      <CaughtStars />
      <MomentCopy
        color={POKE_RED}
        eyebrow="Pokémon"
        title="Gotcha! Cristopher was caught."
        lines={["Every title on the timeline was an evolution.", "Known moves: TypeScript, AWS Bedrock, Code Review, 1:1s."]}
        at={COPY_AT}
      />
    </MomentLayer>
  );
};

export default CatchMoment;
