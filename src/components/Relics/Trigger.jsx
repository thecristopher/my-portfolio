import { EMBLEM_CLASS, RelicButton } from "./shared";
import { useRelic } from "./useRelic";

/**
 * A relic hidden on the page: its emblem inside the nearly invisible button that plays its moment.
 * @param {{ id: string, emblem: (state: { isFound: boolean, className: string }) => React.ReactNode, className?: string, zoom?: number }} props
 *   emblem draws the relic, and can change once it's been found (a rolled die, a snapped twig)
 */
const Trigger = ({ id, emblem, className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic(id);
  return (
    <RelicButton id={id} isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      {emblem({ isFound, className: EMBLEM_CLASS })}
    </RelicButton>
  );
};

export default Trigger;
