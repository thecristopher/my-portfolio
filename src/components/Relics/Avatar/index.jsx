import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";

const ARROW_BLUE = "#3d8fe0";
const ARROW_EDGE = "#1f5fa8";

/** Aang's airbender arrow, pointing down the way it runs onto his forehead. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("airbender");

  return (
    <RelicButton id="airbender" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <svg viewBox="0 0 16 16" className={EMBLEM_CLASS} aria-hidden="true">
        <path d="M6.8 0.5 H9.2 V8 H13 L8 15.5 L3 8 H6.8 Z" fill={ARROW_BLUE} stroke={ARROW_EDGE} strokeWidth="0.5" strokeLinejoin="round" />
      </svg>
    </RelicButton>
  );
};
