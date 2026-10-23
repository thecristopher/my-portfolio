import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { TRIFORCE_PIECES, ZELDA_GOLD } from "./pieces";

/** The Triforce, past the last side quest. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("triforce");

  return (
    <RelicButton id="triforce" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        {TRIFORCE_PIECES.map((path) => (
          <path key={path} d={path} fill={ZELDA_GOLD} stroke="#a8822a" strokeWidth="0.4" strokeLinejoin="round" />
        ))}
      </svg>
    </RelicButton>
  );
};
