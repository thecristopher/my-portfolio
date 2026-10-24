import PixelArt from "../../PixelArt";
import { TWIG_PALETTE } from "./willow";

/**
 * One half of the willow, the same pixels whole or snapped.
 * @param {{ half: object, className?: string }} props one entry of TWIG_HALVES
 */
export const TwigHalf = ({ half, className = "" }) => <PixelArt rows={half.rows} palette={TWIG_PALETTE} className={className} />;
