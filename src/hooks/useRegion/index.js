import { useEffect } from "react";
import { flushSync } from "react-dom";
import { revealCircle } from "../../actions";
import { syncBrowserChrome } from "../../lib/browserChrome";
import { showBanner } from "../../lib/banner";
import { currentRegionName, pinRegion, readPinnedRegion, resolveRegion } from "../../lib/regions";
import { createStore } from "../../lib/store";
import { playRecipe } from "../../lib/sound";
import { REGION_SOUNDS } from "../../lib/regionSounds";

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

// browsers with view transitions paint the new region as a circle that spreads over the old one
const withRegionReveal = (paint) => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || prefersReducedMotion) return paint();
  setRevealOrigin();
  document.startViewTransition(() => flushSync(paint));
};

// one shared region for the whole page, so the bufferline, the statusline and telescope always agree
const regionName = createStore(typeof document === "undefined" ? "leyndell" : currentRegionName());
const pinned = createStore(typeof document === "undefined" ? false : Boolean(readPinnedRegion()));

/**
 * Travels to another region. Traveling pins it, the same way setting vim.g.eldentree_region pins one in nvim,
 * and the area name rolls across the screen like entering it in the game.
 * @param {string} next region name
 */
export const travelTo = (next) => {
  const region = resolveRegion(next);
  withRegionReveal(() => {
    document.documentElement.dataset.theme = region.name;
    regionName.set(region.name);
  });
  pinRegion(region.name);
  pinned.set(true);
  playRecipe(REGION_SOUNDS[region.name]);
  showBanner("region", { text: region.title, subtitle: `${region.subtitle} · ${region.tagline}` });
};

/** Goes back to rolling a new region every visit. */
export const unpinRegion = () => {
  pinRegion(null);
  pinned.set(false);
};

/**
 * The region painted on the page right now, kept in step with the browser bar and tab icon.
 * @returns {{ region: object, isPinned: boolean }}
 */
export const useRegion = () => {
  const name = regionName.use();
  const isPinned = pinned.use();

  // the browser bar and tab icon follow the region, including the one rolled before the first paint
  useEffect(() => syncBrowserChrome(), [name]);

  return { region: resolveRegion(name), isPinned };
};
