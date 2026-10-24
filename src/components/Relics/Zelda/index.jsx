import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { TRIFORCE_PALETTE, TRIFORCE_ROWS } from "./pieces";

/** The Triforce, past the last side quest. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("triforce");

  return (
    <RelicButton id="triforce" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={TRIFORCE_ROWS} palette={TRIFORCE_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
