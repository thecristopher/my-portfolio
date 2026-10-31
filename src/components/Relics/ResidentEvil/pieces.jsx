import { motion } from "framer-motion";
import PixelArt from "../../PixelArt";
import { pixelSteps } from "../../../lib/motion";

// a four point twinkle, the sparkle every 16 bit game puts on something precious
const TWINKLE_ROWS = ["..w..", "..w..", "wwWww", "..w..", "..w.."];
const TWINKLE_PALETTE = { w: "#ffd6e0", W: "#ffffff" };
// where the twinkles sit around her in the viewer, in % of the viewer, and when each one blinks
const TWINKLES = [
  { left: "18%", top: "16%", delay: 0.2, size: "size-6" },
  { left: "78%", top: "24%", delay: 0.9, size: "size-4" },
  { left: "24%", top: "62%", delay: 1.5, size: "size-5" },
  { left: "74%", top: "70%", delay: 0.5, size: "size-6" },
  { left: "62%", top: "8%", delay: 1.2, size: "size-4" },
];

/** Little pixel sparkles blinking on and off around her, one after another. */
export const Twinkles = ({ startAt }) =>
  TWINKLES.map(({ left, top, delay, size }) => (
    <motion.span
      key={`${left}-${top}`}
      className={`pointer-events-none absolute ${size}`}
      style={{ left, top }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
      transition={{ duration: 1.1, delay: startAt + delay, repeat: Infinity, repeatDelay: 1.4, ease: pixelSteps(4) }}
    >
      <PixelArt rows={TWINKLE_ROWS} palette={TWINKLE_PALETTE} className="block size-full" />
    </motion.span>
  ));

/** The fine dark lines of an old CRT over the whole screen, and the flicker it gives when it powers on. */
export const Scanlines = ({ startAt }) => (
  <motion.span
    className="pointer-events-none absolute inset-0 z-10"
    style={{ background: "repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.22) 0 1px, transparent 1px 3px)" }}
    initial={{ opacity: 1 }}
    animate={{ opacity: [1, 0.4, 1, 0.7] }}
    transition={{ duration: 0.5, delay: startAt, ease: pixelSteps(4) }}
  />
);

/** The block cursor that blinks after the last line, waiting for the next thing to say. */
export const TypeCursor = ({ startAt }) => (
  <motion.span
    className="ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-[#eef0ff]"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 1, 0] }}
    transition={{ duration: 1, delay: startAt, repeat: Infinity, times: [0, 0.01, 0.5, 0.51], ease: "linear" }}
  />
);
