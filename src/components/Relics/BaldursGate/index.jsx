import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { Die } from "./Die";
import { faceToShow, lastFace } from "./helpers";

/** The gold d20 by the clock. Rolled once, it keeps showing the face it last landed on. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("d20");
  const face = faceToShow(isFound, lastFace.use());

  return (
    <RelicButton id="d20" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <Die face={face} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
