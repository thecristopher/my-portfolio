import { useEffect, useRef } from "react";
import { scrollByAmount, scrollToEdge } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";
import { clearSearch, searchCount, stepSearch } from "../../lib/search";
import { focusFileTree } from "../../lib/fileTree";

const LINE_STEP = 140;
const HALF_PAGE = () => window.innerHeight / 2;
const DOUBLE_TAP_MS = 450;
// vim's default leader. <leader>e opens the file tree, the way most nvim-tree setups map it
const LEADER = "\\";

export const HELP_TEXT = "j/k scroll · d/u half page · gg/G top/bottom · / search · \\e file tree · : commands · try :colorscheme, :quests or :q";

const isTypingIn = (target) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));

// the file tree handles its own j/k while it has focus, so the page doesn't scroll underneath
const isInFileTree = (target) => target instanceof Element && Boolean(target.closest("[data-file-tree]"));

const announceStep = (step) => {
  const result = stepSearch(step);
  if (result) echo(`/${result.query} ${searchCount(result)}`);
  else echo("E35: No previous regular expression", "error");
};

export const useVimKeys = ({ onOpenCmdline, onOpenSearch, isPaused }) => {
  const lastKeyRef = useRef({ key: "", at: 0 });

  useEffect(() => {
    const handleKey = (event) => {
      if (isPaused || event.metaKey || event.ctrlKey || event.altKey || isTypingIn(event.target) || isInFileTree(event.target)) return;

      const previous = lastKeyRef.current;
      const isQuickFollowUp = Date.now() - previous.at < DOUBLE_TAP_MS;
      const isDoubleG = event.key === "g" && previous.key === "g" && isQuickFollowUp;
      const isLeaderE = event.key === "e" && previous.key === LEADER && isQuickFollowUp;
      lastKeyRef.current = { key: event.key, at: Date.now() };

      const actions = {
        j: () => scrollByAmount(LINE_STEP),
        k: () => scrollByAmount(-LINE_STEP),
        d: () => scrollByAmount(HALF_PAGE()),
        u: () => scrollByAmount(-HALF_PAGE()),
        G: () => scrollToEdge("bottom"),
        n: () => announceStep(1),
        N: () => announceStep(-1),
        "/": () => onOpenSearch(),
        ":": () => onOpenCmdline(),
        "?": () => echo(HELP_TEXT),
        Escape: () => clearSearch(),
      };

      if (isDoubleG) {
        event.preventDefault();
        scrollToEdge("top");
        return;
      }

      if (isLeaderE) {
        event.preventDefault();
        focusFileTree();
        return;
      }

      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onOpenCmdline, onOpenSearch, isPaused]);
};
