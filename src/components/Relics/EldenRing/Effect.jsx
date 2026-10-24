import { motion } from "framer-motion";
import { EffectLayer, Shockwave } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import PixelArt from "../../PixelArt";
import { BIG_SIGIL_ROWS, GRACE_GOLD, SIGIL_STROKES } from "./grace";
import { edgeFade, graceEmbers } from "./helpers";

// a hard dark outline right around the letters, so the gold reads over the light without a blurry shadow
const PIXEL_SHADOW = "2px 2px 0 #1a1204, -1px -1px 0 #1a1204, 1px -1px 0 #1a1204, -1px 1px 0 #1a1204";

const GRACE_EMBERS = graceEmbers(18);

// one layer per stroke, each one painting only its own letter of the sprite
const STROKE_LAYERS = SIGIL_STROKES.map((stroke) => ({ stroke, palette: { [stroke]: GRACE_GOLD } }));

// the light of the grace in a few flat bands over the dark, the way a 16 bit palette can afford it
const GRACE_LIGHT = `${easedGlow(GRACE_GOLD, { strength: 0.2, reach: 80 })}, rgba(5,5,12,0.78)`;

const Rule = () => (
  <motion.span
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 1.4, ease: pixelSteps(7) }}
    className="mx-auto block h-1 max-w-xl"
    style={{ background: edgeFade(GRACE_GOLD, { strength: 0.75 }) }}
  />
);

// square motes of gold that tick up the screen a frame at a time
const Embers = () =>
  GRACE_EMBERS.map(({ left, delay, size }) => (
    <motion.span
      key={left}
      className="absolute bottom-0"
      style={{ left: `${left}%`, width: size, height: size, background: GRACE_GOLD, boxShadow: `0 0 0 2px ${GRACE_GOLD}55` }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: "-85vh", opacity: [0, 1, 0] }}
      transition={{ duration: 3, delay, ease: pixelSteps(16) }}
    />
  ));

// the sigil itself, drawn huge and faint behind the banner, each stroke lighting up on its own beat
const Sigil = () => (
  <div className="absolute size-[min(80vw,30rem,70vh)]" style={{ opacity: 0.35 }}>
    {STROKE_LAYERS.map(({ stroke, palette }, index) => (
      <motion.span
        key={stroke}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{ duration: 1, delay: 0.2 + index * 0.2, ease: pixelSteps(4) }}
      >
        <PixelArt rows={BIG_SIGIL_ROWS} palette={palette} className="block size-full" />
      </motion.span>
    ))}
  </div>
);

/** The gold banner Elden Ring rolls across the screen the first time you touch a grace, in 16 bit, over the light it gives off. */
const GraceDiscovered = ({ onDone }) => {
  useMomentLength(3800, onDone);
  return (
    <EffectLayer background={GRACE_LIGHT} className="grid place-items-center" fade={1.2}>
      <Embers />
      <Sigil />
      <Shockwave color={GRACE_GOLD} delay={0.4} />
      <div className="relative w-full px-4 py-8 text-center" style={{ background: edgeFade("rgb(0 0 0)", { solid: 50, strength: 0.9 }) }}>
        <Rule />
        <motion.p
          initial={{ letterSpacing: "0.45em", opacity: 0 }}
          animate={{ letterSpacing: "0.2em", opacity: 1 }}
          transition={{ duration: 1.8, ease: pixelSteps(8) }}
          className="my-4 font-pixel text-[clamp(1.25rem,5.5vw,3.75rem)] uppercase"
          style={{ color: GRACE_GOLD, textShadow: PIXEL_SHADOW }}
        >
          Lost Grace Discovered
        </motion.p>
        <Rule />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4, ease: pixelSteps(4) }}
          className="mx-auto mt-4 max-w-xl font-pixel text-xs tracking-[0.2em] text-balance text-[#e9dcb0] uppercase"
          style={{ textShadow: PIXEL_SHADOW }}
        >
          contact.sh · Rest here, Tarnished. Every message gets an answer.
        </motion.p>
      </div>
    </EffectLayer>
  );
};

export default GraceDiscovered;
