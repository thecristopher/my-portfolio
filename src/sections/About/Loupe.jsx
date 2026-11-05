import { motion } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { cityHops, jobCount, sideArc } from "./actions";
import { BEATS, LOUPE } from "./mapStory";

const CENTERED = { transformBox: "fill-box", transformOrigin: "center" };
// how long a hop takes to draw, in scroll progress, ending right as its job lights up
const HOP_DRAW = 0.03;

// where each job happened in the loupe, carrying the last known city over a job that has none
const spotsFor = (journey) => {
  let last = LOUPE.cities.Rosarito;
  return journey.map((stop) => {
    last = LOUPE.cities[stop.city] ?? last;
    return last;
  });
};

const Hop = ({ hop, progress }) => {
  const pathLength = useScrollRange(progress, [hop.at - HOP_DRAW, hop.at], [0, 1]);
  const shown = useScrollRange(progress, [hop.at - HOP_DRAW, hop.at - HOP_DRAW + 0.002], [0, 1]);
  // the same bend both ways: going back swaps the ends, so the return trip lands on the other side by itself
  const d = sideArc(LOUPE.cities[hop.from], LOUPE.cities[hop.to], 0.28);
  return <motion.path d={d} style={{ pathLength, opacity: shown }} fill="none" stroke="url(#loupe-hop)" strokeWidth="1.4" strokeLinecap="round" />;
};

const City = ({ name, spot, stops, times, journey, progress }) => {
  const firstAt = Math.min(...stops.map((stop) => times[journey.indexOf(stop)]));
  const glow = useScrollRange(progress, [firstAt - 0.01, firstAt], [0, 1]);
  const textX = name === "Tijuana" ? spot.x - 4 : spot.x + 5;
  const anchor = name === "Tijuana" ? "end" : "start";
  return (
    <g>
      <motion.circle cx={spot.x} cy={spot.y} r="7" fill="url(#loupe-glow)" style={{ opacity: glow, ...CENTERED }} />
      <circle cx={spot.x} cy={spot.y} r="1.8" className="fill-fg" />
      <g textAnchor={anchor}>
        <text x={textX} y={spot.y - 1} style={{ fontSize: "6px" }} className="fill-fg font-semibold tracking-tight">
          {name}
        </text>
        <text x={textX} y={spot.y + 5} style={{ fontSize: "3.6px" }} className="fill-muted font-medium">
          {jobCount(stops)}
        </text>
      </g>
    </g>
  );
};

// the dot that is me, riding from job to job as the page scrolls
const Traveler = ({ spots, times, progress, isStill }) => {
  const canMove = times.length > 1;
  const cx = useScrollRange(progress, canMove ? times : [0, 1], canMove ? spots.map((spot) => spot.x) : [spots[0].x, spots[0].x]);
  const cy = useScrollRange(progress, canMove ? times : [0, 1], canMove ? spots.map((spot) => spot.y) : [spots[0].y, spots[0].y]);
  return (
    <motion.g style={{ x: cx, y: cy }}>
      {!isStill && (
        <motion.circle r="3" fill="none" stroke="var(--color-sunset-1)" strokeWidth="0.6" style={CENTERED} animate={{ scale: [1, 2.4], opacity: [0.9, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
      )}
      <circle r="2.6" fill="var(--color-sunset-1)" stroke="white" strokeWidth="0.8" />
    </motion.g>
  );
};

/**
 * A magnifying glass over the corner of Baja where the whole career happened: Tijuana up by the border, Rosarito down
 * the coast, and a dot hopping between them one job at a time while the map is still close on the peninsula.
 * @param {{ journey: { company: string, city: string | null, isRemote: boolean }[], times: number[], progress: import("framer-motion").MotionValue<number>, isStill: boolean }} props
 */
const Loupe = ({ journey, times, progress, isStill }) => {
  const opacity = useScrollRange(progress, [BEATS.coast[0], BEATS.closeUp[0], BEATS.pull[0], BEATS.pull[0] + 0.04], [0, 1, 1, 0]);
  const scale = useScrollRange(progress, [BEATS.coast[0], BEATS.closeUp[0], BEATS.pull[0], BEATS.pull[0] + 0.04], [0.85, 1, 1, 0.6]);
  if (journey.length === 0) return null;
  const spots = spotsFor(journey);
  const hops = cityHops(journey, times).filter((hop) => LOUPE.cities[hop.from] && LOUPE.cities[hop.to]);
  const cities = Object.entries(LOUPE.cities).map(([name, spot]) => ({ name, spot, stops: journey.filter((stop) => stop.city === name) }));

  return (
    <motion.div
      style={isStill ? undefined : { opacity, scale }}
      className="pointer-events-none absolute top-0 right-0 w-[52%] md:top-1/2 md:right-[2%] md:w-[min(46%,24rem)] md:-translate-y-1/2"
      aria-label="Tijuana and Rosarito up close, with the jobs I held in each"
      role="img"
    >
      <p className="mb-2 flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-muted sm:text-xs">
        <span className="size-1.5 rounded-full bg-[var(--color-sunset-1)]" aria-hidden="true" />
        Where I actually worked · 20 km of coast
      </p>
      <div className="glass relative aspect-square overflow-hidden rounded-full shadow-2xl ring-1 ring-line">
        <svg viewBox="0 0 100 100" className="size-full">
          <defs>
            <linearGradient id="loupe-hop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--color-sunset-1)" />
              <stop offset="1" stopColor="var(--color-sunset-3)" />
            </linearGradient>
            <radialGradient id="loupe-glow">
              <stop offset="0" stopColor="var(--color-sunset-1)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--color-sunset-1)" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* the Pacific, the land and the free road between the two cities */}
          <path d={`${LOUPE.coast}L0 100L0 0Z`} fill="color-mix(in oklab, var(--color-sunset-3) 10%, transparent)" />
          <path d={LOUPE.coast} fill="none" stroke="var(--color-line-strong)" strokeWidth="0.8" />
          <path d={LOUPE.road} fill="none" stroke="var(--color-line-strong)" strokeWidth="0.6" strokeDasharray="1.6 1.6" />
          <line x1="0" x2="100" y1={LOUPE.border} y2={LOUPE.border} stroke="var(--color-sunset-2)" strokeWidth="0.5" strokeDasharray="2 1.2" opacity="0.7" />
          <text x="50" y={LOUPE.border - 3} textAnchor="middle" style={{ fontSize: "3.2px", letterSpacing: "0.3em" }} className="fill-faint font-semibold">
            U.S.
          </text>
          <text x="50" y={LOUPE.border + 5.5} textAnchor="middle" style={{ fontSize: "3.2px", letterSpacing: "0.3em" }} className="fill-faint font-semibold">
            MÉXICO
          </text>
          <text x="9" y="56" style={{ fontSize: "3.2px", letterSpacing: "0.25em" }} className="fill-faint font-semibold" transform="rotate(-90 9 56)">
            PACIFIC
          </text>
          {hops.map((hop) => (
            <Hop key={`${hop.from}-${hop.to}-${hop.at}`} hop={hop} progress={progress} />
          ))}
          {cities.map((city) => city.stops.length > 0 && <City key={city.name} {...city} times={times} journey={journey} progress={progress} />)}
          <Traveler spots={spots} times={times} progress={progress} isStill={isStill} />
        </svg>
      </div>
    </motion.div>
  );
};

export default Loupe;
