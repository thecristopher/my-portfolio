import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { BALL_PALETTE, POKE_BALL } from "./sprites";

/** A Poké Ball beside the career log, waiting to be thrown. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("pokeball");

  return (
    <RelicButton id="pokeball" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={POKE_BALL} palette={BALL_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
