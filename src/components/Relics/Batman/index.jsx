import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { ovalRows, stampCentered } from "./helpers";
import { SIGNAL_PALETTE, SMALL_BAT_ROWS } from "./sprites";

// small enough to stay crisp at the statusline's zoom, where the whole emblem is about twenty screen pixels
const EMBLEM_ROWS = stampCentered(ovalRows(22, 14), SMALL_BAT_ROWS);

/** The bat symbol on its yellow oval in 16 bit, the one Gotham shines on the clouds. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("bat");

  return (
    <RelicButton id="bat" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={EMBLEM_ROWS} palette={SIGNAL_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
