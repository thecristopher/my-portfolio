import { motion } from "framer-motion";
import { Bloom, Burst, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { TRIFORCE_GOLD, TRIFORCE_PIECES } from "../artwork";
import { easeOutExpo } from "../../../lib/motion";

// the pieces fly in from where each virtue lives while the secret run plays, and lock together on its last note
const PIECES = [
  { d: TRIFORCE_PIECES[0], from: { x: 0, y: -60 }, turn: -200, virtue: "Power" },
  { d: TRIFORCE_PIECES[1], from: { x: -70, y: 40 }, turn: 160, virtue: "Wisdom" },
  { d: TRIFORCE_PIECES[2], from: { x: 70, y: 40 }, turn: -160, virtue: "Courage" },
];
const ASSEMBLE_S = 0.7;
const LOCK_AT = 0.75;
const COPY_AT = 1.5;
const MOMENT_MS = 3200;

// the light that rises behind it once it's whole, rays turning slowly like the item get screen
const Rays = () => (
  <motion.div
    className="absolute top-[36%] left-1/2 size-[min(120vmin,60rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
    style={{
      background: `repeating-conic-gradient(from 0deg, ${TRIFORCE_GOLD}33 0deg 6deg, transparent 6deg 24deg)`,
      maskImage: "radial-gradient(circle, black 0%, transparent 65%)",
    }}
    initial={{ opacity: 0, rotate: 0, scale: 0.6 }}
    animate={{ opacity: 1, rotate: 40, scale: 1 }}
    transition={{ opacity: { duration: 1, delay: LOCK_AT }, scale: { duration: 1.2, delay: LOCK_AT, ease: easeOutExpo }, rotate: { duration: 10, delay: LOCK_AT, ease: "linear" } }}
  />
);

/** Zelda: the three golden pieces fly in from their corners and lock into the Triforce, and the light rises. */
const TriforceMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={TRIFORCE_GOLD} glowAt="50% 36%">
      <Rays />
      <Bloom color={TRIFORCE_GOLD} at={LOCK_AT} size="min(50vmin,24rem)" className="top-[36%]" />
      <svg viewBox="0 0 64 64" className="absolute top-[36%] left-1/2 size-[min(36vmin,15rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible">
        {PIECES.map((piece, index) => (
          <motion.path
            key={piece.d}
            d={piece.d}
            fill={TRIFORCE_GOLD}
            stroke="#fff3c4"
            strokeWidth="0.8"
            strokeLinejoin="round"
            style={{ originX: "32px", originY: "32px", filter: `drop-shadow(0 0 6px ${TRIFORCE_GOLD})` }}
            initial={{ x: piece.from.x, y: piece.from.y, rotate: piece.turn, opacity: 0 }}
            animate={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: ASSEMBLE_S, delay: index * 0.12, ease: easeOutExpo }}
          />
        ))}
      </svg>
      <Burst color="#fff3c4" at={LOCK_AT} count={14} className="top-[36%]" />
      <MomentCopy
        color={TRIFORCE_GOLD}
        eyebrow="The Legend of Zelda"
        title="It's dangerous to ship alone."
        lines={["Courage to lead, Wisdom to review, Power to ship."]}
        at={COPY_AT}
      />
    </MomentLayer>
  );
};

export default TriforceMoment;
