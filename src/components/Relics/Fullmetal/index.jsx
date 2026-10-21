import { useId } from "react";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { TransmutationCircle } from "./Circle";
import { ALCHEMY_BLUE, CHALK } from "./flamel";

// rough edges and little gaps in the stroke, the way chalk catches on a floor
const ChalkFilter = ({ id }) => (
  <svg className="absolute size-0" aria-hidden="true">
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="grain" />
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.6" result="rough" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.6" result="gaps" />
      <feComposite in="rough" in2="gaps" operator="in" />
    </filter>
  </svg>
);

/**
 * A transmutation circle chalked next to the philosophy, waiting for someone to clap. Once used, its lines keep glowing blue.
 */
export const Trigger = ({ className = "" }) => {
  const { isFound, touch } = useRelic("alchemy");
  // useId has characters a url(#id) reference chokes on
  const chalkId = `chalk-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const color = isFound ? ALCHEMY_BLUE : CHALK;

  return (
    <RelicButton id="alchemy" isFound={isFound} onTouch={() => touch()} className={className}>
      <ChalkFilter id={chalkId} />
      <TransmutationCircle
        color={color}
        strokeWidth={1.8}
        filter={`url(#${chalkId})`}
        className="block w-28 transition-[filter,opacity] duration-700"
        style={{ opacity: isFound ? 1 : 0.8, filter: isFound ? `drop-shadow(0 0 6px ${ALCHEMY_BLUE})` : "none" }}
      />
    </RelicButton>
  );
};
