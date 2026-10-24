import { motion } from "framer-motion";
import { EffectLayer, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import PixelArt from "../../PixelArt";
import { easedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import { HERB_PALETTE, HERB_ROWS } from "./herb";
import { CLAIRE_FACE_PALETTE, CLAIRE_FACE_ROWS, CLAIRE_PALETTE, CLAIRE_ROWS } from "./claire";
import { UMBRELLA_PALETTE, UMBRELLA_ROWS } from "./umbrella";
import { BOWGUN_ROWS, HANDGUN_ROWS, ITEM_PALETTE, LAUNCHER_ROWS, LIGHTER_ROWS, SPRAY_ROWS } from "./items";
import { Glint, Scanlines, Twinkles, TypeCursor } from "./pieces";

const SCREEN_AT = 0.15;
const SAVED = "Your game has been saved.";
const SAVED_AT = 0.9;
const SAVED_PER_LETTER = 0.06;
const LOG_PER_LETTER = 0.03;
const PARTNER_LINE = "Every run is better with the right co-op partner.";
// the second line waits for the first, the way a typewriter only prints one line at a time
const PARTNER_AT = SAVED_AT + SAVED.length * SAVED_PER_LETTER + 0.3;
const TYPED_AT = PARTNER_AT + PARTNER_LINE.length * LOG_PER_LETTER;
const SETTLED_MS = Math.round(TYPED_AT * 1000) + 150;
// she shows up in the viewer a beat after the screen powers on
const CLAIRE_AT = 0.55;

// the RE2 inventory palette: navy screen, steel bevels, phosphor green readouts, and the warm red of her jacket
const JACKET_RED = "#c0392b";
const SCREEN_NAVY = "#14173c";
const SLOT_NAVY = "#1c2160";
const PANEL_GREEN = "#14301f";
const READOUT_GREEN = "#7dff7a";
const BEVEL = "border-2 border-[#9aa0c4] shadow-[inset_0_0_0_2px_#0a0c24]";
const TABS = ["File", "Map", "Item", "Exit"];
// the heartbeat line on the condition monitor, flat, a spike, flat again
const ECG = "M0 14 H18 L21 14 L23 4 L26 19 L28 14 H40 L42 12 L44 14 H60";
// the bag: the gear she carries through Raccoon City with the red cursor on her grenade launcher, the logo, and one
// slot left free for whatever the next room hides
const SLOTS = [
  { name: "launcher", rows: LAUNCHER_ROWS, palette: ITEM_PALETTE, count: 6, isSelected: true },
  { name: "handgun", rows: HANDGUN_ROWS, palette: ITEM_PALETTE, count: 15 },
  { name: "bowgun", rows: BOWGUN_ROWS, palette: ITEM_PALETTE, count: 18 },
  { name: "herb", rows: HERB_ROWS, palette: HERB_PALETTE, count: 3 },
  { name: "spray", rows: SPRAY_ROWS, palette: ITEM_PALETTE, count: null },
  { name: "lighter", rows: LIGHTER_ROWS, palette: ITEM_PALETTE, count: null },
  { name: "umbrella", rows: UMBRELLA_ROWS, palette: UMBRELLA_PALETTE, count: null },
  { name: "empty" },
];

/** Her portrait in the top corner with her name over it, the way the status screen says who you're playing as. */
const Portrait = () => (
  <div className={`flex flex-col self-start ${BEVEL} bg-black`}>
    <p className="border-b-2 border-[#9aa0c4] bg-[#0f2a1a] px-2 py-0.5 text-center text-xs tracking-[0.2em] text-[#d9f5d0] uppercase">Claire</p>
    <div className="relative overflow-hidden">
      <PixelArt rows={CLAIRE_FACE_ROWS} palette={CLAIRE_FACE_PALETTE} className="block h-[min(22vw,8.5rem)] w-auto" />
      <Glint startAt={CLAIRE_AT + 0.8} />
    </div>
  </div>
);

/** The condition monitor: a heartbeat sweeping across a green grid, and the word every survivor hopes to read. */
const Condition = () => (
  <div className={`relative flex min-w-0 flex-col justify-between ${BEVEL} p-2`} style={{ background: PANEL_GREEN }}>
    {/* the sweep uncovers the line left to right in steps, then starts over like the monitor in the game */}
    <motion.div
      initial={{ clipPath: "inset(0 100% 0 0)" }}
      animate={{ clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"] }}
      // a touch quicker than a resting heart, she has that effect
      transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 0.15, ease: pixelSteps(14) }}
    >
      <svg viewBox="0 0 60 20" className="block h-[min(10vw,3.5rem)] w-full" preserveAspectRatio="none">
        <path d={ECG} fill="none" stroke={READOUT_GREEN} strokeWidth="2" strokeLinejoin="bevel" vectorEffect="non-scaling-stroke" />
      </svg>
    </motion.div>
    <div className="flex items-end justify-between gap-2">
      <p className="text-[10px] tracking-[0.2em] text-[#9aa0c4] uppercase">Condition</p>
      <p className="text-[clamp(1.1rem,4vw,1.6rem)] leading-none" style={{ color: READOUT_GREEN }}>
        Fine
      </p>
    </div>
  </div>
);

/** The menu tabs across the top, Item lit since that's the page we're on. */
const Tabs = () => (
  <div className={`col-span-2 flex justify-between gap-1 ${BEVEL} bg-[#0a0c24] px-2 py-1 text-[clamp(0.7rem,2.6vw,0.95rem)] tracking-[0.15em] uppercase sm:col-span-1 sm:flex-col sm:justify-center`}>
    {TABS.map((tab) => (
      <span key={tab} className={tab === "Item" ? "text-[#ff5a4a]" : "text-[#5d6290]"}>
        {tab}
      </span>
    ))}
  </div>
);

/** One square of the bag, with its count in the corner when it stacks and the blinking red cursor when it's picked. */
const Slot = ({ item }) => (
  <div className={`relative grid aspect-square place-items-center ${BEVEL}`} style={{ background: SLOT_NAVY }}>
    {item.rows && <PixelArt rows={item.rows} palette={item.palette} className="size-[70%]" />}
    {item.isSelected && (
      <motion.span
        className="pointer-events-none absolute -inset-0.5 border-[3px] border-[#ff3b30]"
        animate={{ opacity: [1, 1, 0.35, 0.35] }}
        transition={{ duration: 0.9, repeat: Infinity, times: [0, 0.5, 0.51, 1], ease: "linear" }}
      />
    )}
    {item.count && <span className="absolute bottom-0.5 left-1 text-xs leading-none" style={{ color: READOUT_GREEN }}>{item.count}</span>}
  </div>
);

/** The big viewer in the middle, where the inventory shows off whatever is selected. Today that's her, lit warm. */
const Viewer = () => (
  <div className={`grid min-h-0 place-items-center ${BEVEL} p-3`} style={{ background: PANEL_GREEN }}>
    <div
      className="relative grid place-items-center overflow-hidden border-4 border-[#e8e8f0] px-14 py-3"
      style={{ background: `${easedGlow(JACKET_RED, { strength: 0.55, shape: "ellipse", reach: 70 })}, #0b1a4a` }}
    >
      <Twinkles startAt={CLAIRE_AT + 0.6} />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [10, 0, -1, 0] }}
        transition={{
          opacity: { duration: 0.5, delay: CLAIRE_AT, ease: pixelSteps(4) },
          // a slow breath once she's there, one pixel up and back
          y: { duration: 3, delay: CLAIRE_AT, times: [0, 0.15, 0.6, 1], repeat: Infinity, repeatDelay: 0.2, ease: pixelSteps(6) },
        }}
      >
        <PixelArt
          rows={CLAIRE_ROWS}
          palette={CLAIRE_PALETTE}
          className="block h-[min(26vh,20rem)] w-auto sm:h-[min(46vh,22rem)]"
          style={{ filter: "drop-shadow(0 0 10px rgb(255 160 170 / 0.35))" }}
        />
      </motion.div>
    </div>
  </div>
);

