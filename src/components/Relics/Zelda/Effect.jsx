import { motion } from "framer-motion";
import { EffectLayer, LightRays, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength, veil } from "../moment";
import { easeOutExpo } from "../../../lib/motion";
import { TRIFORCE_PIECES, ZELDA_GOLD } from "./pieces";

// where each piece flies in from before snapping together, the way the Triforce assembles in the games
const TRIFORCE_ENTRANCES = [
  { x: 0, y: -260 },
  { x: -320, y: 220 },
  { x: 320, y: 220 },
];

/** Item get: the pieces fly in and join over god rays, then the classic text box says what you got. */
const ItemGet = ({ onDone }) => {
  useMomentLength(4000, onDone);
  return (
    <EffectLayer background={veil(ZELDA_GOLD)} className="flex flex-col items-center justify-center gap-10 px-4">
      <div className="relative grid size-[min(60vw,16rem)] place-items-center">
        {/* the light lives with the relic, so it pours out of the triforce and not the middle of the screen */}
        <LightRays color={ZELDA_GOLD} delay={0.7} />
        <Shockwave color={ZELDA_GOLD} delay={0.85} />
        <Sparks colors={[ZELDA_GOLD, "#fff6c8"]} count={16} reach={42} delay={0.9} />
        <svg viewBox="0 0 16 16" className="relative size-full overflow-visible" style={{ filter: `drop-shadow(0 0 18px ${ZELDA_GOLD})` }}>
          {TRIFORCE_PIECES.map((path, index) => (
            <motion.path
              key={path}
              d={path}
              fill={ZELDA_GOLD}
              initial={{ x: TRIFORCE_ENTRANCES[index].x / 16, y: TRIFORCE_ENTRANCES[index].y / 16, opacity: 0 }}
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1 + index * 0.12, ease: easeOutExpo }}
            />
          ))}
        </svg>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1 }}
        className="w-full max-w-md rounded-md border-4 border-double border-white bg-black px-5 py-4 font-mono text-base text-white"
      >
        <TypedText text="You got the " startAt={1.2} />
        <span className="text-[#e04a3a]">
          <TypedText text="Triforce" startAt={1.68} />
        </span>
        <TypedText text="!" startAt={2} />
        <span className="mt-2 block text-sm text-white/70">
          <TypedText text="Courage, wisdom and a clean merge." startAt={2.3} perLetter={0.03} />
        </span>
      </motion.p>
    </EffectLayer>
  );
};

export default ItemGet;
