import { motion } from "framer-motion";
import { Bloom, Burst, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { TWIG_HALVES, WILLOW_RED } from "../artwork";
import { easeOutExpo } from "../../../lib/motion";

// the music box plays while the wish is made, the twig cracks on its beat in sound.js, then the warm chord
const PROMPT_AT = 0.2;
const SNAP_AT = 2.8;
const COPY_AT = 3.2;
const MOMENT_MS = 5600;
const CREAM = "#f6e7c8";

// the twig held up in the light, then snapped clean in two, each half falling its own way
const Twig = () => (
  <svg viewBox="0 0 64 64" className="absolute top-[36%] left-1/2 size-[min(56vmin,24rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible">
    {TWIG_HALVES.map((half) => (
      <motion.g
        key={half.side}
        style={{ originX: "32px", originY: "34px" }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: [6, 0, 0, 14], x: [0, 0, 0, half.side * 10], rotate: [0, 0, 0, half.side * 28] }}
        transition={{ duration: SNAP_AT + 0.9, times: [0, 0.15, SNAP_AT / (SNAP_AT + 0.9), 1], ease: easeOutExpo }}
      >
        <path d={half.d} fill="none" stroke="#8a6240" strokeWidth="2.5" strokeLinecap="round" />
        <path d={half.leaf} fill="#7fb36a" />
      </motion.g>
    ))}
    {/* the red thread tied where it will break, gone once it does */}
    <motion.path
      d="M30 31l4 6M34 31l-4 6"
      stroke={WILLOW_RED}
      strokeWidth="1.6"
      strokeLinecap="round"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.1, delay: SNAP_AT }}
    />
  </svg>
);

/** Obsession: make a wish, the One Wish Willow snaps in two, and the wish is granted in a warm light. */
const WishMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={WILLOW_RED} glowAt="50% 36%">
      <motion.p
        className="absolute top-[14%] inset-x-0 text-center text-[clamp(1.5rem,4vw,2.5rem)] font-semibold tracking-tight"
        style={{ color: CREAM }}
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: [0, 1, 1, 0], filter: "blur(0px)" }}
        transition={{ duration: SNAP_AT, times: [0, 0.2, 0.85, 1], delay: PROMPT_AT }}
      >
        Make a wish.
      </motion.p>
      <Twig />
      <Bloom color={CREAM} at={SNAP_AT} className="top-[36%]" />
      <Burst color={CREAM} at={SNAP_AT} count={16} className="top-[36%]" />
      <MomentCopy
        color={WILLOW_RED}
        eyebrow="Obsession"
        title="Wish granted."
        lines={["I wish you find exactly what you came here looking for."]}
        at={COPY_AT}
      />
    </MomentLayer>
  );
};

export default WishMoment;
