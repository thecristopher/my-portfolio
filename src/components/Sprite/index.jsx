import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { frameAtDistance, frameWindow, nextFrame, playLength } from "./actions";

// steps through an animation's frames on its own clock. anyone who asked for less movement gets the first frame held
// still, and a one shot still reports it finished after the time it would have taken, so whatever waits on it moves on.
// an animation played by distance has no clock, its frame comes from outside
const useFrame = (animation, onEnd) => {
  const [frame, setFrame] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const ended = useRef(onEnd);
  ended.current = onEnd;

  useEffect(() => {
    setFrame(0);
    if (animation.stride) return undefined;
    if (prefersReducedMotion) {
      if (animation.loop) return undefined;
      const timer = setTimeout(() => ended.current?.(), playLength(animation));
      return () => clearTimeout(timer);
    }
    let current = 0;
    const timer = setInterval(() => {
      const next = nextFrame(current, animation);
      current = next.frame;
      setFrame(next.frame);
      if (!next.isDone) return;
      clearInterval(timer);
      ended.current?.();
    }, 1000 / animation.fps);
    return () => clearInterval(timer);
  }, [animation, prefersReducedMotion]);

  return frame;
};

/**
 * One character from a sprite atlas playing one of its animations, pixels kept sharp at any scale.
 * @param {{ sheet: object, animation: string, scale?: number, isFlipped?: boolean, isSmooth?: boolean, onEnd?: () => void, distance?: number, className?: string }} props
 *   isFlipped mirrors the sprite so it faces left, isSmooth blends pixels instead of keeping them sharp, which reads
 *   better when the sprite is drawn smaller than its real size, onEnd fires once a one shot animation reaches its last
 *   frame, distance is how far the character has traveled in sprite px, which picks the frame of an animation with a stride
 */
const Sprite = ({ sheet, animation, scale = 1, isFlipped = false, isSmooth = false, onEnd, distance = 0, className = "" }) => {
  const clockFrame = useFrame(sheet.animations[animation], onEnd);
  const frame = sheet.animations[animation].stride ? frameAtDistance(distance, sheet.animations[animation]) : clockFrame;
  const { width, height, backgroundSize, backgroundPosition } = frameWindow(sheet, animation, frame, scale);

  return (
    <span
      className={`block bg-no-repeat ${isSmooth ? "" : "[image-rendering:pixelated]"} ${className}`}
      style={{ width, height, backgroundImage: `url(${sheet.src})`, backgroundSize, backgroundPosition, transform: isFlipped ? "scaleX(-1)" : undefined }}
      aria-hidden="true"
    />
  );
};

export default Sprite;
