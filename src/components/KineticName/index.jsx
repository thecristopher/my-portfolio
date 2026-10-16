import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";
import { letterWeight } from "../../actions";

const REST_WEIGHT = 500;
// how quickly each letter eases toward the weight it wants, per frame
const EASE = 0.16;

// the name is set in Geist's variable weights, and the letters near the cursor bulk up as it passes, like the type
// is leaning in to look. on touch screens, where there's no cursor, a single wave of weight rolls through once
const useLivingWeight = (lettersRef, { isEnabled, waveAtMs }) => {
  useEffect(() => {
    if (!isEnabled) return undefined;
    const letters = () => lettersRef.current.filter(Boolean);
    const current = new Map();
    let pointer = null;
    let waveStart = null;
    let frame = null;

    const tick = (now) => {
      let isMoving = false;
      const waveProgress = waveStart === null ? null : (now - waveStart) / 1400;
      const all = letters();
      // every position is read before any weight is written, so the frame lays out once instead of once per letter
      const boxes = pointer ? all.map((letter) => letter.getBoundingClientRect()) : [];
      all.forEach((letter, index) => {
        let target = REST_WEIGHT;
        if (pointer) {
          const box = boxes[index];
          target = letterWeight(Math.hypot(pointer.x - (box.left + box.width / 2), pointer.y - (box.top + box.height / 2)));
        } else if (waveProgress !== null && waveProgress < 1.4) {
          // a crest of weight sweeping from the first letter to the last
          const crestAt = waveProgress * (all.length + 6) - 3;
          target = REST_WEIGHT + 220 * Math.max(0, 1 - Math.abs(index - crestAt) / 3);
        }
        const weight = current.get(letter) ?? REST_WEIGHT;
        const next = weight + (target - weight) * EASE;
        if (Math.abs(next - target) > 0.5) isMoving = true;
        current.set(letter, next);
        letter.style.fontWeight = Math.round(next);
      });
      const isWaving = waveProgress !== null && waveProgress < 1.4;
      frame = isMoving || isWaving ? requestAnimationFrame(tick) : null;
    };

    const wake = () => {
      frame ??= requestAnimationFrame(tick);
    };

    const isFinePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const track = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      wake();
    };
    const release = () => {
      pointer = null;
      wake();
    };
    const waveTimer = isFinePointer
      ? null
      : setTimeout(() => {
          waveStart = performance.now();
          wake();
        }, waveAtMs);

    if (isFinePointer) {
      window.addEventListener("pointermove", track, { passive: true });
      document.documentElement.addEventListener("pointerleave", release);
    }
    return () => {
      clearTimeout(waveTimer);
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", track);
      document.documentElement.removeEventListener("pointerleave", release);
    };
  }, [lettersRef, isEnabled, waveAtMs]);
};

// each letter rises out of its own mask, one after another, then the living weight takes over
const KineticName = ({ lines, delay = 0, className = "" }) => {
  const lettersRef = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  const letterCount = lines.reduce((count, line) => count + line.text.length, 0);
  useLivingWeight(lettersRef, { isEnabled: !prefersReducedMotion, waveAtMs: (delay + 0.6 + letterCount * 0.03) * 1000 });

  let position = 0;
  return (
    <h1 className={className} aria-label={lines.map((line) => line.text).join(" ")}>
      {lines.map((line) => (
        <span key={line.text} aria-hidden="true" className={`block whitespace-nowrap ${line.className ?? ""}`}>
          {[...line.text].map((letter) => {
            const at = position++;
            return (
              <span key={at} className="inline-block overflow-hidden pb-[0.1em] align-top">
                <motion.span
                  ref={(node) => (lettersRef.current[at] = node)}
                  className="inline-block"
                  initial={{ y: "115%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 1.1, delay: delay + at * 0.03, ease: easeOutExpo }}
                >
                  {letter}
                </motion.span>
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
};

export default KineticName;
