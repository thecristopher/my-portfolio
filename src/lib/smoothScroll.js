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

export const scrollToEdge = (edge) => {
  const top = edge === "top" ? 0 : document.documentElement.scrollHeight;
  if (lenis) lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: "smooth" });
};
