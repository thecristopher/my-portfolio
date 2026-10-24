import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { AangArrow } from "./Emblems";

/** Aang's airbender arrow, pointing down the way it runs onto his forehead. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("airbender");

  return (
    <RelicButton id="airbender" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <AangArrow className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
