import { motion } from "framer-motion";
import PixelArt from "../../PixelArt";
import { MAGIC_BLUE, MAGIC_PINK } from "../../../lib/magic";
import { pixelSteps } from "../../../lib/motion";
import { hexagramRows, magicRingRows } from "./helpers";

// the orange of an effect monster card, its darker frame and the parchment of the text box
const CARD_ORANGE = "#d9823f";
const CARD_FRAME = "#5a2e14";
const PARCHMENT = "#efe2bf";
const STAR = "#f2c12e";
const LEVEL = 6;
const BASE_ATK = 2000;
const BUFF = 500;

const SPELL_PALETTE = { p: MAGIC_PINK, b: MAGIC_BLUE };
const RING_ROWS = magicRingRows(40);
const HEXAGRAM_ROWS = hexagramRows(40);
// the swirl on the back of every card, a dark oval ringed in gold
const BACK_OVAL = "radial-gradient(ellipse 34% 26% at 50% 50%, #3b1a0e 0 60%, #c99a3e 60% 70%, transparent 70%)";

/** The back of the card, the brown swirl every duelist knows, before it flips face up. */
export const CardBack = () => (
  <div className="absolute inset-0 border-4 bg-[#7a4a22]" style={{ borderColor: CARD_FRAME, backgroundImage: BACK_OVAL }} />
);

/**
 * The magic circle spinning up inside the art window, where she comes through.
 * @param {{ castAt: number }} props when the spell lands, in seconds
 */
const ArtCircle = ({ castAt }) =>
  [RING_ROWS, HEXAGRAM_ROWS].map((rows, index) => (
    <motion.span
      key={index}
      className="absolute inset-[6%]"
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: castAt - 0.45 + index * 0.12, ease: pixelSteps(4) }}
    >
      <PixelArt rows={rows} palette={SPELL_PALETTE} className="size-full" />
    </motion.span>
  ));

/** Her ATK, swapping to the buffed number on the frame the spell lands. */
const AtkCount = ({ castAt }) => (
  <span className="relative inline-block">
    <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.01, delay: castAt + 0.3 }}>
      {BASE_ATK}
    </motion.span>
    <motion.span className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: castAt + 0.3 }}>
      {BASE_ATK + BUFF}
    </motion.span>
  </span>
);

/**
 * The face of Dark Magician Girl's card: name and attribute, six stars, the art window she climbs out of, her text and
 * her ATK ticking up by the buff once the spell lands.
 * @param {{ art: string, castAt: number }} props her sprite, and when the spell lands in seconds
 */
export const CardFace = ({ art, castAt }) => (
  <div className="absolute inset-0 flex flex-col gap-[3%] border-4 p-[5%] font-pixel" style={{ background: CARD_ORANGE, borderColor: CARD_FRAME }}>
    <div className="flex items-center justify-between border-2 bg-[#f6e7c8] px-1.5 py-0.5 text-[clamp(0.6rem,2.6vw,0.8rem)] leading-tight font-bold text-[#1d1236]" style={{ borderColor: CARD_FRAME }}>
      Dark Magician Girl
      <span className="grid size-[1.1em] place-items-center rounded-full bg-[#3b1758] text-[0.55em] text-white">闇</span>
    </div>
    <p className="flex justify-end gap-0.5 text-[clamp(0.55rem,2.2vw,0.7rem)] leading-none" style={{ color: STAR }}>
      {"★".repeat(LEVEL)}
    </p>
    <div className="relative mx-auto aspect-square w-[86%] overflow-hidden border-4 bg-[#140b2e]" style={{ borderColor: CARD_FRAME }}>
      <ArtCircle castAt={castAt} />
      {/* her art empties out of the window as she steps through it */}
      <motion.img
        src={art}
        alt=""
        className="absolute inset-x-0 bottom-0 mx-auto h-[92%] w-auto [image-rendering:pixelated]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 0.3, delay: castAt, ease: pixelSteps(3) }}
      />
    </div>
    <div className="flex flex-1 flex-col justify-between border-2 px-1.5 py-1 text-[clamp(0.5rem,2.1vw,0.66rem)] leading-snug text-[#1d1236]" style={{ background: PARCHMENT, borderColor: CARD_FRAME }}>
      <p>
        <span className="font-bold">[Spellcaster / Effect]</span> When summoned, every engineer on your side of the field is unblocked.
      </p>
      <p className="flex justify-end gap-2 border-t border-[#1d1236]/40 pt-0.5 font-bold">
        <span>
          ATK/
          <motion.span
            initial={{ color: "#1d1236" }}
            animate={{ color: ["#1d1236", MAGIC_PINK, "#b0306a"] }}
            transition={{ duration: 0.6, delay: castAt + 0.3, ease: pixelSteps(3) }}
          >
            <AtkCount castAt={castAt} />
          </motion.span>
        </span>
        <span>DEF/1700</span>
      </p>
    </div>
  </div>
);
