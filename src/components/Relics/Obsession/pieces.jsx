import { BARK, BARK_DARK, WILLOW_GREEN } from "./willow";

/**
 * One half of the willow: the stem, a little fork and a leaf at its tip.
 * @param {{ half: object }} props one entry of TWIG_HALVES
 */
export const TwigHalf = ({ half }) => (
  <>
    <path d={half.stem} fill="none" stroke={BARK} strokeWidth="1.6" strokeLinecap="round" />
    <path d={half.stem} fill="none" stroke={BARK_DARK} strokeWidth="0.5" strokeLinecap="round" transform="translate(0 0.5)" />
    <path d={half.fork} fill="none" stroke={BARK} strokeWidth="0.9" strokeLinecap="round" />
    <path d={half.leaf} fill={WILLOW_GREEN} />
  </>
);
