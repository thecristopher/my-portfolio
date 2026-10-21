import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { UMBRELLA_RED, UMBRELLA_WEDGES } from "./umbrella";

const BODY = "#2b2b2e";
const BODY_LIGHT = "#3b3b40";
const PAPER = "#ece6d6";

/**
 * The save room typewriter at the end of the career. A sheet waits in the roller, and once you've saved, the
 * Umbrella logo is stamped on it.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("umbrella");

  return (
    <RelicButton id="umbrella" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 72 60" className="w-24 overflow-visible sm:w-28" aria-hidden="true">
        {/* the sheet in the roller */}
        <rect x="22" y="2" width="28" height="26" rx="1" fill={PAPER} />
        {isFound ? (
          <g transform="translate(29 7) scale(0.85)">
            {UMBRELLA_WEDGES.map(({ path, isRed }) => (
              <path key={path} d={path} fill={isRed ? UMBRELLA_RED : "#f4f1ea"} stroke="#999" strokeWidth="0.2" />
            ))}
          </g>
        ) : (
          [9, 13, 17, 21].map((y) => <rect key={y} x="26" y={y} width={y === 21 ? 12 : 20} height="1.2" fill="#b9b1a0" />)
        )}
        {/* roller and carriage */}
        <rect x="12" y="24" width="48" height="7" rx="3.5" fill={BODY_LIGHT} />
        <circle cx="10" cy="27.5" r="3.5" fill={BODY} />
        <circle cx="62" cy="27.5" r="3.5" fill={BODY} />
        {/* the body and its keys */}
        <path d="M8 34 H64 L68 54 H4 Z" fill={BODY} />
        {[0, 1, 2].map((row) =>
          Array.from({ length: 9 - row }, (_, key) => (
            <circle key={`${row}-${key}`} cx={16 + row * 2.5 + key * 5} cy={39 + row * 5} r="1.6" fill="#d8d2c4" />
          ))
        )}
        <rect x="24" y="51" width="24" height="2" rx="1" fill="#d8d2c4" />
        <ellipse cx="36" cy="57" rx="32" ry="2.5" fill="black" opacity="0.35" />
      </svg>
    </RelicButton>
  );
};
