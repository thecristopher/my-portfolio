import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { SPIDER_RED } from "./helpers";

// the spider from the chest of the suit: two body segments and four legs a side, on a 16 unit grid
const SPIDER_LEGS = [
  "M6.6 6.6 L3.5 3.8 L2.6 1",
  "M9.4 6.6 L12.5 3.8 L13.4 1",
  "M6.3 8.2 L2.6 7.2 L1 9",
  "M9.7 8.2 L13.4 7.2 L15 9",
  "M6.4 9.8 L3.2 11.6 L2.2 15",
  "M9.6 9.8 L12.8 11.6 L13.8 15",
  "M6.9 11.4 L5 13.5 L4.6 15.4",
  "M9.1 11.4 L11 13.5 L11.4 15.4",
];

/** The black spider from Spider-Man's chest on a red disc, clinging to the corner of the degree. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("spider");

  return (
    <RelicButton id="spider" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        <circle cx="8" cy="8" r="7.6" fill={SPIDER_RED} stroke="#111111" strokeWidth="0.5" />
        <g transform="translate(2.4 2.2) scale(0.7)">
          {SPIDER_LEGS.map((leg) => (
            <path key={leg} d={leg} fill="none" stroke="#111111" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          <ellipse cx="8" cy="6.4" rx="1.5" ry="1.7" fill="#111111" />
          <ellipse cx="8" cy="10.2" rx="1.9" ry="2.6" fill="#111111" />
        </g>
      </svg>
    </RelicButton>
  );
};
