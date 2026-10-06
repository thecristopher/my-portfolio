import { useEffect, useRef } from "react";
import { scrollByAmount, scrollToEdge } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";

const LINE_STEP = 140;
const HALF_PAGE = () => window.innerHeight / 2;
const DOUBLE_TAP_MS = 450;

const isTypingIn = (target) => target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));

export const useVimKeys = ({ onOpenCmdline, isPaused }) => {
  const lastKeyRef = useRef({ key: "", at: 0 });

  useEffect(() => {
    const handleKey = (event) => {
      if (isPaused || event.metaKey || event.ctrlKey || event.altKey || isTypingIn(event.target)) return;

      const previous = lastKeyRef.current;
      const isDoubleG = event.key === "g" && previous.key === "g" && Date.now() - previous.at < DOUBLE_TAP_MS;
      lastKeyRef.current = { key: event.key, at: Date.now() };

      const actions = {
        j: () => scrollByAmount(LINE_STEP),
        k: () => scrollByAmount(-LINE_STEP),
        d: () => scrollByAmount(HALF_PAGE()),
        u: () => scrollByAmount(-HALF_PAGE()),
        G: () => scrollToEdge("bottom"),
        ":": () => onOpenCmdline(),
        "?": () => echo("j/k scroll · d/u half page · gg/G top/bottom · : commands · try :colorscheme or :q"),
      };

      if (isDoubleG) {
        event.preventDefault();
        scrollToEdge("top");
        return;
      }

      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      action();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onOpenCmdline, isPaused]);
};
