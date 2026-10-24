import PixelArt from "../../PixelArt";
import { FLAMEL_PALETTE, FLAMEL_ROWS } from "./flamel";

/** The Flamel cross from Ed's coat as a sprite: wings, cross, crown and the serpent coiled up the post. */
export const FlamelSprite = ({ className = "", style }) => <PixelArt rows={FLAMEL_ROWS} palette={FLAMEL_PALETTE} className={className} style={style} />;
