import { AnimatePresence, motion } from "framer-motion";
import PixelArt from "./PixelArt";
import { CHEST_CLOSED, CHEST_OPEN, TWINKLE } from "./art";

const BURST_TWINKLES = [
  { x: -18, delay: 0 },
  { x: 4, delay: 0.12 },
  { x: 24, delay: 0.24 },
];

// the moment the lid flies open: a flash of light and a few twinkles floating up out of it
const Burst = () => (
  <>
    <motion.span
      initial={{ opacity: 0.9, scale: 0.4 }}
      animate={{ opacity: 0, scale: 2.4 }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="absolute -top-6 left-1/2 size-20 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#fff6c4,transparent_65%)]"
    />
    {BURST_TWINKLES.map((twinkle) => (
      <motion.span
        key={twinkle.x}
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: -46 }}
        transition={{ duration: 1.1, delay: twinkle.delay, ease: "easeOut" }}
        className="absolute top-0 left-1/2"
        style={{ marginLeft: twinkle.x }}
      >
        <PixelArt art={TWINKLE} pixel={2} />
      </motion.span>
    ))}
  </>
);

/**
 * The chest waiting at one stop of the career. It opens with a flash once Link reaches it, and the one for the title
 * I hold now keeps glowing after.
 * @param {{ isOpen: boolean, isFinal: boolean }} props
 */
const Chest = ({ isOpen, isFinal }) => (
  <div className="relative">
    {isOpen && isFinal && <span className="absolute -inset-6 animate-pulse rounded-full bg-[radial-gradient(circle,#ffd84a66,transparent_70%)]" aria-hidden="true" />}
    <AnimatePresence>{isOpen && <Burst key="burst" />}</AnimatePresence>
    <motion.div key={isOpen ? "open" : "closed"} initial={isOpen ? { y: -4 } : false} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 600, damping: 12 }}>
      <PixelArt art={isOpen ? CHEST_OPEN : CHEST_CLOSED} pixel={3} />
    </motion.div>
  </div>
);

export default Chest;
