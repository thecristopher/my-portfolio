import { AnimatePresence, motion } from "framer-motion";
import { energyLeft, huntBriefing } from "./actions";

/**
 * The mission over the orbit, in Super Metroid's HUD style: a larva is loose among the tools, its energy left, and how
 * to hurt it, so anyone scrolling by knows there's something to hunt. It turns into the win once the larva is down.
 * @param {{ hunt: { hits: number, isDefeated: boolean } }} props
 */
const MissionBrief = ({ hunt }) => {
  const { title, hint } = huntBriefing(hunt);
  return (
    <div className="font-pixel pointer-events-none absolute bottom-full left-1/2 mb-3 flex -translate-x-1/2 flex-col items-center gap-1 text-center uppercase">
      <AnimatePresence mode="wait">
        <motion.p
          key={title}
          role="status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="flex items-center gap-3 rounded-full bg-[#0b1430] px-4 py-1.5 text-xs tracking-[0.2em] whitespace-nowrap text-[#9be76a] shadow-lg sm:text-sm"
        >
          {/* the warning light blinks while the larva is loose, like the low energy alarm */}
          {!hunt.isDefeated && <span className="size-2 animate-pulse rounded-full bg-[#ff4d6d]" aria-hidden="true" />}
          {title}
          <span className="flex gap-1" aria-label={`${energyLeft(hunt.hits).filter(Boolean).length} energy left`}>
            {energyLeft(hunt.hits).map((isLeft, index) => (
              <span key={index} className={`size-2.5 rounded-sm transition-colors ${isLeft ? "bg-[#ff4d6d]" : "bg-white/20"}`} />
            ))}
          </span>
        </motion.p>
      </AnimatePresence>
      {hint && <p className="text-[10px] tracking-[0.18em] text-faint sm:text-xs">{hint}</p>}
    </div>
  );
};

export default MissionBrief;
