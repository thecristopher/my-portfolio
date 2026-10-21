import { useEffect, useRef, useState } from "react";
import PixelAvatar from "../../PixelAvatar";
import { useRelic } from "../useRelic";
import { RELICS } from "../../../lib/relics";
import { COMBO_HITS, COMBO_WINDOW_MS, registerPoke } from "./helpers";

const { color: PINK, franchise } = RELICS.scott;

// one pip per hit in the combo, lit as they land so it's obvious the third one is what counts
const ComboPips = ({ hits }) => (
  <span className="flex gap-0.5">
    {Array.from({ length: COMBO_HITS }, (_, index) => (
      <span
        key={index}
        className="size-1.5 rounded-[1px] border transition-colors duration-150"
        style={{ borderColor: PINK, background: index < hits ? PINK : "transparent" }}
      />
    ))}
  </span>
);

/**
 * The hero's pixel avatar is the relic: three pokes in a row land a combo and set off the K.O. Nothing says so.
 * The combo pips only show up once someone is already hitting him, the way a fighting game counts a combo.
 * @param {{ className?: string, entersAfterMs?: number, firstWaveAfterMs?: number }} props sizing and timing for the avatar
 */
export const Trigger = ({ className = "", entersAfterMs, firstWaveAfterMs }) => {
  const { isFound, touch } = useRelic("scott");
  const pokes = useRef([]);
  const [hits, setHits] = useState(0);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const countPoke = () => {
    const combo = registerPoke(pokes.current, performance.now());
    pokes.current = combo.pokes;
    setHits(combo.isCombo ? COMBO_HITS : combo.pokes.length);
    clearTimeout(resetTimer.current);
    // the pips empty on their own once the window closes, so a dropped combo never looks half done
    resetTimer.current = setTimeout(() => {
      pokes.current = [];
      setHits(0);
    }, combo.isCombo ? 600 : COMBO_WINDOW_MS);
    if (combo.isCombo) touch();
  };

  return (
    <span className="inline-flex flex-col items-center gap-3" data-relic="scott">
      <PixelAvatar className={className} entersAfterMs={entersAfterMs} firstWaveAfterMs={firstWaveAfterMs} onPoke={countPoke} />
      <span
        className={`pointer-events-none inline-flex items-center gap-1.5 font-mono text-[10px] whitespace-nowrap transition-opacity duration-300 ${hits > 0 ? "opacity-100" : "opacity-0"}`}
        aria-hidden="true"
      >
        <ComboPips hits={hits} />
        {isFound && <span style={{ color: PINK }}>{franchise}</span>}
      </span>
    </span>
  );
};
