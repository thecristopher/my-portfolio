import Lenis from "lenis";

const NAV_OFFSET = -88;
// past this many screens a smooth ride would race through every pinned scene on the way, so the page jumps instead
const JUMP_AFTER_SCREENS = 2.5;
let lenis = null;

export const startSmoothScroll = () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return () => {};

  lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: { offset: NAV_OFFSET } });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
};

/**
 * Whether a scroll is too far to glide: gliding that far drags every pinned scene in between across the screen.
 * @param {number} distance px between where the page is and where it's going, either direction
 * @param {number} viewportHeight the screen's height in px
 * @returns {boolean} true when the page should jump straight there
 */
export const isTooFarToGlide = (distance, viewportHeight) => Math.abs(distance) > viewportHeight * JUMP_AFTER_SCREENS;

/**
 * Takes the page to an element by id, gliding when it's close and jumping when it's far.
 * @param {string} id the element's id, a section or a chapter inside one
 */
export const scrollToSection = (id) => {
  const target = document.getElementById(id);
  if (!target) return;
  const distance = target.getBoundingClientRect().top + NAV_OFFSET;
  const immediate = isTooFarToGlide(distance, window.innerHeight);
  if (lenis) lenis.scrollTo(target, { offset: NAV_OFFSET, immediate });
  else target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
};

export const scrollToEdge = (edge) => {
  const top = edge === "top" ? 0 : document.documentElement.scrollHeight;
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: "smooth" });
};
