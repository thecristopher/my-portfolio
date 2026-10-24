import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { BLADE_PALETTE, BLADE_ROWS } from "./sprites";

/** Tanjiro's black Nichirin blade, resting at an angle by the certifications. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("hanafuda");

  return (
    <RelicButton id="hanafuda" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      {/* drawn on the diagonal pixel by pixel, rotating the sprite would smear its pixels */}
      <PixelArt rows={BLADE_ROWS} palette={BLADE_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
