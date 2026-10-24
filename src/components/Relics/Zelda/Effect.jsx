import { motion } from "framer-motion";
import { EffectLayer, LightRays, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength, veil } from "../moment";
import PixelArt from "../../PixelArt";
import { pixelSteps } from "../../../lib/motion";
import { PIECE_ROWS, TRIFORCE_PALETTE, ZELDA_GOLD } from "./pieces";

const FLY_AT = 0.1;
const FLY_FOR = 0.8;
// all three land on the same frame, and everything else in the moment pours out of that instant
const JOINED_AT = FLY_AT + FLY_FOR;

// where each piece sits in the whole Triforce, and the corner of the screen it flies in from
const PIECES = [
  { spot: "left-1/4 top-0", from: { x: "0vw", y: "-60vh" } },
  { spot: "left-0 top-1/2", from: { x: "-70vw", y: "45vh" } },
  { spot: "left-1/2 top-1/2", from: { x: "70vw", y: "45vh" } },
];

// the hollow in the middle of the Triforce sits two thirds of the way down, so the light starts there
const HEART = { x: "50%", y: "66.7%" };

/** Item get: the three pieces fly in together and join in one flash over god rays, then the text box stays open. */
const ItemGet = ({ onDone }) => {
  useMomentLength(3900, onDone);
  return (
    <EffectLayer background={veil(ZELDA_GOLD)} className="flex flex-col items-center justify-center gap-10 px-4">
      <div className="relative aspect-square w-[min(64vw,17rem)]">
        <LightRays color={ZELDA_GOLD} delay={JOINED_AT} at={HEART} />
        {/* a box centered on the heart, so the ring and the sparks burst from the same spot as the rays */}
        <div className="absolute inset-x-0 top-1/3 bottom-0">
          <Shockwave color={ZELDA_GOLD} delay={JOINED_AT} />
          <Sparks colors={[ZELDA_GOLD, "#fff6c8"]} count={16} reach={42} delay={JOINED_AT} />
        </div>
        {PIECES.map(({ spot, from }) => (
          <motion.div
            key={spot}
            className={`absolute size-1/2 ${spot}`}
            style={{ filter: `drop-shadow(0 0 14px ${ZELDA_GOLD})` }}
            initial={{ ...from, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: FLY_FOR, delay: FLY_AT, ease: pixelSteps(8) }}
          >
            <PixelArt rows={PIECE_ROWS} palette={TRIFORCE_PALETTE} className="size-full" />
          </motion.div>
        ))}
        {/* the flash of the pieces locking together */}
        <motion.div
          className="absolute inset-0 bg-white mix-blend-screen"
          style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, delay: JOINED_AT, ease: pixelSteps(4) }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 1, ease: pixelSteps(3) }}
        className="snes-window w-full max-w-md px-5 py-4 text-base"
      >
        <TypedText text="You got the " startAt={1.2} />
        <span className="text-[#e04a3a]">
          <TypedText text="Triforce" startAt={1.68} />
        </span>
        <TypedText text="!" startAt={2} />
        <span className="mt-2 block text-[clamp(0.8rem,3.4vw,0.875rem)] text-white/85">
          <TypedText text="Courage to lead, Wisdom to review, Power to ship." startAt={2.3} perLetter={0.03} />
        </span>
      </motion.p>
    </EffectLayer>
  );
};

export default ItemGet;
