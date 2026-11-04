import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useRelic } from "../useRelic";
import { RELICS } from "../../../lib/relics";
import { COMBO_MOVES, COMBO_WINDOW_MS, landHit } from "../../../lib/avatarCombo";

const { color: PINK } = RELICS.scott;
const COMBO_HITS = COMBO_MOVES.length;

// each hit knocks the photo a little further, the way a fighting game shakes the screen on a landed punch
const KNOCKBACK = [0, [0, -6, 5, -3, 0], [0, 9, -7, 4, 0], [0, -12, 10, -6, 0]];

// one pip per hit, lit as they land, so it's obvious the third one is what counts
const ComboPips = ({ hits }) => (
  <span
    className={`pointer-events-none absolute top-4 right-4 z-10 flex gap-1 transition-opacity duration-300 ${hits > 0 ? "opacity-100" : "opacity-0"}`}
    aria-hidden="true"
  >
    {Array.from({ length: COMBO_HITS }, (_, index) => (
      <span key={index} className="size-2 rounded-full border" style={{ borderColor: PINK, background: index < hits ? PINK : "transparent" }} />
    ))}
  </span>
);

/**
 * Player 1 is the guy in the photo: three quick pokes on it set off the K.O. Nothing says so. The combo pips only
 * show up once someone is already hitting it, the way a fighting game counts a combo.
 * @param {{ className?: string, children: React.ReactNode }} props the photo goes inside
 */
export const Trigger = ({ className = "", children }) => {
  const { touch } = useRelic("scott");
  const [hits, setHits] = useState(0);
  const clicks = useRef([]);
  const resetTimer = useRef(null);
  const shake = useAnimationControls();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const poke = () => {
    const combo = landHit(clicks.current, Date.now());
    clicks.current = combo.clicks;
    setHits(combo.hit);
    shake.start({ x: KNOCKBACK[Math.min(combo.hit, COMBO_HITS)], transition: { duration: 0.3 } });
    clearTimeout(resetTimer.current);
    // the pips empty on their own once the window closes, so a dropped combo never looks half done
    resetTimer.current = setTimeout(() => setHits(0), combo.hit >= COMBO_HITS ? 600 : COMBO_WINDOW_MS);
    if (combo.hit >= COMBO_HITS) touch();
  };

  return (
    <motion.div animate={shake} onClick={poke} className={`relative ${className}`} data-relic="scott">
      {children}
      <ComboPips hits={hits} />
    </motion.div>
  );
};
