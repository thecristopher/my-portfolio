import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "../../components/CountUp";
import { easeOutExpo } from "../../lib/motion";
import { metricRing } from "./actions";

const RADIUS = 44;
// the gap between the parts of a split ring, as a share of the whole lap
const GAP = 0.03;

// one stretch of the ring, turned to where its part of the lap starts
const Arc = ({ start, length, delay, gradientId, isStill }) => (
  <motion.circle
    cx="50"
    cy="50"
    r={RADIUS}
    fill="none"
    stroke={`url(#${gradientId})`}
    strokeWidth="5"
    strokeLinecap="round"
    style={{ rotate: start * 360 - 90 }}
    initial={isStill ? false : { pathLength: 0 }}
    whileInView={{ pathLength: length }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 1.4, delay, ease: easeOutExpo }}
  />
);

/**
 * A case study number in a ring that draws itself in as it scrolls into view, the same round family as the tools in
 * orbit. A percentage fills to its value, a multiplier draws one lap split into that many parts.
 * @param {{ metric: { value: string, label: string } }} props
 */
const MetricRing = ({ metric }) => {
  // useId hands back characters an SVG url(#...) reference chokes on, so only letters and digits stay
  const gradientId = `ring${useId().replace(/[^a-z0-9]/gi, "")}`;
  const isStill = useReducedMotion();
  const { fill, segments } = metricRing(metric.value);
  const part = 1 / segments;
  const arcs = Array.from({ length: segments }, (_, index) => ({
    start: index * part + (segments > 1 ? GAP / 2 : 0),
    length: segments > 1 ? part - GAP : fill,
  }));

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <dt className="relative grid aspect-square w-full max-w-36 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--color-sunset-1)" }} />
              <stop offset="55%" style={{ stopColor: "var(--color-sunset-2)" }} />
              <stop offset="100%" style={{ stopColor: "var(--color-sunset-3)" }} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="5" className="text-line" />
          {arcs.map((arc, index) => (
            <Arc key={index} start={arc.start} length={arc.length} delay={0.2 + index * 0.25} gradientId={gradientId} isStill={isStill} />
          ))}
        </svg>
        <span className="text-sunset relative text-3xl font-semibold tracking-tight sm:text-4xl">
          <CountUp value={metric.value} />
        </span>
      </dt>
      <dd className="text-sm text-muted text-balance">{metric.label}</dd>
    </div>
  );
};

export default MetricRing;
