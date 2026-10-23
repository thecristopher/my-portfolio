import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { BAT_PATH, SIGNAL_YELLOW } from "./helpers";

/** The bat symbol on its yellow oval, the one Gotham shines on the clouds. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("bat");

  return (
    <RelicButton id="bat" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        <ellipse cx="8" cy="8" rx="7.6" ry="4.6" fill={SIGNAL_YELLOW} stroke="#111111" strokeWidth="0.6" />
        <path d={BAT_PATH} fill="#0a0a0d" transform="translate(1.8 4.9) scale(0.124)" />
      </svg>
    </RelicButton>
  );
};
