import { spritePaths } from "./helpers";
import { BALL_PALETTE, POKE_BALL } from "./sprites";

/** Draws prepared sprite paths with crisp square pixels. */
export const PixelPaths = ({ paths }) => paths.map(({ color, d }) => <path key={color} d={d} fill={color} />);

const BALL_PATHS = spritePaths(POKE_BALL, BALL_PALETTE);

/** The Poké Ball's pixels on a 9 by 9 grid, for dropping into another sprite. */
export const BallPixels = () => <PixelPaths paths={BALL_PATHS} />;

/** The Poké Ball as a crisp little sprite, sized by its className. */
export const PokeBallSprite = ({ className = "" }) => (
  <svg viewBox="0 0 9 9" shapeRendering="crispEdges" className={className} aria-hidden="true">
    <BallPixels />
  </svg>
);
