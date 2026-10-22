import { motion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import { TwigHalf } from "./pieces";
import { BOX_ORANGE, BOX_PINK, BOX_VIOLET, SNAP_POINT, TWIG_HALVES, WILLOW_GREEN } from "./willow";

// every beat lines up with sound.js: the twinkle while the wish is made, the crack, then the chord
const BOX_AT = 0.1;
const PROMPT_AT = 0.9;
const GLOW_AT = 2.1;
const SNAP_AT = 2.7;
const WISH_AT = 3.3;
const PER_LETTER = 0.035;
const PROMPT = "Make a wish.";
const WISH = "I wish you find exactly what you came here looking for.";
const GRANTED_AT = WISH_AT + WISH.length * PER_LETTER + 0.3;
const CREDIT_AT = GRANTED_AT + 0.7;
const SETTLED_MS = Math.round((CREDIT_AT + 0.8) * 1000);

const CHROME_TEXT = {
  background: `linear-gradient(180deg, #fff6fb 0%, ${BOX_ORANGE} 55%, ${BOX_PINK} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  filter: `drop-shadow(0 2px 0 ${BOX_VIOLET})`,
};

/** The willow through the cellophane window: it glows, trembles, then breaks clean in two. */
const SnappingTwig = () => (
  <motion.svg
    viewBox="0 0 40 16"
    className="w-full overflow-visible"
    initial={{ filter: "drop-shadow(0 0 0px transparent)" }}
    animate={{ filter: ["drop-shadow(0 0 0px transparent)", `drop-shadow(0 0 6px ${WILLOW_GREEN})`, `drop-shadow(0 0 2px ${WILLOW_GREEN})`] }}
    transition={{ duration: 1.2, delay: GLOW_AT, times: [0, 0.4, 1] }}
  >
    {TWIG_HALVES.map((half) => (
      <motion.g
        key={half.side}
        initial={{ rotate: 0, x: 0, y: 0 }}
        animate={{ rotate: [0, -half.side * 2, half.side * 2, 0, half.side * 26], x: [0, 0, 0, 0, half.side * 4], y: [0, 0, 0, 0, 2] }}
        transition={{ duration: 0.9, delay: SNAP_AT - 0.5, times: [0, 0.2, 0.4, 0.55, 1], ease: "easeOut" }}
        style={{ transformOrigin: `${SNAP_POINT.x}px ${SNAP_POINT.y}px` }}
      >
        <TwigHalf half={half} />
      </motion.g>
    ))}
  </motion.svg>
);

/** The retro box it came in, the kind a crystal shop kept behind the counter in 1986. */
const RetroBox = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, rotate: -6, y: 30 }}
    animate={{ opacity: 1, scale: 1, rotate: -2, y: 0 }}
    transition={{ duration: 0.9, delay: BOX_AT, ease: easeOutExpo }}
    className="relative w-[min(82vw,21rem)] rounded-2xl p-[3px]"
    style={{ background: `linear-gradient(135deg, ${BOX_PINK}, ${BOX_ORANGE} 50%, ${BOX_VIOLET})`, boxShadow: `0 30px 80px -20px ${BOX_PINK}88` }}
  >
    <div className="flex flex-col items-center gap-3 overflow-hidden rounded-[0.85rem] bg-[#1a0f24] px-5 pt-4 pb-3 text-center">
      {/* sunset stripes across the top, the way every box on that shelf had them */}
      <div className="flex w-full flex-col gap-[3px]" aria-hidden="true">
        {[BOX_PINK, BOX_ORANGE, BOX_VIOLET].map((color) => (
          <span key={color} className="h-[3px] w-full rounded-full" style={{ background: color }} />
        ))}
      </div>
      <p className="font-display text-[clamp(1.5rem,7vw,2.1rem)] leading-none font-black tracking-wide italic" style={CHROME_TEXT}>
        ONE WISH WILLOW
      </p>
      <p className="font-mono text-[10px] tracking-[0.3em] text-[#ffd9ea]/80 uppercase">Make one wish · snap it in half</p>
      <div className="relative w-full rounded-lg border border-white/15 bg-white/[0.06] px-6 py-5 shadow-[inset_0_0_24px_rgb(255_255_255/0.08)]">
        <SnappingTwig />
      </div>
      <p className="font-mono text-[9px] tracking-widest text-white/40 uppercase">100% magical · 0% real</p>
    </div>
  </motion.div>
);

/** One Wish Willow: the box comes off the shelf, a wish gets made, the twig snaps and the wish is granted. */
const OneWish = ({ onDone }) => {
  useMomentLength(SETTLED_MS, onDone);
  return (
    // a near black room so the box art and the words own the screen, the page never reads through
    <EffectLayer
      background={`${easedGlow(BOX_VIOLET, { strength: 0.22, shape: "ellipse", reach: 75 })}, #0b0614`}
      className="flex flex-col items-center justify-center gap-6 px-4 pt-20 pb-24 sm:gap-7 sm:pt-0 sm:pb-20"
    >
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 0.35, delay: SNAP_AT, times: [0, 0.2, 1] }}
      />
      <div className="relative grid place-items-center">
        <Shockwave color={WILLOW_GREEN} delay={SNAP_AT} size="min(70vw,22rem)" />
        <Sparks colors={[WILLOW_GREEN, BOX_PINK, "#fff6fb"]} count={14} reach={34} delay={SNAP_AT} />
        <RetroBox />
      </div>
      <p className="font-mono text-sm tracking-wider text-[#ffd9ea]">
        <TypedText text={PROMPT} startAt={PROMPT_AT} perLetter={0.06} />
      </p>
      <p className="max-w-md text-center font-display text-[clamp(1.05rem,4vw,1.5rem)] leading-snug text-balance text-white italic">
        <TypedText text={WISH} startAt={WISH_AT} perLetter={PER_LETTER} />
      </p>
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: GRANTED_AT, ease: easeOutExpo }}
        className="font-display text-[clamp(1.3rem,5vw,2rem)] font-semibold tracking-[0.2em] uppercase"
        style={{ color: WILLOW_GREEN, textShadow: `0 0 24px ${WILLOW_GREEN}aa` }}
      >
        Wish granted ♡
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: CREDIT_AT }}
        className="font-mono text-[11px] tracking-widest text-white/45 uppercase"
      >
        Obsession (2026) · Inde Navarrette as Nikki
      </motion.p>
    </EffectLayer>
  );
};

export default OneWish;
