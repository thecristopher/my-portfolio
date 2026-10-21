import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { Die } from "./Die";
import { D20_GOLD, PERSUASION_DC, faceToShow, lastFace } from "./helpers";

const VELVET = "#3b1230";
const VELVET_LIGHT = "#5a1e48";

// the little velvet cushion the die rests on, gold piping around the top
const Cushion = () => (
  <svg viewBox="0 0 80 22" className="-mt-2 w-20" aria-hidden="true">
    <path d="M6 8 Q40 -2 74 8 L70 18 Q40 24 10 18 Z" fill={VELVET} />
    <ellipse cx="40" cy="8" rx="34" ry="5" fill={VELVET_LIGHT} />
    <ellipse cx="40" cy="8" rx="34" ry="5" fill="none" stroke={D20_GOLD} strokeWidth="1" />
    <ellipse cx="40" cy="21" rx="30" ry="1.5" fill="black" opacity="0.35" />
  </svg>
);

/**
 * An ornate gold d20 resting on velvet, waiting for a persuasion check. Rolled once, it keeps showing the face it
 * last landed on.
 */
export const Trigger = ({ className = "" }) => {
  const { isFound, touch } = useRelic("d20");
  const face = faceToShow(isFound, lastFace.use());
  // untouched it sits a little dull, rolled it shines in full gold
  const shine = isFound ? `drop-shadow(0 0 8px ${D20_GOLD}aa)` : "saturate(0.6) brightness(0.8)";

  return (
    <RelicButton id="d20" isFound={isFound} onTouch={() => touch()} className={className} labelSide="top">
      <span className="flex flex-col items-center" aria-hidden="true">
        <Die face={face} className="relative z-10 w-16 transition-[filter] duration-700" style={{ filter: shine }} />
        <Cushion />
        <span className="mt-1 font-display text-[10px] tracking-[0.18em] whitespace-nowrap" style={{ color: D20_GOLD }}>
          Persuasion · DC {PERSUASION_DC}
        </span>
      </span>
    </RelicButton>
  );
};
