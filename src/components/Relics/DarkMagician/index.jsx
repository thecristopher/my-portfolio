import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";

// the Millennium Puzzle, one character per pixel: lit gold on the left, shaded on the right, the eye engraved in the middle
const PUZZLE_ROWS = [
  "KKKKKKKKKKKKKKKK",
  "KYYYYYYYYYYYYYgK",
  "KYGGGGGGGGGGGGgK",
  ".KYGGGEEEEGGGgK.",
  ".KYGGEGEEGEGGgK.",
  "..KYGGEEEEGGgK..",
  "..KYGGGEGGGGgK..",
  "...KYGGEGGGgK...",
  "...KYGEEGGGgK...",
  "....KYGGGGgK....",
  "....KYGGGGgK....",
  ".....KYGGgK.....",
  ".....KYGGgK.....",
  "......KYgK......",
  "......KYgK......",
  ".......KK.......",
];

const PUZZLE_PALETTE = {
  K: "#3a2608", // outline
  Y: "#f6d46a", // lit gold
  G: "#d9b04a", // puzzle gold
  g: "#9c7424", // shaded gold
  E: "#3a2a08", // the eye of Horus engraving
};

/** The Millennium Puzzle, an upside down pyramid with the eye on its face, at the start of the deck. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("magician");

  return (
    <RelicButton id="magician" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={PUZZLE_ROWS} palette={PUZZLE_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
