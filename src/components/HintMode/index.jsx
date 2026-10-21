import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { hintLabels } from "../../actions";
import { echo } from "../../lib/echo";

// everything a mouse could press
const CLICKABLE = "a[href], button:not([disabled]), [role='button'], summary, input, textarea, select";

// only what's on screen and actually on top. something covered by a modal or tucked under the navbar gets no label
const visibleTargets = () =>
  [...document.querySelectorAll(CLICKABLE)].flatMap((element) => {
    // relics never get a label, a hint would point straight at them
    if (element.closest("[data-relic]")) return [];
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return [];
    if (box.bottom < 0 || box.top > window.innerHeight || box.right < 0 || box.left > window.innerWidth) return [];
    const x = Math.min(window.innerWidth - 1, Math.max(0, box.left + Math.min(box.width / 2, 12)));
    const y = Math.min(window.innerHeight - 1, Math.max(0, box.top + box.height / 2));
    const top = document.elementFromPoint(x, y);
    if (!top || !(element === top || element.contains(top) || top.contains(element))) return [];
    return [{ element, left: box.left, top: box.top }];
  });

// vimium's f: a short label lands on everything you could click, and typing one clicks it. the way to reach any
// link, toggle or hidden secret on the page without touching the mouse
const HintMode = ({ onClose }) => {
  const [hints] = useState(() => {
    const targets = visibleTargets();
    const labels = hintLabels(targets.length);
    return targets.map((target, index) => ({ ...target, label: labels[index] }));
  });
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (hints.length === 0) {
      echo("nothing to follow on screen", "error");
      onClose();
      return undefined;
    }
    echo("follow a hint · type its letters · esc to cancel");

    const handleKey = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") return onClose();
      if (event.key === "Backspace") return setTyped((current) => current.slice(0, -1));
      if (event.key.length !== 1) return undefined;

      const next = typed + event.key.toLowerCase();
      const matches = hints.filter((hint) => hint.label.startsWith(next));
      if (matches.length === 0) return undefined;
      const exact = matches.find((hint) => hint.label === next);
      if (!exact) return setTyped(next);
      onClose();
      exact.element.focus({ preventScroll: true });
      exact.element.click();
      return undefined;
    };

    // the labels are pinned to where things were, so any scroll makes them lie. leave instead
    const leave = () => onClose();
    window.addEventListener("keydown", handleKey, true);
    window.addEventListener("scroll", leave, { passive: true });
    window.addEventListener("pointerdown", leave);
    return () => {
      window.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("scroll", leave);
      window.removeEventListener("pointerdown", leave);
    };
  }, [hints, typed, onClose]);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden="true">
      {hints
        .filter((hint) => hint.label.startsWith(typed))
        .map((hint) => (
          <span
            key={hint.label}
            className="absolute rounded-md bg-accent px-1.5 py-0.5 font-mono text-[11px] leading-none font-medium tracking-wide text-ink uppercase shadow-[0_4px_14px_-4px_color-mix(in_oklab,var(--color-shadow)_80%,transparent)]"
            style={{ left: Math.max(2, hint.left - 6), top: Math.max(2, hint.top - 8) }}
          >
            <span className="opacity-45">{hint.label.slice(0, typed.length)}</span>
            {hint.label.slice(typed.length)}
          </span>
        ))}
    </div>,
    document.body
  );
};

export default HintMode;
