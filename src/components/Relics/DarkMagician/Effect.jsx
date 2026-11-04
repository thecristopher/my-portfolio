import { useEffect } from "react";
import { motion } from "framer-motion";
import { Bloom, Burst, DrawnPath, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { PUZZLE_GOLD } from "../artwork";
import { polygonPoints } from "../actions";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../../lib/magic";
import { easeOutExpo } from "../../../lib/motion";
import { scrollToSection } from "../../../lib/smoothScroll";

// the beats in sound.js: the card whooshes off the duel disk, flips on the stabs, and the summon lands on the cast
const PLAYED_AT = 0.1;
const FLIP_AT = 0.6;
const CAST_AT_MS = 1600;
const CAST_AT = CAST_AT_MS / 1000;
const COPY_AT = 1.9;
const MOMENT_MS = 3400;

// a star drawn in one stroke: every other corner of a pentagon
const PENTAGON = polygonPoints(5, 34, { x: 50, y: 50 }).split(" ");
const PENTAGRAM = `M${[0, 2, 4, 1, 3].map((corner) => PENTAGON[corner]).join("L")}Z`;
const STARS = Array.from({ length: 6 }, (_, index) => index);

// the card's face: name bar, level stars, the art window with a spell circle drawn in, and the stats
const CardFace = () => (
  <div className="absolute inset-0 flex flex-col gap-2 rounded-2xl p-3 [backface-visibility:hidden]" style={{ background: `linear-gradient(160deg, #3b2a6b, #1b1236)`, boxShadow: `inset 0 0 0 2px ${PUZZLE_GOLD}` }}>
    <p className="rounded-md bg-black/30 px-2 py-1 text-left text-[clamp(0.6rem,1.8vmin,0.85rem)] font-bold tracking-wide">Dark Magician Girl</p>
    <p className="flex justify-end gap-0.5 text-[clamp(0.5rem,1.5vmin,0.7rem)] text-[#ffcc4d]">
      {STARS.map((star) => (
        <span key={star}>★</span>
      ))}
    </p>
    <div className="relative flex-1 overflow-hidden rounded-md" style={{ background: `radial-gradient(circle at 50% 45%, ${MAGIC_PINK}55, #120a26 70%)` }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
        <DrawnPath d="M16 50a34 34 0 1 0 68 0a34 34 0 1 0-68 0" color={MAGIC_PINK} at={FLIP_AT + 0.3} duration={0.8} width={1.2} />
        <DrawnPath d={PENTAGRAM} color={MAGIC_BLUE} at={FLIP_AT + 0.5} duration={0.9} width={1.2} />
      </svg>
    </div>
    <p className="flex justify-between rounded-md bg-black/30 px-2 py-1 text-[clamp(0.55rem,1.6vmin,0.75rem)] font-semibold">
      {/* her attack climbs by the buff the moment the spell lands */}
      <span className="relative">
        ATK/
        <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.2, delay: CAST_AT }}>
          2000
        </motion.span>
        <motion.span className="absolute right-0" style={{ color: MAGIC_PINK }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2, delay: CAST_AT }}>
          2500
        </motion.span>
      </span>
      <span>DEF/1700</span>
    </p>
  </div>
);

const CardBack = () => (
  <div
    className="absolute inset-0 grid place-items-center rounded-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
    style={{ background: `radial-gradient(circle, #6b3a1a, #2a1408)`, boxShadow: `inset 0 0 0 2px ${PUZZLE_GOLD}` }}
  >
    <span className="size-1/2 rounded-full" style={{ background: `radial-gradient(circle, ${PUZZLE_GOLD}, transparent 70%)` }} />
  </div>
);

// played face down from below, then flipped over in 3D on the stabs
const Card = () => (
  <motion.div
    className="absolute top-[38%] left-1/2 aspect-[59/86] w-[min(34vmin,13rem)] -translate-x-1/2 -translate-y-1/2 [perspective:1200px]"
    initial={{ y: "70vh", rotate: -12 }}
    animate={{ y: 0, rotate: 0 }}
    transition={{ duration: 0.6, delay: PLAYED_AT, ease: easeOutExpo }}
  >
    <motion.div
      className="relative size-full [transform-style:preserve-3d]"
      initial={{ rotateY: 180 }}
      animate={{ rotateY: 0, scale: [1, 1.08, 1] }}
      transition={{ rotateY: { duration: 0.7, delay: FLIP_AT, ease: easeOutExpo }, scale: { duration: 0.6, delay: CAST_AT } }}
    >
      <CardFace />
      <CardBack />
    </motion.div>
  </motion.div>
);

// the buff, rising off the card as the spell lands
const Buff = () => (
  <motion.p
    className="absolute top-[4%] left-1/2 -translate-x-1/2 text-[clamp(2rem,6vw,4rem)] font-black tracking-tight"
    style={{ backgroundImage: `linear-gradient(90deg, ${MAGIC_PINK}, ${MAGIC_BLUE})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
    initial={{ opacity: 0, y: 30, scale: 0.6 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, delay: CAST_AT, ease: easeOutExpo }}
  >
    +500 ATK
  </motion.p>
);

/** Yu-Gi-Oh: her card is played face down, flips over in 3D, and the spell lands on the skills. */
const SummonMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);

  // the page glides to the skills as the spell lands, so the buff plays right where you're looking
  useEffect(() => {
    const castTimer = setTimeout(() => {
      castMagic();
      scrollToSection("skill-grid");
    }, CAST_AT_MS);
    return () => clearTimeout(castTimer);
  }, []);

  return (
    <MomentLayer color={MAGIC_PINK} glowAt="50% 36%">
      <Bloom color={MAGIC_BLUE} at={FLIP_AT} size="min(60vmin,28rem)" className="top-[36%]" />
      <Card />
      <Burst color={MAGIC_PINK} at={CAST_AT} count={18} className="top-[36%]" />
      <Buff />
      <MomentCopy
        color={MAGIC_PINK}
        eyebrow="Yu-Gi-Oh!"
        title="Every skill, +500 ATK."
        lines={["The heart of the cards believes in the stack."]}
        at={COPY_AT}
        className="bottom-[8vh]"
      />
    </MomentLayer>
  );
};

export default SummonMoment;
