import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { UMBRELLA_RED, UMBRELLA_WEDGES } from "./umbrella";

/** The Umbrella Corporation logo, red and white wedges, at the end of the career. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("umbrella");

  return (
    <RelicButton id="umbrella" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        {UMBRELLA_WEDGES.map(({ path, isRed }) => (
          <path key={path} d={path} fill={isRed ? UMBRELLA_RED : "#f4f1ea"} stroke="#999999" strokeWidth="0.2" />
        ))}
      </svg>
    </RelicButton>
  );
};
