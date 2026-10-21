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
const FLIGHT_S = 4.6;
// flies in, hovers in the middle of the screen while she casts, then shoots off the top right
const FLIGHT_TIMES = [0, 0.22, 0.78, 1];
const CAST_AT_MS = 1300;
const CAST_AT_S = CAST_AT_MS / 1000;

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
  <div className="absolute top-1/2 left-1/2 size-[min(90vw,34rem)] -translate-x-1/2 -translate-y-1/2">
    <motion.svg
      viewBox="0 0 100 100"
      className="size-full"
      initial={{ rotate: -40, opacity: 0 }}
      animate={{ rotate: 20, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.6, delay: CAST_AT_S - 0.3, times: [0, 0.15, 0.7, 1], ease: "easeOut" }}
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

// what the spell did, stamped big enough to read while she's still on screen
const BuffBanner = () => (
  <motion.div
    className="absolute inset-x-4 bottom-[12vh] flex flex-col items-center gap-2 text-center font-mono"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -8] }}
    transition={{ duration: 3, delay: CAST_AT_S + 0.2, times: [0, 0.12, 0.8, 1], ease: easeOutExpo }}
  >
    <p
      className="text-[clamp(2.5rem,9vw,5rem)] leading-none font-medium tracking-tight"
      style={{
        backgroundImage: `linear-gradient(to right, ${MAGIC_PINK}, ${MAGIC_BLUE})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 18px ${MAGIC_PINK}aa)`,
      }}
    >
      +500 ATK
    </p>
    <p className="text-xs tracking-[0.25em] text-white/80 uppercase">every skill is a duel monster now</p>
  </motion.div>
);

/** Dark Magician Girl flies in, casts over the skills and turns every card into a duel monster for good. */
const MagicianFlyby = ({ onDone }) => {
  const prefersReducedMotion = useReducedMotion();
  useMomentLength(FLIGHT_S * 1000 + 100, onDone);

  // the page glides up to the cards as the spell lands, so the flip plays right where you're looking
  useEffect(() => {
    const castTimer = setTimeout(() => {
      castMagic();
      scrollToSection("skill-cards");
    }, CAST_AT_MS);
    return () => clearTimeout(castTimer);
  }, []);

  // she flies relative to the middle of the screen, so wherever the screen ends she hovers fully inside it
  const flight = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: [0, 1, 1, 0] } }
    : {
        initial: { x: "-75vw", y: "35vh", rotate: -16, opacity: 0 },
        animate: {
          x: ["-75vw", "0vw", "0vw", "80vw"],
          y: ["35vh", "0vh", "-2vh", "-85vh"],
          rotate: [-16, 0, 0, 14],
          opacity: [0, 1, 1, 1],
        },
      };

  return (
    <EffectLayer background={`${easedGlow(MAGIC_BLUE, { strength: 0.18, shape: "ellipse", reach: 85 })}, rgba(10,6,20,0.6)`}>
      {!prefersReducedMotion && <SpellCircle />}
      <motion.div {...flight} transition={{ duration: FLIGHT_S, times: FLIGHT_TIMES, ease: "easeInOut" }} className="absolute top-1/2 left-1/2">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="-translate-x-1/2 -translate-y-1/2"
        >
          <img
            src={darkMagicianGirl}
            alt=""
            className="h-[min(42vh,18rem)] w-auto max-w-none [image-rendering:pixelated]"
            style={{ filter: `drop-shadow(0 0 22px ${MAGIC_PINK}aa)` }}
          />
        </motion.div>
      </motion.div>
      <BuffBanner />
      <p className="absolute right-4 bottom-12 font-mono text-[11px] text-white/60">pixel art by TeykioArts</p>
    </EffectLayer>
  );
};

export default MagicianFlyby;
