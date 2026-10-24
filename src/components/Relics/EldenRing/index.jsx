import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { SIGIL_PALETTE, SIGIL_ROWS } from "./grace";

/** The Elden Ring sigil in grace gold, drawn in 16 bit pixels where the page signs off. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("grace");

  return (
    <RelicButton id="grace" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={SIGIL_ROWS} palette={SIGIL_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
