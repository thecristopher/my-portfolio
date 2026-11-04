import { motion } from "framer-motion";
import { Bloom, MomentLayer, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { UMBRELLA_RED, UMBRELLA_WEDGES } from "../artwork";
import { easeOutExpo } from "../../../lib/motion";

const SAVE_ROOM = "#1f6b5c";
const SAVED = "Your game has been saved.";
const PARTNER_LINE = "Every run is better with the right co-op partner.";
const TYPE_AT = 0.8;
const PER_LETTER = 0.05;
const PARTNER_AT = TYPE_AT + SAVED.length * PER_LETTER + 0.3;
const MOMENT_MS = 4300;

// the logo assembles wedge by wedge, spinning into place, then turns slowly like the sign over the lab
const Logo = () => (
  <motion.svg
    viewBox="0 0 64 64"
    className="absolute top-[34%] left-1/2 size-[min(40vmin,16rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
    initial={{ rotate: -90 }}
    animate={{ rotate: 0 }}
    transition={{ duration: 2.4, ease: easeOutExpo }}
  >
    {UMBRELLA_WEDGES.map((wedge, index) => (
      <motion.path
        key={wedge.d}
        d={wedge.d}
        fill={wedge.fill}
        style={{ originX: "32px", originY: "32px" }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, delay: index * 0.06, ease: easeOutExpo }}
      />
    ))}
  </motion.svg>
);

// the ink ribbon sitting on the typewriter, the one item that lets you save
const InkRibbon = () => (
  <motion.span
    className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wider text-white/70 uppercase"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: TYPE_AT - 0.3, ease: easeOutExpo }}
  >
    <span className="size-2 rounded-full bg-white/70" />
    Ink ribbon used
  </motion.span>
);

/** Resident Evil: the Umbrella logo turns into place over the save room's green, and the typewriter writes the save. */
const SaveRoomMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={SAVE_ROOM} glowAt="50% 34%">
      <Bloom color={UMBRELLA_RED} at={0} size="min(55vmin,26rem)" className="top-[34%]" />
      <Logo />
      <div className="absolute inset-x-0 bottom-[12vh] flex flex-col items-center gap-5 px-6 text-center">
        <p className="text-sm font-semibold tracking-wide" style={{ color: UMBRELLA_RED }}>
          Resident Evil
        </p>
        <InkRibbon />
        <p className="max-w-4xl font-mono text-[clamp(1.6rem,5vw,3.5rem)] leading-tight font-medium tracking-tight">
          <TypedText text={SAVED} at={TYPE_AT} perLetter={PER_LETTER} />
          <motion.span
            className="ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.12em] bg-white"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </p>
        <motion.p
          className="max-w-xl text-lg text-white/70 text-pretty sm:text-xl"
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: PARTNER_AT, ease: easeOutExpo }}
        >
          {PARTNER_LINE}
        </motion.p>
      </div>
    </MomentLayer>
  );
};

export default SaveRoomMoment;
