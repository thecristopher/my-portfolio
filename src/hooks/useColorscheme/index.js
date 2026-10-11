import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { resolveTheme, revealCircle } from "../../actions";
import { echo } from "../../lib/echo";

const STORAGE_KEY = "colorscheme";

const readSavedTheme = () => {
  try {
    return resolveTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return resolveTheme(null);
  }
};

// the reveal grows out of wherever the last click landed, a keyboard pick grows out of the middle
let lastPointer = null;
if (typeof window !== "undefined") {
  window.addEventListener("pointerdown", (event) => (lastPointer = { x: event.clientX, y: event.clientY }), { passive: true });
  window.addEventListener("keydown", () => (lastPointer = null), { passive: true });
}

const setRevealOrigin = () => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  const origin = lastPointer ?? { x: viewport.width / 2, y: viewport.height / 2 };
  const { x, y, radius } = revealCircle(origin, viewport);
  const root = document.documentElement.style;
  root.setProperty("--reveal-x", `${x}px`);
  root.setProperty("--reveal-y", `${y}px`);
  root.setProperty("--reveal-r", `${radius}px`);
};

// browsers with view transitions paint the new colorscheme as a circle that spreads over the old one
const withThemeReveal = (paint) => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || prefersReducedMotion) return paint();
  setRevealOrigin();
  document.startViewTransition(() => flushSync(paint));
};

export const useColorscheme = () => {
  const [colorscheme, setColorscheme] = useState(readSavedTheme);

  const applyColorscheme = useCallback((name) => {
    const theme = resolveTheme(name);
    withThemeReveal(() => {
      document.documentElement.dataset.theme = theme;
      setColorscheme(theme);
    });
    echo(`colorscheme ${theme}`, "success");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // private windows can block storage, the theme still applies for this visit
    }
  }, []);

  return { colorscheme, applyColorscheme };
};