/** The text box under the viewer, typed out and left on the screen. */
const Caption = () => (
  <div className={`${BEVEL} bg-[#0a0c24] px-4 py-3 text-[clamp(0.85rem,3.2vw,1.15rem)] leading-snug tracking-wide text-[#eef0ff] text-pretty`}>
    <p>
      <TypedText text={SAVED} startAt={SAVED_AT} perLetter={SAVED_PER_LETTER} />
    </p>
    <p className="mt-1 text-[#c8cbe8]">
      <TypedText text={PARTNER_LINE} startAt={PARTNER_AT} perLetter={LOG_PER_LETTER} />
      <TypeCursor startAt={TYPED_AT} />
    </p>
  </div>
);

/** The save room, told as the RE2 inventory: her portrait and condition up top, her in the viewer, the bag beside it. */
const SaveRoom = ({ onDone }) => {
  useMomentLength(SETTLED_MS, onDone);
  return (
    <EffectLayer background="#000" className="flex items-center justify-center px-3 pt-20 pb-28" fade={0.6}>
      {/* the screen powers on like an old CRT: a bright line that opens up into the picture */}
      <motion.div
        className={`relative grid w-[min(96vw,46rem)] gap-2 p-2 font-pixel ${BEVEL}`}
        style={{ background: SCREEN_NAVY }}
        initial={{ opacity: 0, scaleY: 0.02, filter: "brightness(3)" }}
        animate={{ opacity: 1, scaleY: [0.02, 0.02, 1], filter: ["brightness(3)", "brightness(3)", "brightness(1)"] }}
        transition={{ duration: 0.45, delay: SCREEN_AT, times: [0, 0.3, 1], ease: pixelSteps(5) }}
      >
        <Scanlines startAt={SCREEN_AT + 0.45} />
        <div className="grid grid-cols-[auto_1fr] gap-2 sm:grid-cols-[auto_1fr_auto]">
          <Portrait />
          <Condition />
          <Tabs />
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="flex min-w-0 flex-col gap-2">
            <Viewer />
            <Caption />
          </div>
          <div className="grid grid-cols-8 gap-1 sm:w-36 sm:grid-cols-2 sm:content-start sm:gap-1.5">
            {SLOTS.map((item) => (
              <Slot key={item.name} item={item} />
            ))}
          </div>
        </div>
      </motion.div>
    </EffectLayer>
  );
};

export default SaveRoom;
