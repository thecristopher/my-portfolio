import { useMemo } from "react";
import { pixelsToPaths, spriteToPixels } from "../../../actions";

/**
 * A piece of pixel art from text rows, drawn as crisp svg squares at any size.
 * @param {{ art: { rows: string[], palette: object }, pixel?: number, palette?: object, className?: string, style?: object }} props
 *   pixel is how many css px each art pixel takes, palette overrides the art's own colors
 */
const PixelArt = ({ art, pixel = 3, palette, className = "", style }) => {
  const paths = useMemo(() => pixelsToPaths(spriteToPixels(art.rows, palette ?? art.palette)), [art, palette]);
  const width = art.rows[0].length;
  const height = art.rows.length;
  return (
    <svg
      width={width * pixel}
      height={height * pixel}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      className={`block overflow-visible ${className}`}
      style={style}
      aria-hidden="true"
    >
      {paths.map(({ color, d }) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  );
};

export default PixelArt;
