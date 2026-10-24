import { useMemo } from "react";
import PixelArt from "../../PixelArt";
import { D20_PALETTE, d20Rows } from "./helpers";

/**
 * The gold d20 as a 16 bit sprite: shaded facets, a dark outline and the face number in pixel digits on the front.
 * @param {{ face: number, size?: number, numberColor?: string, className?: string, style?: object, children?: React.ReactNode }} props
 *   size is the sprite's grid in pixels, small for the page and bigger for the moment. children lie on top of the die
 */
export const Die = ({ face, size = 24, numberColor = D20_PALETTE.n, className = "", style, children }) => {
  const rows = useMemo(() => d20Rows(size, face), [size, face]);
  const palette = useMemo(() => ({ ...D20_PALETTE, n: numberColor }), [numberColor]);

  return (
    <span className={`relative ${className}`} style={style}>
      <PixelArt rows={rows} palette={palette} className="block size-full" />
      {children}
    </span>
  );
};
