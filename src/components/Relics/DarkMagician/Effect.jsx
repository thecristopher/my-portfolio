import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../../lib/magic";
import { pixelSteps } from "../../../lib/motion";
import { scrollToSection } from "../../../lib/smoothScroll";
import darkMagicianGirl from "../../../assets/images/dark-magician-girl.png";
import { CardBack, CardFace } from "./Card";

const GOLD = "#e8c35a";
const NIGHT = "#0a0614";
// the beats: the card is played face down, flips, the circle opens in its art and she climbs out of it
const PLAYED_AT = 0.1;
const FLIP_AT = 0.6;
const FLIP_S = 0.4;
const CAST_AT_MS = 1300;
const CAST_AT_S = CAST_AT_MS / 1000;
const EMERGE_S = 0.8;
const SETTLED_MS = 3000;
// how far she climbs, as a share of her own height, so her feet end up past the top of the art window
const CLIMB = "-96%";

/** The card hits the field face down and flips over, the back folding away as the face turns up. */
const PlayedCard = ({ children }) => (
  <motion.div
    className="relative aspect-[59/86] w-[min(58vw,15rem)]"
    style={{ filter: `drop-shadow(6px 6px 0 ${NIGHT})` }}
    initial={{ y: 80, opacity: 0 }}
    animate={{ y: 0, opacity: 1, scaleX: [1, 1, 0.08, 1] }}
    transition={{
      y: { duration: 0.4, delay: PLAYED_AT, ease: pixelSteps(4) },
      opacity: { duration: 0.2, delay: PLAYED_AT },
      scaleX: { duration: FLIP_AT + FLIP_S, times: [0, FLIP_AT / (FLIP_AT + FLIP_S), (FLIP_AT + FLIP_S / 2) / (FLIP_AT + FLIP_S), 1], ease: pixelSteps(2) },
    }}
  >
    {children}
    {/* the back covers the face until the flip is halfway, then it's gone */}
    <motion.div className="absolute inset-0" initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.01, delay: FLIP_AT + FLIP_S / 2 }}>
      <CardBack />
    </motion.div>
  </motion.div>
);

/** She climbs out of the card's art window, growing from the size of her art to full size, then hovers over it. */
const Emerging = ({ isReduced }) => (
  <motion.div
    className="pointer-events-none absolute bottom-[21%] left-1/2 origin-bottom -translate-x-1/2"
    initial={{ scale: isReduced ? 1 : 0.3, y: isReduced ? CLIMB : "0%", opacity: 0 }}
    animate={{ scale: 1, y: CLIMB, opacity: 1 }}
    transition={{ duration: EMERGE_S, delay: CAST_AT_S, ease: pixelSteps(8) }}
  >
    <motion.div
      animate={isReduced ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 1.2, delay: CAST_AT_S + EMERGE_S, repeat: Infinity, ease: pixelSteps(3) }}
      className="relative"
    >
      <span className="absolute -inset-[20%]" style={{ background: easedGlow(MAGIC_PINK, { strength: 0.4 }) }} />
      {/* her sprite is already pixel art, so it only needs to stay crisp when scaled up */}
      <img
        src={darkMagicianGirl}
        alt=""
        className="relative h-[min(30vh,15rem)] w-auto max-w-none [image-rendering:pixelated]"
        style={{ filter: `drop-shadow(4px 4px 0 ${NIGHT})` }}
      />
    </motion.div>
  </motion.div>
);

/** The buff the spell gave her, shouted over the field. */
const Buff = () => (
  <motion.p
    className="absolute inset-x-0 top-20 text-center font-pixel text-[clamp(2.25rem,8vw,4rem)] leading-none font-semibold tracking-tight"
    style={{ color: MAGIC_PINK, textShadow: `3px 3px 0 ${MAGIC_BLUE}, 6px 6px 0 ${NIGHT}` }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: CAST_AT_S + 0.4, ease: pixelSteps(4) }}
  >
    +500 ATK
  </motion.p>
);

/** Dark Magician Girl's card is played and flips, she climbs out of its art, casts over the skills and stays hovering over it. */
const MagicianFlyby = ({ onDone }) => {
  const isReduced = useReducedMotion();
  useMomentLength(SETTLED_MS, onDone);

  // the page glides up to the stack report as the spell lands, so the buff plays right where you're looking
  useEffect(() => {
    const castTimer = setTimeout(() => {
      castMagic();
      scrollToSection("checkhealth");
    }, CAST_AT_MS);
    return () => clearTimeout(castTimer);
  }, []);

  return (
    <EffectLayer
      background={`${easedGlow(MAGIC_BLUE, { strength: 0.18, reach: 85 })}, rgba(10,6,20,0.78)`}
      className="flex flex-col items-center justify-end pb-[7.5rem]"
    >
      <Buff />
      <PlayedCard>
        <CardFace art={darkMagicianGirl} castAt={CAST_AT_S} />
        {/* the burst comes out of the art window, where she breaks through */}
        <div className="pointer-events-none absolute inset-x-0 top-[20%] h-[59%]">
          <Shockwave color={MAGIC_PINK} delay={CAST_AT_S} size="140%" />
          <Sparks colors={[GOLD, MAGIC_PINK, MAGIC_BLUE]} count={16} reach={40} delay={CAST_AT_S} />
        </div>
        <Emerging isReduced={isReduced} />
      </PlayedCard>
      <p className="absolute top-4 left-4 font-pixel text-[11px] text-white/60">pixel art by TeykioArts</p>
    </EffectLayer>
  );
};

export default MagicianFlyby;
