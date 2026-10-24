import PixelArt from "../../PixelArt";
import { ARROW_PALETTE, ARROW_ROWS, EMBLEM_ROWS } from "./sprites";

const OUTLINE = "#0b1622";

/**
 * One nation's emblem as a pixel art sprite, in the nation's own three shades.
 * @param {{ nation: { id: string, color: string, light: string, dark: string }, className?: string, style?: object }} props
 */
export const NationEmblem = ({ nation, className = "", style }) => (
  <PixelArt
    rows={EMBLEM_ROWS[nation.id]}
    palette={{ K: OUTLINE, "#": nation.color, "+": nation.light, "-": nation.dark }}
    className={className}
    style={style}
  />
);

/**
 * Aang's arrow pointing down, the way it runs down his forehead.
 * @param {{ className?: string, style?: object }} props
 */
export const AangArrow = ({ className = "", style }) => <PixelArt rows={ARROW_ROWS} palette={ARROW_PALETTE} className={className} style={style} />;
