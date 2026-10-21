import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow, softRing } from "../../../actions";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../../lib/magic";
import { easeOutExpo } from "../../../lib/motion";
import { scrollToSection } from "../../../lib/smoothScroll";
import darkMagicianGirl from "../../../assets/images/dark-magician-girl.png";

const GOLD = "#e8c35a";
// she flies in and stays hovering above her card text, so the last frame is her and what she did
const FLIGHT_S = 1;
const CAST_AT_MS = 1300;
const CAST_AT_S = CAST_AT_MS / 1000;
const CARD_TEXT_AT = CAST_AT_S + 0.8;
const SETTLED_MS = 3000;

// stars thrown out from her wand when the spell goes off, spread evenly around a circle
const SPELL_STARS = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * Math.PI * 2,
  reach: index % 2 === 0 ? 46 : 34,
  color: index % 3 === 0 ? GOLD : index % 2 === 0 ? MAGIC_PINK : MAGIC_BLUE,
}));

const Star4 = ({ color, className = "", style }) => (
  <svg viewBox="0 0 8 8" className={className} style={style} aria-hidden="true">
    <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={color} />
  </svg>
);

// the magic circle she casts: two rings and a hexagram drawing themselves, then a shockwave rolling out
const SpellCircle = () => (
  <div className="absolute top-[34%] left-1/2 size-[min(80vw,28rem)] -translate-x-1/2 -translate-y-1/2">
    <motion.svg
      viewBox="0 0 100 100"
      className="size-full"
      initial={{ rotate: -40, opacity: 0 }}
      animate={{ rotate: 20, opacity: [0, 1, 0.45] }}
      transition={{ duration: 2.6, delay: CAST_AT_S - 0.3, times: [0, 0.15, 1], ease: "easeOut" }}
      style={{ filter: `drop-shadow(0 0 6px ${MAGIC_PINK})` }}
    >
      {["M50 3 A47 47 0 1 1 49.9 3", "M50 11 A39 39 0 1 1 49.9 11", "M50 11 L83.8 69.5 L16.2 69.5 Z", "M50 89 L16.2 30.5 L83.8 30.5 Z"].map((path, index) => (
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke={index % 2 === 0 ? MAGIC_PINK : MAGIC_BLUE}
          strokeWidth="0.7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: CAST_AT_S - 0.3 + index * 0.1, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
    <motion.span
      className="absolute inset-0 rounded-full"
      style={{ background: `${softRing(MAGIC_PINK)}, ${softRing(MAGIC_BLUE, { strength: 0.5, at: 62 })}`, mixBlendMode: "screen" }}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: 2.4, opacity: [0, 0.9, 0] }}
      transition={{ duration: 1.1, delay: CAST_AT_S, ease: easeOutExpo }}
    />
    {SPELL_STARS.map(({ angle, reach, color }) => (
      <motion.span
        key={angle}
        className="absolute top-1/2 left-1/2 -mt-2 -ml-2"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
        animate={{ x: `${Math.cos(angle) * reach}vmin`, y: `${Math.sin(angle) * reach}vmin`, opacity: [0, 1, 0], scale: [0.4, 1.4, 0.6] }}
        transition={{ duration: 1.4, delay: CAST_AT_S, ease: easeOutExpo }}
      >
        <Star4 color={color} className="size-4" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </motion.span>
    ))}
  </div>
);

// what the spell did and her card text, both stay so the final frame reads like the card she just became
const BuffBanner = () => (
  <div className="absolute inset-x-4 bottom-[7rem] flex flex-col items-center gap-3 text-center">
    <motion.p
      className="font-mono text-[clamp(2.5rem,9vw,4.5rem)] leading-none font-medium tracking-tight"
      style={{
        backgroundImage: `linear-gradient(to right, ${MAGIC_PINK}, ${MAGIC_BLUE})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 18px ${MAGIC_PINK}aa)`,
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: CAST_AT_S + 0.2, ease: easeOutExpo }}
    >
      +500 ATK
    </motion.p>
    <motion.p
      className="w-full max-w-md rounded-[3px] border-2 border-[#c99a3e] bg-[#efe2bf] px-3 py-2 text-left font-serif text-[clamp(0.8rem,3.4vw,0.95rem)] leading-snug text-pretty text-[#1d1236] shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: CARD_TEXT_AT, ease: easeOutExpo }}
    >
      <span className="font-bold">[Spellcaster / Effect]</span> Tech Lead &amp; Engineering Manager. When summoned, every engineer on your
      side of the field is unblocked.
    </motion.p>
  </div>
);

/** Dark Magician Girl flies in, casts over the skills, turns every card into a duel monster and stays hovering over her card text. */
const MagicianFlyby = ({ onDone }) => {
  const prefersReducedMotion = useReducedMotion();
  useMomentLength(SETTLED_MS, onDone);

  // the page glides up to the cards as the spell lands, so the flip plays right where you're looking
  useEffect(() => {
    const castTimer = setTimeout(() => {
      castMagic();
      scrollToSection("skill-cards");
    }, CAST_AT_MS);
    return () => clearTimeout(castTimer);
  }, []);

  // she flies relative to her spot above the banner, so wherever the screen ends she hovers fully inside it
  const flight = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
    : {
        initial: { x: "-75vw", y: "35vh", rotate: -16, opacity: 0 },
        animate: { x: "0vw", y: "0vh", rotate: 0, opacity: 1 },
      };

  return (
    <EffectLayer background={`${easedGlow(MAGIC_BLUE, { strength: 0.18, shape: "ellipse", reach: 85 })}, rgba(10,6,20,0.72)`}>
      {!prefersReducedMotion && <SpellCircle />}
      <motion.div {...flight} transition={{ duration: FLIGHT_S, ease: easeOutExpo }} className="absolute top-[34%] left-1/2">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="-translate-x-1/2 -translate-y-1/2"
        >
          <img
            src={darkMagicianGirl}
            alt=""
            className="h-[min(34vh,16rem)] w-auto max-w-none [image-rendering:pixelated]"
            style={{ filter: `drop-shadow(0 0 22px ${MAGIC_PINK}aa)` }}
          />
        </motion.div>
      </motion.div>
      <BuffBanner />
      <p className="absolute top-4 left-4 font-mono text-[11px] text-white/60">pixel art by TeykioArts</p>
    </EffectLayer>
  );
};

export default MagicianFlyby;
