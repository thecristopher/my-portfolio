import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

// it waits for her to hit the floor before it shows, so the fall plays out first
const SHOWS_AFTER = 1.2;

/**
 * The screen the first Resident Evil greets a death with, low in the lane under the socials: YOU DIED in blood red,
 * and the way back in.
 * @param {{ onRetry: () => void }} props onRetry starts the fight over at full health
 */
const Continue = ({ onRetry }) => (
  <motion.div
    className="absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-3 text-center sm:bottom-10"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: SHOWS_AFTER, duration: 0.8 }}
  >
    <p className="font-pixel text-3xl tracking-[0.3em] text-[#c8161d] drop-shadow-[0_2px_12px_rgba(200,22,29,0.45)] sm:text-5xl">YOU DIED</p>
    <button
      type="button"
      onClick={onRetry}
      className="font-pixel pointer-events-auto flex items-center gap-2 rounded-full border border-[#c8161d]/60 bg-[#14070a]/90 px-5 py-2.5 text-sm tracking-[0.18em] text-[#ffd9d6] uppercase shadow-lg transition-colors hover:bg-[#c8161d] hover:text-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      <RotateCcw size={14} aria-hidden="true" />
      Try again
    </button>
  </motion.div>
);

export default Continue;
