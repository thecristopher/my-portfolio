import { motion } from "framer-motion";
import { EffectLayer, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import PixelArt from "../../PixelArt";
import { easedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import { CLAIRE_PALETTE, CLAIRE_ROWS } from "./claire";
import { Scanlines, Twinkles, TypeCursor } from "./pieces";

const SCREEN_AT = 0.15;
// she shows up a beat after the screen powers on
const CLAIRE_AT = 0.55;
const SAVED = "Your game has been saved.";
const SAVED_AT = 0.9;
const SAVED_PER_LETTER = 0.06;
const PARTNER_LINE = "Every run is better with the right co-op partner.";
const PARTNER_PER_LETTER = 0.03;
// the second line waits for the first, the way a typewriter only prints one line at a time
const PARTNER_AT = SAVED_AT + SAVED.length * SAVED_PER_LETTER + 0.3;
const TYPED_AT = PARTNER_AT + PARTNER_LINE.length * PARTNER_PER_LETTER;
const SETTLED_MS = Math.round(TYPED_AT * 1000) + 150;

// the RE2 inventory palette: navy screen, steel bevels and the warm red of her jacket
const JACKET_RED = "#c0392b";
const SCREEN_NAVY = "#14173c";
const BEVEL = "border-2 border-[#9aa0c4] shadow-[inset_0_0_0_2px_#0a0c24]";

/** Claire in the item viewer, lit warm, breathing one pixel up and back. */
const Viewer = () => (
  <div
    className={`relative grid place-items-center overflow-hidden ${BEVEL} px-14 py-4`}
    style={{ background: `${easedGlow(JACKET_RED, { strength: 0.55, shape: "ellipse", reach: 70 })}, #0b1a4a` }}
  >
    <Twinkles startAt={CLAIRE_AT + 0.6} />
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [10, 0, -1, 0] }}
      transition={{
        opacity: { duration: 0.5, delay: CLAIRE_AT, ease: pixelSteps(4) },
        y: { duration: 3, delay: CLAIRE_AT, times: [0, 0.15, 0.6, 1], repeat: Infinity, repeatDelay: 0.2, ease: pixelSteps(6) },
      }}
    >
      <PixelArt
        rows={CLAIRE_ROWS}
        palette={CLAIRE_PALETTE}
        className="block h-[min(40vh,22rem)] w-auto"
        style={{ filter: "drop-shadow(0 0 10px rgb(255 160 170 / 0.35))" }}
      />
    </motion.div>
  </div>
);

/** The text box under the viewer, typed out and left on the screen. */
const Caption = () => (
  <div className={`${BEVEL} bg-[#0a0c24] px-4 py-3 text-[clamp(0.85rem,3.2vw,1.15rem)] leading-snug tracking-wide text-[#eef0ff] text-pretty`}>
    <p>
      <TypedText text={SAVED} startAt={SAVED_AT} perLetter={SAVED_PER_LETTER} />
    </p>
    <p className="mt-1 text-[#c8cbe8]">
      <TypedText text={PARTNER_LINE} startAt={PARTNER_AT} perLetter={PARTNER_PER_LETTER} />
      <TypeCursor startAt={TYPED_AT} />
    </p>
  </div>
);

/** The save room: an old screen powers on, Claire waits in the viewer and the game says it's saved. */
const SaveRoom = ({ onDone }) => {
  useMomentLength(SETTLED_MS, onDone);
  return (
    <EffectLayer background="#000" className="flex items-center justify-center px-3 pt-20 pb-28" fade={0.6}>
      {/* the screen powers on like an old CRT: a bright line that opens up into the picture */}
      <motion.div
        className={`relative flex w-[min(92vw,30rem)] flex-col gap-2 p-2 font-pixel ${BEVEL}`}
        style={{ background: SCREEN_NAVY }}
        initial={{ opacity: 0, scaleY: 0.02, filter: "brightness(3)" }}
        animate={{ opacity: 1, scaleY: [0.02, 0.02, 1], filter: ["brightness(3)", "brightness(3)", "brightness(1)"] }}
        transition={{ duration: 0.45, delay: SCREEN_AT, times: [0, 0.3, 1], ease: pixelSteps(5) }}
      >
        <Scanlines startAt={SCREEN_AT + 0.45} />
        <Viewer />
        <Caption />
      </motion.div>
    </EffectLayer>
  );
};

export default SaveRoom;
