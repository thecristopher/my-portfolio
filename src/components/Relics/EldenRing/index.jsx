import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { GRACE_GOLD, GRACE_SIGIL } from "./grace";

/** The Elden Ring sigil in grace gold, where the page signs off. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("grace");

  return (
    <RelicButton id="grace" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        {GRACE_SIGIL.map((path) => (
          <path key={path} d={path} fill="none" stroke={GRACE_GOLD} strokeWidth="1" strokeLinecap="round" />
        ))}
      </svg>
    </RelicButton>
  );
};
