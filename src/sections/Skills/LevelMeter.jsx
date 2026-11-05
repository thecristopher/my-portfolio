import { MAX_LEVEL, METER_SIZE, levelArcs } from "./actions";

/**
 * How deep I've gone with a tool as concentric arcs, lit from the center out, the same circles the orbit is made of.
 * @param {{ level: number, className?: string }} props level from 0 to MAX_LEVEL
 */
const LevelMeter = ({ level, className = "size-7" }) => (
  <svg viewBox={`0 0 ${METER_SIZE} ${METER_SIZE}`} className={`shrink-0 ${className}`} role="img" aria-label={`${level} out of ${MAX_LEVEL}`}>
    {levelArcs(level).map((arc) => (
      <path key={arc.d} d={arc.d} fill="none" strokeWidth="1.35" strokeLinecap="round" className={arc.isLit ? "stroke-fg" : "stroke-line-strong"} />
    ))}
  </svg>
);

export default LevelMeter;
