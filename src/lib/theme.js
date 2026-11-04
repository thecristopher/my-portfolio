import { createStore } from "./store";

export const THEMES = ["light", "dark"];
const STORAGE_KEY = "theme";

// what the phone's browser bar paints behind the page, the same as each theme's background
export const THEME_COLORS = { light: "#fbfbfd", dark: "#000000" };

/**
 * The theme a visit starts in: the one picked on the toggle wins, otherwise the system decides.
 * index.html runs the same rule before paint, keep them in step.
 * @param {{ saved?: string | null, prefersDark?: boolean }} visit what the browser remembers and prefers
 * @returns {"light" | "dark"} the theme
 */
export const resolveTheme = ({ saved = null, prefersDark = false } = {}) => {
  if (THEMES.includes(saved)) return saved;
  return prefersDark ? "dark" : "light";
};

/**
 * The other theme, for the toggle.
 * @param {string} theme the theme on screen
 * @returns {"light" | "dark"} the one the toggle switches to
 */
export const otherTheme = (theme) => (theme === "dark" ? "light" : "dark");

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const save = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // private windows can block storage, the theme still applies for this visit
  }
};

const prefersDark = () => typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

const startingTheme = () => {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme ?? resolveTheme({ saved: readSaved(), prefersDark: prefersDark() });
};

const theme = createStore(startingTheme());

const paint = (next) => {
  document.documentElement.dataset.theme = next;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[next]);
};

/**
 * Puts a theme on the page and remembers it, so the system stops deciding for this visitor.
 * @param {"light" | "dark"} next the theme to show
 */
export const setTheme = (next) => {
  const apply = () => {
    paint(next);
    theme.set(next);
  };
  save(next);
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // browsers with view transitions cross fade the whole page instead of snapping each color on its own
  if (!document.startViewTransition || prefersReducedMotion) return apply();
  document.startViewTransition(apply);
};

/**
 * Follows the system theme while the visitor never picked one on the toggle.
 * @returns {() => void} stops following
 */
export const followSystemTheme = () => {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const follow = (event) => {
    if (THEMES.includes(readSaved())) return;
    const next = event.matches ? "dark" : "light";
    paint(next);
    theme.set(next);
  };
  query.addEventListener("change", follow);
  return () => query.removeEventListener("change", follow);
};

/** @returns {"light" | "dark"} the theme on screen, kept live */
export const useTheme = () => theme.use();
