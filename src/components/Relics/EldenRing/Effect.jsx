import { motion } from "framer-motion";
import { Bloom, DrawnPath, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { GRACE_GOLD, GRACE_STROKES } from "../artwork";
import { easeOutExpo } from "../../../lib/motion";

// the cello figure plays while the light comes down, and the choir chord opens as the sigil is drawn
const PILLAR_AT = 0.1;
const SIGIL_AT = 0.9;
const COPY_AT = 1.6;
const MOMENT_MS = 3600;

// motes of golden light drifting up through the pillar, each on its own lazy path
const MOTES = Array.from({ length: 18 }, (_, index) => ({ index, x: ((index * 37) % 100) - 50, delay: (index * 0.23) % 2.4, size: 2 + (index % 3) }));

const Pillar = () => (
  <motion.span
    className="absolute top-0 left-1/2 h-[62%] w-[min(40vw,18rem)] -translate-x-1/2 blur-2xl"
    style={{ background: `linear-gradient(to bottom, transparent, ${GRACE_GOLD}66 60%, ${GRACE_GOLD}cc)`, originY: 0 }}
    initial={{ scaleY: 0, opacity: 0 }}
    animate={{ scaleY: 1, opacity: 1 }}
    transition={{ duration: 1.4, delay: PILLAR_AT, ease: easeOutExpo }}
  />
);

const Motes = () =>
  MOTES.map((mote) => (
    <motion.span
      key={mote.index}
      className="absolute top-[52%] left-1/2 rounded-full"
      style={{ width: mote.size, height: mote.size, background: GRACE_GOLD, boxShadow: `0 0 8px ${GRACE_GOLD}`, x: `${mote.x * 0.3}vw` }}
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: "-40vh", opacity: [0, 1, 0] }}
      transition={{ duration: 3.2, delay: PILLAR_AT + mote.delay, repeat: Infinity, ease: "easeOut" }}
    />
  ));

/** Elden Ring: a pillar of golden light comes down, the sigil of grace is drawn in it, and the motes rise. */
const GraceMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={GRACE_GOLD} glowAt="50% 38%">
      <Pillar />
      <Bloom color={GRACE_GOLD} at={SIGIL_AT} size="min(46vmin,22rem)" className="top-[38%]" />
      <svg viewBox="0 0 64 64" className="absolute top-[38%] left-1/2 size-[min(34vmin,14rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible" style={{ filter: `drop-shadow(0 0 10px ${GRACE_GOLD})` }}>
        {GRACE_STROKES.map((d, index) => (
          <DrawnPath key={d} d={d} color={GRACE_GOLD} at={SIGIL_AT + index * 0.15} duration={1.3} width={1.6} />
        ))}
      </svg>
      <Motes />
      <MomentCopy color={GRACE_GOLD} eyebrow="Elden Ring" title="Lost Grace Discovered." lines={["Rest here, Tarnished. Every message gets an answer."]} at={COPY_AT} />
    </MomentLayer>
  );
};

export default GraceMoment;
