import { useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { letterWeight } from "./actions";

// the name rests at semibold and swells to extra bold under the cursor
const WEIGHTS = { reach: 220, rest: 600, peak: 800 };

/**
 * Lets the letters of the name gain weight near a mouse cursor. Each letter registers itself, and the scene passes its
 * pointer events in, since the photo sits on top of the name and would swallow them otherwise.
 * @returns {{ register: (index: number) => (element: HTMLElement | null) => void, onPointerMove: (event: PointerEvent) => void, onPointerLeave: () => void }}
 */
export const useLetterWeights = () => {
  const letters = useRef([]);
  const prefersReducedMotion = useReducedMotion();

  const register = useCallback((index) => (element) => {
    letters.current[index] = element;
  }, []);

  const onPointerMove = (event) => {
    if (prefersReducedMotion || event.pointerType !== "mouse") return;
    for (const letter of letters.current) {
      if (!letter) continue;
      const bounds = letter.getBoundingClientRect();
      const distance = Math.hypot(event.clientX - (bounds.left + bounds.width / 2), event.clientY - (bounds.top + bounds.height / 2));
      letter.style.fontWeight = letterWeight(distance, WEIGHTS);
    }
  };

  const onPointerLeave = () => {
    for (const letter of letters.current) if (letter) letter.style.fontWeight = "";
  };

  return { register, onPointerMove, onPointerLeave };
};
