import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

// what the cursor wraps itself around instead of sitting on top of
const MORPHS_ONTO = "a[href], button, [role='button'], summary, label[for]";
// where it turns into vim's thin insert mode bar
const TYPES_INTO = "input, textarea, [contenteditable='true']";
const BLOCK = { width: 10, height: 20, radius: 2 };
const HUG = 6;
const SPRING = { stiffness: 520, damping: 40, mass: 0.6 };

const radiusOf = (element) => {
  const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0;
  return Math.min(radius + HUG / 2, 999);
};

// the page's cursor is vim's: a block that inverts whatever it sits on. over anything you can click it lets go of the
// mouse and wraps itself around the control, leaning a few pixels toward where the mouse actually is, the way
// iPadOS does it. over a text field it thins into the insert mode bar. only for a real mouse, and never with
// reduced motion, so nobody ends up without a cursor they can trust
const usePointerCapable = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isFine] = useState(() => globalThis.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false);
  return isFine && !prefersReducedMotion;
};

const Pointer = () => {
  const isEnabled = usePointerCapable();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const width = useMotionValue(BLOCK.width);
  const height = useMotionValue(BLOCK.height);
  const radius = useMotionValue(BLOCK.radius);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);
  const springWidth = useSpring(width, SPRING);
  const springHeight = useSpring(height, SPRING);
  const springRadius = useSpring(radius, SPRING);
  const [mode, setMode] = useState("block");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isEnabled) return undefined;
    const root = document.documentElement;
    root.classList.add("has-pointer");
    let pointer = { x: -100, y: -100 };
    let target = null;
    let frame = null;
    let currentMode = "block";

    // works out what sits under the mouse right now. a click can move the page under a still mouse (a filter
    // fading jobs, a banner sliding in, smooth scrolling), so this runs every frame instead of trusting the last move
    const resolve = (element) => {
      const control = element?.closest(MORPHS_ONTO);
      const field = element?.closest(TYPES_INTO);
      const box = control?.getBoundingClientRect();
      // a control too big to hug, like a whole card that is a link, keeps the block instead
      const isHuggable = box && box.width < 520 && box.height < 180;
      const nextMode = field ? "bar" : isHuggable ? "morph" : "block";
      target = nextMode === "morph" ? control : null;
      if (nextMode !== currentMode) {
        currentMode = nextMode;
        setMode(nextMode);
      }
    };

    const place = () => {
      frame = null;
      if (target) resolve(document.elementFromPoint(pointer.x, pointer.y));
      if (target) {
        const box = target.getBoundingClientRect();
        const pull = { x: (pointer.x - (box.left + box.width / 2)) * 0.08, y: (pointer.y - (box.top + box.height / 2)) * 0.12 };
        x.set(box.left - HUG + pull.x);
        y.set(box.top - HUG + pull.y);
        width.set(box.width + HUG * 2);
        height.set(box.height + HUG * 2);
        radius.set(radiusOf(target));
        frame = requestAnimationFrame(place);
        return;
      }
      const isBar = currentMode === "bar";
      x.set(pointer.x - (isBar ? 1 : BLOCK.width / 2));
      y.set(pointer.y - BLOCK.height / 2);
      width.set(isBar ? 2 : BLOCK.width);
      height.set(BLOCK.height);
      radius.set(BLOCK.radius);
    };

    const move = (event) => {
      pointer = { x: event.clientX, y: event.clientY };
      resolve(event.target instanceof Element ? event.target : null);
      setIsVisible(true);
      frame ??= requestAnimationFrame(place);
    };
    // scrolling slides new things under a mouse that never moved
    const rescan = () => {
      if (pointer.x < 0) return;
      resolve(document.elementFromPoint(pointer.x, pointer.y));
      frame ??= requestAnimationFrame(place);
    };
    const hide = () => setIsVisible(false);
    const press = () => root.classList.add("pointer-down");
    const lift = () => root.classList.remove("pointer-down");

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", rescan, { passive: true });
    window.addEventListener("pointerdown", press, { passive: true });
    window.addEventListener("pointerup", lift, { passive: true });
    root.addEventListener("pointerleave", hide);
    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("has-pointer", "pointer-down");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", rescan);
      window.removeEventListener("pointerdown", press);
      window.removeEventListener("pointerup", lift);
      root.removeEventListener("pointerleave", hide);
    };
  }, [isEnabled, x, y, width, height, radius]);

  if (!isEnabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      data-pointer={mode}
      className="pointer pointer-events-none fixed top-0 left-0 z-[90]"
      style={{ x: springX, y: springY, width: springWidth, height: springHeight, borderRadius: springRadius, opacity: isVisible ? 1 : 0 }}
    />
  );
};

export default Pointer;
