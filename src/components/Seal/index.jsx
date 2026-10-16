import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { EMBLEMS } from "./emblems";
import { easeOutExpo } from "../../lib/motion";

const RING_RADIUS = 46;
// a circle drawn as two arcs, so the file name can run around it
const RING_PATH = `M60,60 m-${RING_RADIUS},0 a${RING_RADIUS},${RING_RADIUS} 0 1,1 ${RING_RADIUS * 2},0 a${RING_RADIUS},${RING_RADIUS} 0 1,1 -${RING_RADIUS * 2},0`;

const RING_LETTERS = 46;

const MOTION_TAGS = { path: motion.path, circle: motion.circle };

// every section signs off with its own seal: the buffer name runs around a ring that turns as you scroll past,
// and the section's mark draws itself in the middle, stroke by stroke, the first time it comes into view
const Seal = ({ id, label, index, className = "" }) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const turn = useSpring(useTransform(scrollYProgress, [0, 1], [-60, 120]), { stiffness: 80, damping: 24 });
  const nodes = EMBLEMS[id] ?? [];
  // about as many letters as fit the ring comfortably, whatever the buffer name's length
  const unit = `${label} · ${index} · `;
  const ringText = unit.repeat(Math.max(2, Math.round(RING_LETTERS / unit.length)));

  return (
    <div ref={ref} className={`pointer-events-none relative size-28 ${className}`} aria-hidden="true">
      <motion.svg viewBox="0 0 120 120" className="absolute inset-0 size-full" style={prefersReducedMotion ? undefined : { rotate: turn }}>
        <defs>
          <path id={`seal-ring-${id}`} d={RING_PATH} />
        </defs>
        <circle cx="60" cy="60" r="58" fill="none" stroke="var(--color-line-strong)" strokeWidth="1" />
        <circle cx="60" cy="60" r="34" fill="none" stroke="var(--color-line)" strokeWidth="1" />
        <text className="fill-faint font-mono" fontSize="8.4" letterSpacing="2.1">
          <textPath href={`#seal-ring-${id}`} textLength={2 * Math.PI * RING_RADIUS - 4}>
            {ringText.toUpperCase()}
          </textPath>
        </text>
      </motion.svg>
      <svg
        viewBox="0 0 24 24"
        className="absolute inset-[34%] size-[32%] overflow-visible text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {nodes.map(([tag, attributes], position) => {
          const Shape = MOTION_TAGS[tag];
          return (
            <Shape
              key={position}
              {...attributes}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1.4, delay: 0.2 + position * 0.12, ease: easeOutExpo }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Seal;
