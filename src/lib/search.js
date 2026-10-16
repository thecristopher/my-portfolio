import { useSyncExternalStore } from "react";
import { scrollToY } from "./smoothScroll";

// `/` searches the page like vim does: every match gets highlighted, n and N step through them, and :noh clears it.
// matches are painted with the CSS Custom Highlight API, so the page's own markup is never touched

// where each case-insensitive match of the query starts in a piece of text
export const matchOffsets = (text = "", query = "") => {
  const needle = query.toLowerCase();
  if (!needle) return [];
  const haystack = text.toLowerCase();
  const offsets = [];
  for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + needle.length)) offsets.push(at);
  return offsets;
};

// steps forward or back through the matches and wraps around the ends, the way vim's wrapscan does
export const stepIndex = (index, total, step) => (total === 0 ? -1 : (((index + step) % total) + total) % total);

// the readout vim prints after a search
export const searchCount = ({ index, total }) => `[${index + 1}/${total}]`;

let state = { query: "", index: -1, total: 0 };
let ranges = [];
const listeners = new Set();

const publish = (next) => {
  state = next;
  listeners.forEach((listener) => listener());
};

// headings split into animated words hide them from screen readers, so aria-hidden can't be the rule here. anything
// purely decorative or doubled up for an effect opts out with data-search-skip instead
const SKIPPED = "script, style, svg, [data-search-skip]";

const findRanges = (query) => {
  const root = document.querySelector("main");
  if (!root || !query) return [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => (node.parentElement?.closest(SKIPPED) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const found = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    for (const offset of matchOffsets(node.data, query)) {
      const range = document.createRange();
      range.setStart(node, offset);
      range.setEnd(node, offset + query.length);
      // skip anything collapsed or hidden away, it can't be shown
      if (range.getClientRects().length > 0) found.push(range);
    }
  }
  return found;
};

const paint = () => {
  if (!globalThis.CSS?.highlights) return;
  CSS.highlights.delete("search");
  CSS.highlights.delete("search-current");
  if (ranges.length === 0) return;
  CSS.highlights.set("search", new Highlight(...ranges));
  const current = ranges[state.index];
  if (current) CSS.highlights.set("search-current", new Highlight(current));
};

const reveal = () => {
  const range = ranges[state.index];
  if (!range) return;
  // the hero fades out as it scrolls away, so a match in it is only readable from the very top
  if (range.startContainer.parentElement?.closest("#home")) return scrollToY(0);
  const rect = range.getBoundingClientRect();
  // land the match a third of the way down the screen, clear of the nav
  scrollToY(window.scrollY + rect.top - window.innerHeight / 3);
};

// runs a new search and jumps to the first match below where you are, like vim
export const search = (query) => {
  ranges = findRanges(query.trim());
  const below = ranges.findIndex((range) => range.getBoundingClientRect().top > window.innerHeight / 3);
  publish({ query: query.trim(), index: ranges.length ? Math.max(0, below) : -1, total: ranges.length });
  paint();
  reveal();
  return state;
};

export const stepSearch = (step) => {
  if (ranges.length === 0) return null;
  publish({ ...state, index: stepIndex(state.index, ranges.length, step) });
  paint();
  reveal();
  return state;
};

export const clearSearch = () => {
  ranges = [];
  publish({ query: "", index: -1, total: 0 });
  paint();
};

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useSearchState = () => useSyncExternalStore(subscribe, () => state);
