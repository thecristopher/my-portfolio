// one easing curve everywhere keeps the whole site feeling like a single product
export const easeOutExpo = [0.16, 1, 0.3, 1];

/**
 * Snaps an animation to a few frames, so it reads like sprite frames in a 16 bit game instead of a smooth tween.
 * @param {number} frames how many frames the motion gets
 * @returns {(progress: number) => number} an easing for framer motion
 */
export const pixelSteps = (frames) => (progress) => Math.round(progress * frames) / frames;
