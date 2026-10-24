import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer } from "../shared";
import { useMomentLength } from "../moment";
import { pixelSteps } from "../../../lib/motion";
import WaterSurfaceSlash from "./Wave";
import { SUMI_INK, SUN_RED, brushDelays, googleFontHref, ichimatsu } from "./helpers";

// the beats, in seconds, lined up with the shamisen and the drum in sound.js
const WASHI_AT = 0.42;
const SLASH_AT = 2.7;
const SUBTITLE_AT = 3.25;
const CERTS_AT = SUBTITLE_AT + 0.8;
// settled once the cert line has faded in, the wave and both lines then hold until the visitor moves on
const SETTLED_MS = 4600;

// where the blade crosses the screen, as a percent of its height. the calligraphy splits along this line
const CUT_AT = 48;

// written top to bottom, right to left, the way the anime names each form
const COLUMNS = [
  { text: "全集中", size: "min(9vh,15vw,5.5rem)" },
  { text: "水の呼吸", size: "min(7vh,12vw,4.2rem)" },
  { text: "壱ノ型 水面斬り", size: "min(5.2vh,9.5vw,3.3rem)" },
];
const DELAYS = brushDelays(
  COLUMNS.map(({ text }) => text),
  { startAt: 1.05 }
);
const SEAL_AT = DELAYS.at(-1).at(-1) + 0.2;

// a pixel font with kanji, loaded with only the glyphs the calligraphy uses so it costs a few kilobytes.
// Mincho stays behind it for the instant before it lands
const DOT_GOTHIC = googleFontHref("DotGothic16", [...COLUMNS.map(({ text }) => text), "炭"].join(""));
const KANJI_FONT = '"DotGothic16", "Hiragino Mincho ProN", "Yu Mincho", "YuMincho", "Noto Serif JP", serif';

// warm washi, 16 bit style: two paper tones dithered in a checker and the edges browned in flat bands of age
const WASHI = "repeating-conic-gradient(#efe6d0 0 25%, #e9dfc6 0 50%) 0 0 / 4px 4px";
const WASHI_EDGES = "inset 0 0 0 10px #d6c49c, inset 0 0 0 20px #e0d0ac, inset 0 0 0 30px #e8dbbd";

// the outline anime subtitles wear so they read over paper and water alike, hard edged like a 16 bit font outline
const SUBTITLE_OUTLINE = "2px 0 0 #000, -2px 0 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000";

// Tanjiro's haori sweeps across the screen and pulls away, leaving the paper behind it
const CheckerWipe = ({ isReduced }) => (
  <motion.div
    className="absolute inset-0"
    style={{ background: ichimatsu({ size: "clamp(3rem,12vw,6rem)" }) }}
    initial={isReduced ? { opacity: 0 } : { x: "-100%" }}
    animate={isReduced ? { opacity: [0, 1, 1, 0] } : { x: ["-100%", "0%", "0%", "100%"] }}
    transition={{ duration: 1, times: [0, 0.4, 0.55, 1], ease: pixelSteps(4) }}
  />
);

// each glyph is uncovered top to bottom, the way a brush drags down the paper
const Glyph = ({ glyph, delay }) =>
  glyph === " " ? (
    <span className="block h-[0.45em]" />
  ) : (
    <motion.span
      className="block leading-[1.05]"
      initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.5 }}
      animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
      transition={{ duration: 0.22, delay, ease: pixelSteps(4) }}
    >
      {glyph}
    </motion.span>
  );

// the three columns and Tanjiro's seal stamped at the end
const Calligraphy = () => (
  <div
    className="absolute inset-x-4 top-[6.5rem] flex lg:top-[5vh] flex-row-reverse items-start justify-center gap-[clamp(0.75rem,5vw,2.75rem)]"
    style={{ fontFamily: KANJI_FONT, color: SUMI_INK }}
  >
    {COLUMNS.map(({ text, size }, column) => (
      <p key={text} className="flex flex-col items-center" style={{ fontSize: size }}>
        {[...text].map((glyph, index) => (
          <Glyph key={`${glyph}${index}`} glyph={glyph} delay={DELAYS[column][index]} />
        ))}
      </p>
    ))}
    <motion.span
      className="mt-[1vh] grid size-[clamp(1.75rem,7vw,2.5rem)] shrink-0 place-items-center self-end text-[clamp(1rem,4.5vw,1.6rem)] text-[#f7efe0]"
      style={{ background: SUN_RED, fontFamily: KANJI_FONT, boxShadow: `inset 0 0 0 3px #a3231d, 3px 3px 0 ${SUMI_INK}` }}
      initial={{ opacity: 0, scale: 1.6 }}
      animate={{ opacity: 0.92, scale: 1 }}
      transition={{ duration: 0.25, delay: SEAL_AT, ease: pixelSteps(3) }}
    >
      炭
    </motion.span>
  </div>
);

// the same page twice, cut along the blade. the halves slip apart the instant the slash passes
const CutPage = ({ isReduced }) =>
  [
    // the halves only slide, a tilt would knock the pixel font off its grid
    { clip: `inset(0 0 ${100 - CUT_AT}% 0)`, slip: { x: -12, y: -4 } },
    { clip: `inset(${CUT_AT}% 0 0 0)`, slip: { x: 12, y: 4 } },
  ].map(({ clip, slip }) => (
    <motion.div
      key={clip}
      className="absolute inset-0"
      style={{ clipPath: clip }}
      initial={{ x: 0, y: 0 }}
      animate={isReduced ? undefined : slip}
      transition={{ duration: 0.3, delay: SLASH_AT + 0.08, ease: pixelSteps(3) }}
    >
      <Calligraphy />
    </motion.div>
  ));

// the English line the subtitles give it, and the two forms Cristopher actually earned. it sits above the continue button
const Subtitle = () => (
  <div className="absolute inset-x-4 bottom-[6.5rem] flex flex-col items-center gap-3 text-center">
    <motion.p
      className="max-w-2xl font-pixel text-[clamp(1rem,4.4vw,1.6rem)] leading-snug font-semibold text-white"
      style={{ textShadow: SUBTITLE_OUTLINE }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: SUBTITLE_AT, ease: pixelSteps(3) }}
    >
      Total Concentration. Water Breathing, First Form: Water Surface Slash.
    </motion.p>
    <motion.p
      className="flex max-w-2xl flex-col gap-1 font-pixel text-[clamp(0.75rem,3.2vw,0.95rem)] leading-snug text-balance"
      style={{ color: SUMI_INK }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.9 }}
      transition={{ duration: 0.4, delay: CERTS_AT, ease: pixelSteps(4) }}
    >
      <span>First Form: AWS Certified Developer – Associate.</span>
      <span>Second Form: AWS Certified Cloud Practitioner.</span>
    </motion.p>
  </div>
);

/** Total Concentration: the haori wipes in, the form is painted in ink, and a Hokusai wave cuts the page in two. */
const WaterBreathing = ({ onDone }) => {
  const isReduced = useReducedMotion();
  useMomentLength(SETTLED_MS, onDone);

  return (
    <EffectLayer>
      <link rel="stylesheet" href={DOT_GOTHIC} />
      <motion.div
        className="absolute inset-0"
        style={{ background: WASHI, boxShadow: WASHI_EDGES }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.01, delay: WASHI_AT }}
      />
      <CutPage isReduced={isReduced} />
      <WaterSurfaceSlash startAt={SLASH_AT} cutAt={CUT_AT} isReduced={isReduced} />
      <Subtitle />
      <CheckerWipe isReduced={isReduced} />
    </EffectLayer>
  );
};

export default WaterBreathing;
