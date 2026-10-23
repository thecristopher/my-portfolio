import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";

const PUZZLE_GOLD = "#d9b04a";
const ENGRAVING = "#3a2a08";

/** The Millennium Puzzle, an upside down pyramid with the eye on its face, at the start of the deck. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("magician");

  return (
    <RelicButton id="magician" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        <path d="M1 2 H15 L8 15 Z" fill={PUZZLE_GOLD} stroke="#8a6a1f" strokeWidth="0.5" strokeLinejoin="round" />
        {/* the eye of Horus: the lid, the pupil and the mark falling from it */}
        <path d="M4.8 5.6 Q8 3.4 11.2 5.6 Q8 7.8 4.8 5.6 Z" fill="none" stroke={ENGRAVING} strokeWidth="0.6" />
        <circle cx="8" cy="5.6" r="1" fill={ENGRAVING} />
        <path d="M6.6 7 L6.2 9.4" stroke={ENGRAVING} strokeWidth="0.5" strokeLinecap="round" />
      </svg>
    </RelicButton>
  );
};
