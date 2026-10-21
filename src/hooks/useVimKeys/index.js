import { useEffect, useRef } from "react";
import { nudgeShelf, scrollByAmount, scrollToEdge, scrollToSection } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";
import { clearSearch, searchCount, stepSearch } from "../../lib/search";
import { toggleFileTree } from "../../lib/fileTree";
import { stepSection } from "../../actions";

const LINE_STEP = 140;
const HALF_PAGE = () => window.innerHeight / 2;
const DOUBLE_TAP_MS = 450;
// vim's default leader. <leader>e toggles the file tree, the way most nvim-tree setups map it
const LEADER = "\\";

export const HELP_TEXT = "space leader · f follow a link · 1-8 or ]] [[ sections · j/k scroll · d/u half page · gg/G ends · / search · \\e tree · : telescope";

const isTypingIn = (target) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));

const isPressable = (target) => target instanceof Element && Boolean(target.closest("button, a, summary, [role='button']"));

// the file tree handles its own j/k while it has focus, so the page doesn't scroll underneath
const isInFileTree = (target) => target instanceof Element && Boolean(target.closest("[data-file-tree]"));

// the section you're reading: the last one whose top has passed the middle of the screen. a jump lands a section
// well below the very top, so a higher line would still count the one you just left
const currentSection = (ids) => {
  const line = window.innerHeight / 2;
  return ids.reduce((current, id) => {
    const top = document.getElementById(id)?.getBoundingClientRect().top;
    return top !== undefined && top <= line ? id : current;
  }, ids[0]);
};

const announceStep = (step) => {
  const result = stepSearch(step);
  if (result) echo(`/${result.query} ${searchCount(result)}`);
  else echo("E35: No previous regular expression", "error");
};

export const useVimKeys = ({ onOpenCmdline, onOpenSearch, onOpenHints, onOpenWhichKey, sectionIds = [], bufferIds = [], isPaused }) => {
  const lastKeyRef = useRef({ key: "", at: 0 });

  useEffect(() => {
    const handleKey = (event) => {
      if (isPaused || event.metaKey || event.ctrlKey || event.altKey || isTypingIn(event.target) || isInFileTree(event.target)) return;
      // space on a focused button presses it, the leader only applies to the page itself
      if (event.key === " " && isPressable(event.target)) return;

      const previous = lastKeyRef.current;
      const isQuickFollowUp = Date.now() - previous.at < DOUBLE_TAP_MS;
      const isDoubleG = event.key === "g" && previous.key === "g" && isQuickFollowUp;
      const isLeaderE = event.key === "e" && previous.key === LEADER && isQuickFollowUp;
      // vim's section motions: ]] to the next one, [[ back
      const isSectionMotion = (event.key === "]" || event.key === "[") && previous.key === event.key && isQuickFollowUp;
      lastKeyRef.current = { key: event.key, at: Date.now() };

      const actions = {
        j: () => scrollByAmount(LINE_STEP),
        k: () => scrollByAmount(-LINE_STEP),
        d: () => scrollByAmount(HALF_PAGE()),
        u: () => scrollByAmount(-HALF_PAGE()),
        G: () => scrollToEdge("bottom"),
        n: () => announceStep(1),
        N: () => announceStep(-1),
        f: () => onOpenHints(),
        h: () => nudgeShelf(-1),
        l: () => nudgeShelf(1),
        "/": () => onOpenSearch(),
        ":": () => onOpenCmdline(),
        "?": () => onOpenWhichKey(),
        // the leader is space, like Eldentree. which-key shows what it unlocks
        " ": () => onOpenWhichKey(),
        Escape: () => clearSearch(),
      };

      if (isDoubleG) {
        event.preventDefault();
        scrollToEdge("top");
        return;
      }

      if (isSectionMotion) {
        event.preventDefault();
        lastKeyRef.current = { key: "", at: 0 };
        scrollToSection(stepSection(sectionIds, currentSection(sectionIds), event.key === "]" ? 1 : -1));
        return;
      }

      // the buffer numbers, the same ones the statusline and the old tabs counted with
      const bufferId = /^[1-9]$/.test(event.key) ? bufferIds[Number(event.key) - 1] : null;
      if (bufferId) {
        event.preventDefault();
        scrollToSection(bufferId);
        return;
      }

      if (isLeaderE) {
        event.preventDefault();
        toggleFileTree({ focus: true });
        return;
      }

      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onOpenCmdline, onOpenSearch, onOpenHints, onOpenWhichKey, sectionIds, bufferIds, isPaused]);
};
