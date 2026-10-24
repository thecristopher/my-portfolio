import { motion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import PixelArt from "../../PixelArt";
import { easedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import { TwigHalf } from "./pieces";
import { BOX_CREAM, BOX_RED, BOX_RED_DARK, BOY_ROWS, FACE_PALETTE, GIRL_ROWS, TWIG_HALVES } from "./willow";

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
const SETTLED_MS = Math.round((GRANTED_AT + 0.8) * 1000);

// the red print on the box: a band across the top right corner and a swoop along the bottom left
const TOP_BAND = "polygon(52% 0, 100% 0, 100% 46%, 86% 40%, 70% 30%)";
const BOTTOM_BAND = "polygon(0 70%, 18% 82%, 40% 90%, 62% 100%, 0 100%)";
const END_CAP = "polygon(0 0, 100% 50%, 0 100%)";

/** The box art from the movie, flat on and in a 16 bit palette: cream card, red print, the two smiling faces. */
const RetroBox = () => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: BOX_AT, ease: pixelSteps(5) }}
    className="relative aspect-[3/1] w-[min(90vw,30rem)] border-4 font-pixel shadow-[8px_8px_0_rgb(0_0_0/0.45)]"
    style={{ background: BOX_CREAM, borderColor: BOX_RED_DARK }}
  >
    <span className="absolute inset-0" style={{ background: BOX_RED, clipPath: TOP_BAND }} />
    <span className="absolute inset-0" style={{ background: BOX_RED, clipPath: BOTTOM_BAND }} />
    {/* the end of the prism peeking out on the left, like the photo of the box on the counter */}
    <span className="absolute inset-y-0 left-0 w-[9%]" style={{ background: BOX_RED, clipPath: END_CAP }} />
    <p className="absolute top-[7%] right-[4%] w-[30%] text-center text-[clamp(0.45rem,1.8vw,0.7rem)] leading-tight font-bold tracking-wide uppercase" style={{ color: BOX_CREAM }}>
      Amaze your friends!
    </p>
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
      <p className="text-[clamp(1.2rem,5.4vw,2.1rem)] leading-none font-bold tracking-wider uppercase" style={{ color: BOX_RED, textShadow: `2px 2px 0 ${BOX_RED_DARK}55` }}>
        One Wish Willow
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[clamp(0.5rem,1.8vw,0.7rem)] font-bold uppercase" style={{ color: BOX_RED }}>
          Crack!
        </span>
        <PixelArt rows={BOY_ROWS} palette={FACE_PALETTE} className="size-[clamp(1.1rem,4.4vw,1.7rem)]" />
        <PixelArt rows={GIRL_ROWS} palette={FACE_PALETTE} className="size-[clamp(1.1rem,4.4vw,1.7rem)]" />
      </div>
    </div>
    <p
      className="absolute right-[3%] bottom-[9%] border-2 px-1.5 py-0.5 text-center text-[clamp(0.4rem,1.5vw,0.6rem)] leading-tight font-bold uppercase"
      style={{ color: BOX_CREAM, background: BOX_RED, borderColor: BOX_CREAM }}
    >
      You only get
      <br />
      one wish
    </p>
  </motion.div>
);

/** The willow out of the box: it glows, trembles, then breaks clean in two. */
const SnappingTwig = () => (
  <motion.div
    className="flex w-[min(70vw,22rem)] items-center"
    initial={{ opacity: 0, filter: "drop-shadow(0 0 0px transparent)" }}
    animate={{ opacity: 1, filter: ["drop-shadow(0 0 0px transparent)", `drop-shadow(0 0 10px ${BOX_CREAM})`, `drop-shadow(0 0 4px ${BOX_CREAM})`] }}
    transition={{ opacity: { duration: 0.3, delay: BOX_AT + 0.3 }, filter: { duration: 1.2, delay: GLOW_AT, times: [0, 0.4, 1], ease: pixelSteps(4) } }}
  >
    {TWIG_HALVES.map((half) => (
      <motion.div
        key={half.side}
        style={{ flexGrow: half.rows[0].length }}
        initial={{ x: 0, y: 0 }}
        animate={{ x: [0, -half.side * 3, half.side * 3, 0, half.side * 28], y: [0, 0, 0, 0, 14] }}
        transition={{ duration: 0.9, delay: SNAP_AT - 0.5, times: [0, 0.2, 0.4, 0.55, 1], ease: pixelSteps(9) }}
      >
        <TwigHalf half={half} className="block w-full" />
      </motion.div>
    ))}
  </motion.div>
);

/** One Wish Willow: the box comes off the shelf, a wish gets made, the twig snaps and the wish is granted. */
const OneWish = ({ onDone }) => {
  useMomentLength(SETTLED_MS, onDone);
  return (
    // a dim warm room so the box art and the words own the screen, the page never reads through
    <EffectLayer
      background={`${easedGlow(BOX_CREAM, { strength: 0.16, shape: "ellipse", reach: 75 })}, #1c100c`}
      className="flex flex-col items-center justify-center gap-6 px-4 pt-20 pb-24 sm:gap-8 sm:pt-0 sm:pb-20"
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: BOX_CREAM }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.35, 0] }}
        transition={{ duration: 0.35, delay: SNAP_AT, times: [0, 0.2, 1], ease: pixelSteps(3) }}
      />
      <RetroBox />
      <div className="relative grid place-items-center">
        <Shockwave color={BOX_CREAM} delay={SNAP_AT} size="min(60vw,18rem)" />
        <Sparks colors={[BOX_RED, BOX_CREAM]} count={14} reach={30} delay={SNAP_AT} />
        <SnappingTwig />
      </div>
      <p className="font-pixel text-sm tracking-wider" style={{ color: BOX_CREAM }}>
        <TypedText text={PROMPT} startAt={PROMPT_AT} perLetter={0.06} />
      </p>
      <p className="max-w-md text-center font-pixel text-[clamp(1.05rem,4vw,1.5rem)] leading-snug text-balance text-white">
        <TypedText text={WISH} startAt={WISH_AT} perLetter={PER_LETTER} />
      </p>
      <motion.p
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: GRANTED_AT, ease: pixelSteps(4) }}
        className="border-4 px-4 py-1.5 font-pixel text-[clamp(1.2rem,5vw,1.9rem)] font-bold tracking-[0.18em] uppercase shadow-[6px_6px_0_rgb(0_0_0/0.45)]"
        style={{ color: BOX_CREAM, background: BOX_RED, borderColor: BOX_CREAM }}
      >
        Wish granted ♡
      </motion.p>
    </EffectLayer>
  );
};

export default OneWish;
