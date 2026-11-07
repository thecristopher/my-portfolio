/**
 * The frame after this one: a loop wraps back to the start, a one shot holds its last frame and says it's done.
 * @param {number} frame the frame on screen, 0 based
 * @param {{ frames: number, loop: boolean }} animation
 * @returns {{ frame: number, isDone: boolean }}
 */
export const nextFrame = (frame, { frames, loop }) => {
  if (frame + 1 < frames) return { frame: frame + 1, isDone: false };
  if (loop) return { frame: 0, isDone: false };
  return { frame: frames - 1, isDone: true };
};

/**
 * Where to slide the atlas so one frame shows through the sprite's window.
 * @param {{ cell: { width: number, height: number }, columns: number, animations: object }} sheet
 * @param {string} animationName like "walk"
 * @param {number} frame 0 based
 * @param {number} scale how many screen px per sprite px
 * @returns {{ width: number, height: number, backgroundSize: string, backgroundPosition: string }}
 */
export const frameWindow = (sheet, animationName, frame, scale = 1) => {
  const { cell, columns, animations } = sheet;
  const width = cell.width * scale;
  const height = cell.height * scale;
  const rows = Object.keys(animations).length;
  return {
    width,
    height,
    backgroundSize: `${columns * width}px ${rows * height}px`,
    backgroundPosition: `-${frame * width}px -${animations[animationName].row * height}px`,
  };
};

/**
 * How long a one shot animation takes from its first frame to its last.
 * @param {{ frames: number, fps: number }} animation
 * @returns {number} milliseconds
 */
export const playLength = ({ frames, fps }) => Math.round((frames / fps) * 1000);

/**
 * The frame an animation played by distance shows after traveling so far, one frame every stride px, looping.
 * @param {number} distance how far the character has traveled, in sprite px, either way
 * @param {{ frames: number, stride: number }} animation
 * @returns {number} 0 based
 */
export const frameAtDistance = (distance, { frames, stride }) => {
  const step = Math.floor(Math.abs(distance) / stride);
  return step % frames;
};
