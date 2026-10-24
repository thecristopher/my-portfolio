import PixelArt from "../../PixelArt";
import { ovalRows } from "./helpers";
import { BALL_FRAMES, BALL_PALETTE, PLATFORM_PALETTE } from "./sprites";

/** Draws prepared sprite paths with crisp square pixels. */
export const PixelPaths = ({ paths }) => paths.map(({ color, d }) => <path key={color} d={d} fill={color} />);

/** The Poké Ball in one of its poses, sized by its className. */
export const PokeBallSprite = ({ frame = "up", className = "" }) => (
  <PixelArt rows={BALL_FRAMES[frame]} palette={BALL_PALETTE} className={className} />
);

const PLATFORM_ROWS = ovalRows(40, 10);

/** A grass battle platform, the flat oval every Gen 3 Pokémon stands on. */
export const Platform = ({ className = "" }) => (
  <PixelArt rows={PLATFORM_ROWS} palette={PLATFORM_PALETTE} className={`absolute ${className}`} />
);
