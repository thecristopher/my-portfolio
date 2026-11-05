// what the loading screen says it's doing, from the first coin to the last
export const LOADING_LINES = [
  "Waking up the sun over Rosarito",
  "Sweeping the sand off the pier",
  "Brewing the 2 AM coffee",
  "Compiling nine years of commits",
  "Tuning the sunset",
];

/**
 * How far along the loading is, as a whole percent.
 * @param {number} done tasks finished, failed ones included
 * @param {number} total tasks started
 * @returns {number} from 0 to 100
 */
export const percentDone = (done, total) => {
  if (total <= 0) return 100;
  return Math.min(100, Math.round((done / total) * 100));
};

/**
 * The percent as a coin counter, always three digits like an arcade score.
 * @param {number} percent from 0 to 100
 * @returns {string} like "007" or "100"
 */
export const coinCount = (percent) => String(Math.max(0, Math.min(100, Math.round(percent)))).padStart(3, "0");

/**
 * The line that fits how far the loading has come.
 * @param {number} percent from 0 to 100
 * @param {string[]} lines what to say, in order
 * @returns {string}
 */
export const loadingLine = (percent, lines = LOADING_LINES) => {
  const index = Math.floor((Math.max(0, Math.min(99, percent)) / 100) * lines.length);
  return lines[index];
};

/**
 * Runs every task at once and reports each one that settles. A task that fails still counts, so a missing image never
 * leaves the loader stuck at 97%.
 * @param {Array<() => Promise<unknown>>} tasks each starts one download
 * @param {(done: number, total: number) => void} onSettle called after every task settles
 * @returns {Promise<void>} resolves once all of them have settled
 */
export const trackAll = async (tasks, onSettle) => {
  let done = 0;
  const total = tasks.length;
  onSettle(done, total);
  await Promise.all(
    tasks.map((task) =>
      Promise.resolve()
        .then(task)
        .catch(() => undefined)
        .finally(() => {
          done += 1;
          onSettle(done, total);
        })
    )
  );
};

/**
 * The mask that cuts the iris: see through inside the circle, solid outside it.
 * @param {number} radius of the opening, in px
 * @param {{ x: number, y: number }} center where it opens from, in px
 * @returns {string} a CSS mask image
 */
export const irisMask = (radius, { x, y }) =>
  `radial-gradient(circle at ${x}px ${y}px, transparent ${radius}px, black ${radius + 1}px)`;

/**
 * How big the iris has to grow to uncover the far corner of the screen from where it opens.
 * @param {{ x: number, y: number }} center where it opens from, in px
 * @param {{ width: number, height: number }} screen
 * @returns {number} radius in px
 */
export const irisReach = ({ x, y }, { width, height }) =>
  Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y)));
