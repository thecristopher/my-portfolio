import { motion } from "framer-motion";
import { EffectLayer, Shockwave } from "../shared";
import { useMomentLength, veil } from "../moment";
import { easeOutExpo } from "../../../lib/motion";
import { GRACE_GOLD, GRACE_SIGIL } from "./grace";

// a dark edge right around the letters and a soft shadow wide around them, so the gold reads over the light
const LEGIBLE_SHADOW = "0 1px 2px rgb(0 0 0 / 0.95), 0 0 8px rgb(0 0 0 / 0.9), 0 0 22px rgb(0 0 0 / 0.75)";

// specks of gold rising up the whole screen, the way the air above a grace shimmers
const GRACE_EMBERS = Array.from({ length: 18 }, (_, index) => ({ left: 4 + ((index * 37) % 92), delay: (index % 6) * 0.25, size: 3 + (index % 3) * 2 }));

const Rule = () => (
  <motion.span
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 1.4, ease: easeOutExpo }}
    className="mx-auto block h-px max-w-xl bg-gradient-to-r from-transparent via-[#f5d77a]/70 to-transparent"
  />
);

/** The gold banner Elden Ring rolls across the screen the first time you touch a grace, over the light it gives off. */
const GraceDiscovered = ({ onDone }) => {
  useMomentLength(3800, onDone);
  return (
    <EffectLayer background={veil(GRACE_GOLD, 0.78)} className="grid place-items-center" fade={1.2}>
      {GRACE_EMBERS.map(({ left, delay, size }) => (
        <motion.span
          key={left}
          className="absolute bottom-0 rounded-full"
          style={{ left: `${left}%`, width: size, height: size, background: GRACE_GOLD, boxShadow: `0 0 10px ${GRACE_GOLD}` }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-85vh", opacity: [0, 1, 0] }}
          transition={{ duration: 3, delay, ease: "easeOut" }}
        />
      ))}
      {/* the sigil itself, drawn huge and faint behind the banner */}
      <svg viewBox="0 0 16 16" className="absolute size-[min(80vw,30rem,70vh)] overflow-visible" style={{ opacity: 0.35 }}>
        {GRACE_SIGIL.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill="none"
            stroke={GRACE_GOLD}
            strokeWidth="0.25"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: 0.2 + index * 0.2, ease: "easeInOut" }}
          />
        ))}
      </svg>
      <Shockwave color={GRACE_GOLD} delay={0.4} />
      <div className="relative w-full bg-gradient-to-r from-transparent via-black/90 to-transparent px-4 py-8 text-center">
        <Rule />
        <motion.p
          initial={{ letterSpacing: "0.45em", opacity: 0 }}
          animate={{ letterSpacing: "0.2em", opacity: 1 }}
          transition={{ duration: 1.8, ease: easeOutExpo }}
          className="my-4 font-display text-[clamp(1.25rem,5.5vw,3.75rem)] uppercase"
          style={{ color: GRACE_GOLD, textShadow: `${LEGIBLE_SHADOW}, 0 0 28px ${GRACE_GOLD}88` }}
        >
          Lost Grace Discovered
        </motion.p>
        <Rule />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mx-auto mt-4 max-w-xl font-display text-xs tracking-[0.3em] text-balance text-[#e9dcb0] uppercase"
          style={{ textShadow: LEGIBLE_SHADOW }}
        >
          contact.sh · Rest here, Tarnished. Every message gets an answer.
        </motion.p>
      </div>
    </EffectLayer>
  );
};

export default GraceDiscovered;
