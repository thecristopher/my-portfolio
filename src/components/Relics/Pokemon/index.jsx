import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";

/** A Poké Ball beside the career log, waiting to be thrown. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("pokeball");

  return (
    <RelicButton id="pokeball" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        <path d="M1 8 A7 7 0 0 1 15 8 Z" fill="#e3350d" />
        <path d="M1 8 A7 7 0 0 0 15 8 Z" fill="#f5f5f5" />
        <circle cx="8" cy="8" r="7" fill="none" stroke="#111111" strokeWidth="0.9" />
        <path d="M1 8 H15" stroke="#111111" strokeWidth="1.1" />
        <circle cx="8" cy="8" r="2.1" fill="#f5f5f5" stroke="#111111" strokeWidth="0.9" />
      </svg>
    </RelicButton>
  );
};
