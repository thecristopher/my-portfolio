import { useId, useRef } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { trailGeometry, trailSweep } from "./actions";

// the speed settles back down instead of snapping to zero, so the trails fade out behind the satellites
const SETTLE = { stiffness: 120, damping: 24 };

// moves one trail's arc and its fading gradient straight on the DOM, so a scroll never re-renders the ring
const drawTrail = (path, gradient, angle, sweep) => {
  const trail = trailGeometry(angle, sweep);
  if (!path || !gradient) return;
  if (!trail) {
    path.setAttribute("d", "");
    return;
  }
  path.setAttribute("d", trail.d);
  gradient.setAttribute("x1", trail.tail.x);
  gradient.setAttribute("y1", trail.tail.y);
  gradient.setAttribute("x2", trail.head.x);
  gradient.setAttribute("y2", trail.head.y);
};

/**
 * Streaks of light behind every satellite on a ring, as long as the ring is turning fast. Drawn in the ring's own box,
 * so they turn with it.
 * @param {{ tools: { name: string, angle: number }[], turn: import("framer-motion").MotionValue<number>, strokeWidth: number }} props
 *   turn is the ring's rotation in degrees
 */
const Trails = ({ tools, turn, strokeWidth }) => {
  // svg references break on the brackets react puts in its ids
  const id = `trail${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const paths = useRef([]);
  const gradients = useRef([]);
  const prefersReducedMotion = useReducedMotion();
  const speed = useSpring(useVelocity(turn), SETTLE);
  const sweep = useTransform(speed, trailSweep);

  useMotionValueEvent(sweep, "change", (value) => {
    tools.forEach((tool, index) => drawTrail(paths.current[index], gradients.current[index], tool.angle, value));
  });

  if (prefersReducedMotion) return null;
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
      <defs>
        {tools.map((tool, index) => (
          <linearGradient key={tool.name} id={`${id}-${index}`} ref={(node) => (gradients.current[index] = node)} gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "var(--color-sunset-3)", stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: "var(--color-sunset-1)", stopOpacity: 0.9 }} />
          </linearGradient>
        ))}
      </defs>
      {tools.map((tool, index) => (
        <path key={tool.name} ref={(node) => (paths.current[index] = node)} fill="none" stroke={`url(#${id}-${index})`} strokeWidth={strokeWidth} strokeLinecap="round" />
      ))}
    </svg>
  );
};

export default Trails;
