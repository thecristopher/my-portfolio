import { RelicButton, EMBLEM_CLASS } from "../shared";
import { useRelic } from "../useRelic";
import PixelArt from "../../PixelArt";
import { SPIDER_RED } from "./helpers";

// the spider from the chest of the suit on a red disc, one character per pixel
const EMBLEM_ROWS = [
  ".....KKKKKK.....",
  "...KKRRRRRRKK...",
  "..KRhRRRRRRRrK..",
  ".KRhKRRRRRRKRrK.",
  ".KRRRKRKKRKRRrK.",
  "KRRRRRKKKKRRRRrK",
  "KRKKKRRKKRRKKKrK",
  "KRRRRKKKKKKRRRrK",
  "KRRRRRKKKKRRRRrK",
  "KRKKKRKKKKRKKKrK",
  "KRRRRKKKKKKRRRrK",
  ".KRRKRKKKKRKRrK.",
  ".KRKRRRKKRRRKrK.",
  "..KRRRRRRRRRrK..",
  "...KKrrrrrrKK...",
  ".....KKKKKK.....",
];
const EMBLEM_PALETTE = { K: "#111111", R: SPIDER_RED, r: "#a01f28", h: "#ff7a6e" };

/** The black spider from Spider-Man's chest on a red disc, clinging to the corner of the degree. */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("spider");

  return (
    <RelicButton id="spider" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <PixelArt rows={EMBLEM_ROWS} palette={EMBLEM_PALETTE} className={EMBLEM_CLASS} />
    </RelicButton>
  );
};
