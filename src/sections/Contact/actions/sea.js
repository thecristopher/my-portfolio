// how long a ripple keeps spreading before it's gone
export const RIPPLE_LIFE_MS = 1800;

// the sea is seen from the beach at a low angle, so a round ripple reads as a flat ellipse
export const RIPPLE_SQUASH = 0.3;

// how far a ripple pushes a piece of the reflection sideways at its strongest, in px
const RIPPLE_PUSH = 16;
// how wide the band around a ripple's ring that moves the reflection is, in px
const RING_BAND = 18;

/**
 * Where a ripple is in its life: how far it has spread and how much of it is left to see.
 * @param {{ x: number, y: number, size: number, born: number }} ripple size is the radius it ends at, born is when it started in ms
 * @param {number} now the current time in ms
 * @param {number} life how long a ripple lasts in ms
 * @returns {{ x: number, y: number, radius: number, alpha: number } | null} null once it has faded or before it starts
 */
export const rippleAt = (ripple, now, life = RIPPLE_LIFE_MS) => {
  const age = (now - ripple.born) / life;
  if (age < 0 || age >= 1) return null;
  const spread = 1 - (1 - age) ** 3;
  return { x: ripple.x, y: ripple.y, radius: spread * ripple.size, alpha: 1 - age };
};

/**
 * Whether the cursor has moved far enough since the last ripple to drop a new one, so a slow drag doesn't flood the sea.
 * @param {{ x: number, y: number } | null} last where the last ripple dropped
 * @param {{ x: number, y: number }} point where the cursor is now
 * @param {number} gap the distance between ripples in px
 * @returns {boolean}
 */
export const isFarEnough = (last, point, gap) => !last || Math.hypot(point.x - last.x, point.y - last.y) >= gap;

/**
 * How far one piece of the sun's reflection slides sideways: a gentle sway of its own, plus a push from every ripple
 * whose ring is passing through it. That push is what breaks the reflection where the cursor goes.
 * @param {{ x: number, y: number }} piece the middle of the piece, in px
 * @param {number} time the current time in ms, for the sway
 * @param {{ x: number, y: number, radius: number, alpha: number }[]} rings the ripples alive right now
 * @returns {number} the shift in px, positive to the right
 */
export const reflectionShift = (piece, time, rings) => {
  const sway = Math.sin(time / 600 + piece.y / 9) * 1.5;
  return rings.reduce((shift, ring) => {
    const dx = piece.x - ring.x;
    const distance = Math.hypot(dx, (piece.y - ring.y) / RIPPLE_SQUASH);
    const band = Math.exp(-((distance - ring.radius) ** 2) / (2 * RING_BAND ** 2));
    return shift + RIPPLE_PUSH * ring.alpha * band * (dx < 0 ? -1 : 1);
  }, sway);
};

/**
 * Where the next idle drip lands: somewhere inside the sun's reflection, so the sea moves where the light is instead
 * of rings popping up in the dark water around it.
 * @param {number} rollX a random number from 0 to 1
 * @param {number} rollY a random number from 0 to 1
 * @param {{ center: number, span: number, depth: number }} reflection the middle of the reflection, its width and how
 *   far down it reaches, in px
 * @returns {{ x: number, y: number }}
 */
export const dripPoint = (rollX, rollY, { center, span, depth }) => ({ x: center + (rollX - 0.5) * span * 0.8, y: rollY * depth * 0.8 });

/**
 * How bright the sun's reflection is at a point of the sunset: full while the sun is up, nearly gone once it has set.
 * @param {number} progress how far the sunset has gone, from 0 to 1
 * @returns {number} opacity from 0.1 to 1
 */
export const reflectionStrength = (progress) => {
  const done = Math.min(1, Math.max(0, progress / 0.85));
  return 1 - done * 0.9;
};
