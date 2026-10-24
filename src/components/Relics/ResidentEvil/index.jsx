import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { UMBRELLA_PALETTE, UMBRELLA_ROWS } from "./umbrella";

/** The Umbrella Corporation logo, red and white wedges in pixels, at the end of the career. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("umbrella");

  return (
    <RelicButton id="umbrella" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={UMBRELLA_ROWS} palette={UMBRELLA_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
