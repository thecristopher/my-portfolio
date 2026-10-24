import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import { FlamelSprite } from "./Emblem";

/** The Flamel cross from Ed's coat, pinned where the reading line ends. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("alchemy");

  return (
    <RelicButton id="alchemy" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <FlamelSprite className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
