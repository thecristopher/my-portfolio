import { useMemo } from "react";
import { pixelsToPaths, spriteToPixels } from "../../actions";

/**
 * A 16 bit sprite drawn from text rows, one character per pixel, as crisp svg squares that stay sharp at any size.
 * @param {{ rows: string[], palette: Record<string, string>, className?: string, style?: object }} props
 *   rows and palette work like the avatar's: "." and any character missing from the palette stay see through
 */
const PixelArt = ({ rows, palette, className = "", style }) => {
  const paths = useMemo(() => pixelsToPaths(spriteToPixels(rows, palette)), [rows, palette]);
  const width = Math.max(...rows.map((row) => row.length));

  return (
    <svg viewBox={`0 0 ${width} ${rows.length}`} shapeRendering="crispEdges" className={className} style={style} aria-hidden="true">
      {paths.map(({ color, d }) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  );
};

export default PixelArt;
