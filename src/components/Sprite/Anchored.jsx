import Sprite from ".";

/**
 * A sprite drawn so its sheet's anchor lands on the spot where it's placed, like her feet on the ground, and mirrored
 * around that spot when it faces left, so turning around never shifts it sideways.
 * @param {{ sheet: object, animation: string, scale: number, facing?: "left" | "right", distance?: number, onEnd?: () => void }} props
 *   sheet needs an anchor in sprite px from its cell's top left
 */
const AnchoredSprite = ({ sheet, animation, scale, facing = "right", distance = 0, onEnd }) => (
  <span className="absolute top-0 left-0 block size-0" style={{ transform: facing === "left" ? "scaleX(-1)" : undefined }} aria-hidden="true">
    <span className="absolute block" style={{ left: -sheet.anchor.x * scale, top: -sheet.anchor.y * scale }}>
      <Sprite sheet={sheet} animation={animation} scale={scale} distance={distance} onEnd={onEnd} />
    </span>
  </span>
);

export default AnchoredSprite;
