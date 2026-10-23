import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { HAORI_GREEN } from "./helpers";

const BLADE_BLACK = "#1e1f24";
const EDGE_STEEL = "#c7ccd6";

/** Tanjiro's black Nichirin blade, resting at an angle by the certifications. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("hanafuda");

  return (
    <RelicButton id="hanafuda" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        <g transform="rotate(-45 8 8)">
          {/* the blade, curving up to the tip, with the steel edge along its belly */}
          <path d="M5.6 7.2 H13.6 Q15.6 7.3 16 8.2 L5.6 8.8 Z" fill={BLADE_BLACK} />
          <path d="M5.6 8.7 L15.8 8.2" stroke={EDGE_STEEL} strokeWidth="0.35" />
          {/* the guard and the wrapped handle */}
          <ellipse cx="5.1" cy="8" rx="0.7" ry="2.2" fill="#111111" stroke="#6b6b6b" strokeWidth="0.25" />
          <rect x="0.2" y="7.2" width="4.4" height="1.6" rx="0.4" fill="#141414" />
          {[1.1, 2.3, 3.5].map((x) => (
            <path key={x} d={`M${x} 7.3 L${x + 0.5} 8 L${x} 8.7 L${x - 0.5} 8 Z`} fill={HAORI_GREEN} />
          ))}
        </g>
      </svg>
    </RelicButton>
  );
};
