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

export const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (!section) return;
  if (lenis) lenis.scrollTo(section, { offset: NAV_OFFSET });
  else section.scrollIntoView({ behavior: "smooth" });
};

export const scrollByAmount = (delta) => {
  if (lenis) lenis.scrollTo(lenis.targetScroll + delta);
  else window.scrollBy({ top: delta });
};

export const scrollToEdge = (edge) => {
  const top = edge === "top" ? 0 : document.documentElement.scrollHeight;
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top });
};

// the command palette needs the page frozen while it is open
export const pauseSmoothScroll = () => lenis?.stop();
export const resumeSmoothScroll = () => lenis?.start();
