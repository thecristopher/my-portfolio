// one easing curve everywhere keeps the whole site feeling like a single product
export const easeOutExpo = [0.16, 1, 0.3, 1];

/**
 * Snaps an animation to a few frames, so it reads like sprite frames in a 16 bit game instead of a smooth tween.
 * @param {number} frames how many frames the motion gets
 * @returns {(progress: number) => number} an easing for framer motion
 */
export const pixelSteps = (frames) => (progress) => Math.round(progress * frames) / frames;

/**
 * The slice of a scroll a word lights up in, so a paragraph brightens one word after the other as it is read.
 * Each word starts a little before the previous one finishes, so the light rolls instead of ticking.
 * @param {number} index which word, 0 based
 * @param {number} count how many words the paragraph has
 * @param {{ overlap?: number }} options how many words light up at the same time
 * @returns {[number, number]} where the word starts and finishes lighting, from 0 to 1 of the scroll
 */
export const wordWindow = (index, count, { overlap = 3 } = {}) => {
  if (count <= 0) return [0, 1];
  const step = 1 / (count + overlap - 1);
  return [index * step, Math.min(1, (index + overlap) * step)];
};

/**
 * How far a pinned scene has to scroll to slide its whole track sideways past the screen.
 * @param {number} trackWidth the width of everything on the track, in px
 * @param {number} viewportWidth the width of the screen, in px
 * @returns {number} the distance to slide, never negative
 */
export const trackDistance = (trackWidth, viewportWidth) => Math.max(0, trackWidth - viewportWidth);
