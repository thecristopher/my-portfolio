import { pixelsToPaths } from "../../actions";
import { layOutPixelText, outlineCells } from "./actions";

const INK = "#140812";
const SHADOW = "#ff5ca8";
const FILL = "#ffe066";

const paths = (cells, color, shift = 0) => pixelsToPaths(cells.map(({ x, y }) => ({ x: x + shift, y: y + shift, color })));

/**
 * Text in the arcade font, drawn as crisp pixels with a dark outline and a pink drop shadow so it reads over anything.
 * Meant for the eye only: whatever it says should also be said to screen readers some other way.
 * @param {{ text: string, pixelSize?: number, fill?: string, className?: string }} props pixelSize is how many screen px each pixel takes
 */
const PixelText = ({ text, pixelSize = 4, fill = FILL, className = "" }) => {
  const { width, height, cells } = layOutPixelText(text);
  // one pixel of room on every side for the outline, and one more on the right and bottom for the shadow
  const viewWidth = width + 3;
  const viewHeight = height + 3;
  const layers = [...paths(outlineCells(cells), INK, 1), ...paths(cells, SHADOW, 2), ...paths(cells, fill, 1)];

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      width={viewWidth * pixelSize}
      height={viewHeight * pixelSize}
      shapeRendering="crispEdges"
      className={`block overflow-visible ${className}`}
      aria-hidden="true"
    >
      {layers.map(({ color, d }) => (
        <path key={color} d={d} fill={color} />
      ))}
    </svg>
  );
};

export default PixelText;
