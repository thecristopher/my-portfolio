import Lenis from "lenis";

const NAV_OFFSET = -88;
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

// a target that lives on a sideways shelf (a repo) also slides the shelf over to it while the page scrolls there
const slideShelfTo = (element) => {
  const shelf = element.closest("[data-shelf]");
  if (!shelf) return;
  const card = element.closest("[data-shelf] > *");
  shelf.scrollTo({ left: card.offsetLeft - parseFloat(getComputedStyle(shelf).scrollPaddingLeft || 0), behavior: "smooth" });
};

// one card along a sideways shelf, the width of a card plus the gap after it
export const slideShelf = (shelf, direction) => {
  const card = shelf?.firstElementChild;
  if (!card) return;
  const gap = parseFloat(getComputedStyle(shelf).columnGap) || 0;
  shelf.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: "smooth" });
};

// h and l slide the repo shelf, but only while it's on screen. says whether it found one to slide
export const nudgeShelf = (direction) => {
  const shelf = document.querySelector("[data-shelf]");
  const box = shelf?.getBoundingClientRect();
  if (!box || box.bottom < 0 || box.top > window.innerHeight) return false;
  slideShelf(shelf, direction);
  return true;
};

export const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (!section) return;
  slideShelfTo(section);
  if (lenis) lenis.scrollTo(section, { offset: NAV_OFFSET });
  else section.scrollIntoView({ behavior: "smooth" });
};

export const scrollByAmount = (delta) => {
  if (lenis) lenis.scrollTo(lenis.targetScroll + delta);
  else window.scrollBy({ top: delta });
};

export const scrollToY = (top) => {
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: "smooth" });
};

export const scrollToEdge = (edge) => {
  const top = edge === "top" ? 0 : document.documentElement.scrollHeight;
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top });
};

// the command palette needs the page frozen while it is open
export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();
