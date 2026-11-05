// every image the page ships, the portrait, the company marks and the sprite atlases, found at build time so a new
// one is preloaded without anyone having to list it here
const IMAGES = Object.values(
  import.meta.glob("../../assets/**/*.{png,jpg,jpeg,webp,svg}", { eager: true, query: "?url", import: "default" })
);

// the faces the page is set in, at the weights it uses most, so no headline swaps fonts in front of the visitor
const FONTS = ['400 1em "Geist"', '600 1em "Geist"', '800 1em "Geist"', '400 1em "Geist Mono"', '600 1em "Pixelify Sans"'];

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve();
    image.onerror = reject;
    image.src = src;
  }).then(() => undefined);

const loadFont = (font) => document.fonts?.load(font) ?? Promise.resolve();

// scripts and stylesheets the browser is still fetching for the first paint
const windowLoaded = () =>
  new Promise((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", resolve, { once: true });
  });

/**
 * Everything the first screen needs before the curtain opens, one task per download.
 * There are no lazily loaded sections today; the résumé writer stays out on purpose, it's 1 MB and only for a click.
 * @returns {Array<() => Promise<unknown>>}
 */
export const preloadTasks = () => [
  windowLoaded,
  ...IMAGES.map((src) => () => loadImage(src)),
  ...FONTS.map((font) => () => loadFont(font)),
  () => document.fonts?.ready ?? Promise.resolve(),
];
