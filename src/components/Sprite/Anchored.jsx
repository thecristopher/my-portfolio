import Sprite from ".";

/**
 * A sprite drawn so its sheet's anchor lands on the spot where it's placed, like feet on the ground, and mirrored
 * around that spot when it has to face the other way from its sheet, so turning around never shifts it sideways.
 * @param {{ sheet: object, animation: string, scale: number, facing?: "left" | "right", distance?: number, isPaused?: boolean, onEnd?: () => void }} props
 *   sheet needs an anchor in sprite px from its cell's top left, and says which way its frames face with faces,
 *   right when it doesn't say, isPaused holds the first frame
 */
const AnchoredSprite = ({ sheet, animation, scale, facing = "right", distance = 0, isPaused = false, onEnd }) => {
  const isMirrored = facing !== (sheet.faces ?? "right");
  return (
    <span className="absolute top-0 left-0 block size-0" style={{ transform: isMirrored ? "scaleX(-1)" : undefined }} aria-hidden="true">
      <span className="absolute block" style={{ left: -sheet.anchor.x * scale, top: -sheet.anchor.y * scale }}>
        <Sprite sheet={sheet} animation={animation} scale={scale} distance={distance} isPaused={isPaused} onEnd={onEnd} />
      </span>
    </span>
  );
};

export default AnchoredSprite;
