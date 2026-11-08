import { useLayoutEffect, useRef } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useScrollRange } from "../../hooks/useScrollRange";
import { arcPath, pullBack, reachRadius } from "./actions";
import { BAJA, BEATS, CLOSENESS, COAST, COUNTRIES, HOME, LAND, MAP, OFFICES, ROUTE_DRAW } from "./mapStory";

const CENTERED = { transformBox: "fill-box", transformOrigin: "center" };

// a lighthouse beam turning over a stop: two cones of light sweeping around it, so the light reads from far away
const Beam = ({ x, y, size, seconds, isStill }) => (
  <g transform={`translate(${x} ${y})`} style={{ mixBlendMode: "screen" }}>
    <g>
      {!isStill && <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={`${seconds}s`} repeatCount="indefinite" />}
      <path d={`M0 0L${size} ${-size * 0.22}A${size} ${size} 0 0 1 ${size} ${size * 0.22}Z`} fill="url(#reach-beam)" />
      <path d={`M0 0L${-size} ${size * 0.22}A${size} ${size} 0 0 1 ${-size} ${-size * 0.22}Z`} fill="url(#reach-beam)" />
    </g>
  </g>
);

// a ring that keeps rippling out of a stop once it's lit
const Ripple = ({ x, y, color, isStill }) =>
  !isStill && (
    <motion.circle
      cx={x}
      cy={y}
      r="1.1"
      fill="none"
      stroke={color}
      strokeWidth="0.12"
      style={CENTERED}
      animate={{ scale: [1, 2.8], opacity: [0.8, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
    />
  );

// a route from home to a place: it draws across its slice of the scroll, then a comet of light keeps running it
const Flight = ({ to, index, color, bow, progress, isStill }) => {
  const start = to.at;
  const pathLength = useScrollRange(progress, [start, start + ROUTE_DRAW], [0, 1]);
  // hidden until it starts drawing, a route of zero length still leaves its round cap behind as a dot
  const shown = useScrollRange(progress, [start, start + 0.004], [0, 1]);
  const trail = useScrollRange(progress, [start + ROUTE_DRAW, start + ROUTE_DRAW + 0.02], [0, 1]);
  const d = arcPath(HOME, to, bow);
  return (
    <g>
      <motion.path
        d={d}
        style={{ pathLength, opacity: shown }}
        fill="none"
        stroke={color}
        strokeWidth="0.3"
        strokeLinecap="round"
        opacity="0.7"
      />
      <motion.g style={{ opacity: trail }}>
        <motion.path
          d={d}
          pathLength="1"
          fill="none"
          stroke="var(--color-sunset-1)"
          strokeWidth="0.9"
          strokeLinecap="round"
          strokeDasharray="0.14 0.86"
          filter="url(#reach-glow)"
          animate={isStill ? undefined : { strokeDashoffset: [1, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
        />
      </motion.g>
    </g>
  );
};

// a stop lighting up as its route lands, with its own lighthouse
const Stop = ({ place, index, color, progress, isStill }) => {
  const at = place.at + ROUTE_DRAW;
  const scale = useScrollRange(progress, [at, at + 0.03], [0, 1]);
  return (
    <motion.g style={{ scale, ...CENTERED }}>
      <Beam x={place.x} y={place.y} size={9} seconds={7 + index} isStill={isStill} />
      <Ripple x={place.x} y={place.y} color={color} isStill={isStill} />
      <circle cx={place.x} cy={place.y} r="0.9" fill={color} />
    </motion.g>
  );
};

// the routes of one chapter and the stops they land on, all in the chapter's color. bow is how high they arc, kept
// low for the routes that cross an ocean so they stay on the map
const Routes = ({ places, color, bow = 0.45, progress, isStill }) => (
  <>
    {places.map((place, index) => (
      <Flight key={place.name} to={place} index={index} color={color} bow={bow} progress={progress} isStill={isStill} />
    ))}
    {places.map((place, index) => (
      <Stop key={place.name} place={place} index={index} color={color} progress={progress} isStill={isStill} />
    ))}
  </>
);

// home, which stays the same size on screen while the camera pulls back from it
const Home = ({ progress, isStill }) => {
  const scale = useScrollRange(progress, BEATS.home, [0, 1]);
  const nameOpacity = useScrollRange(progress, [BEATS.home[1], BEATS.coast[0] + 0.03, BEATS.pull[0] + 0.06, BEATS.pull[0] + 0.12], [0, 1, 1, 0]);
  return (
    // drawn at the size it has on the whole map, however close the camera is
    <g style={{ transform: "scale(calc(1 / var(--zoom, 1)))", transformOrigin: `${HOME.x}px ${HOME.y}px` }}>
      <motion.g style={{ scale, ...CENTERED }}>
        <Beam x={HOME.x} y={HOME.y} size={12} seconds={6} isStill={isStill} />
        <Ripple x={HOME.x} y={HOME.y} color="var(--color-sunset-1)" isStill={isStill} />
        <circle cx={HOME.x} cy={HOME.y} r="1.2" fill="var(--color-sunset-1)" />
        <motion.text x={HOME.x + 1.8} y={HOME.y - 1.2} style={{ opacity: nameOpacity, fontSize: "3px" }} className="fill-fg font-semibold">
          Rosarito
        </motion.text>
      </motion.g>
    </g>
  );
};

// the camera: close on Baja while its coast draws, then pulling back until the whole world is on screen. it's set by
// hand on the elements, so a scroll never re-renders the thousands of dots
const useCamera = (progress) => {
  const svgRef = useRef(null);
  const groupRef = useRef(null);
  const isWide = useMediaQuery("(min-width: 768px)");
  const closeness = isWide ? CLOSENESS.wide : CLOSENESS.narrow;
  const aim = (value) => {
    const [from, to] = BEATS.pull;
    const { scale, transform } = pullBack((value - from) / (to - from), BAJA, MAP, closeness);
    groupRef.current?.setAttribute("transform", transform);
    svgRef.current?.style.setProperty("--zoom", String(scale));
  };
  useLayoutEffect(() => aim(progress.get()));
  useMotionValueEvent(progress, "change", aim);
  return { svgRef, groupRef };
};

/**
 * The world map itself: Baja's coast traced by hand, the dotted world fading in as the camera pulls back, the routes
 * flying out with comets running them, a lighthouse turning over every stop, and the sunset spreading over every coast.
 * @param {{ progress: import("framer-motion").MotionValue<number>, isStill: boolean }} props progress runs the story
 */
const ReachMap = ({ progress, isStill }) => {
  const { svgRef, groupRef } = useCamera(progress);
  const coastLength = useScrollRange(progress, BEATS.coast, [0, 1]);
  const landOpacity = useScrollRange(progress, BEATS.land, [0, 1]);
  const lightRadius = useScrollRange(progress, BEATS.light, [0, reachRadius(HOME, { width: MAP.width, height: MAP.height })]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MAP.width} ${MAP.height}`}
      className="w-full overflow-hidden"
      role="img"
      aria-label="A world map. Baja California's coast is traced first, then the map pulls back, routes leave Rosarito for Mexico, the U.S. and Canada, then for Querétaro, New York, Montreal, London, India and Kuala Lumpur, and the light spreads over the whole world."
    >
      <defs>
        <linearGradient id="reach-sunset" x1="0" x2={MAP.width} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-sunset-1)" />
          <stop offset="0.5" stopColor="var(--color-sunset-2)" />
          <stop offset="1" stopColor="var(--color-sunset-3)" />
        </linearGradient>
        <radialGradient id="reach-beam" cx="0" cy="0" r="12" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-sunset-1)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--color-sunset-1)" stopOpacity="0" />
        </radialGradient>
        <filter id="reach-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="reach-light">
          <motion.circle cx={HOME.x} cy={HOME.y} r={lightRadius} />
        </clipPath>
      </defs>
      <g ref={groupRef}>
        <motion.g style={{ opacity: landOpacity }}>
          {/* the dots keep their size on screen at any zoom, so close in they read as a sparse grid instead of blobs */}
          <path d={LAND} stroke="var(--color-line-strong)" style={{ strokeWidth: "calc(0.55px / var(--zoom, 1))" }} strokeLinecap="round" />
          <path
            d={LAND}
            stroke="url(#reach-sunset)"
            style={{ strokeWidth: "calc(0.55px / var(--zoom, 1))" }}
            strokeLinecap="round"
            clipPath="url(#reach-light)"
            opacity="0.9"
          />
        </motion.g>
        {/* a faint ghost of the coast from the first frame, so the scene opens on a map and the glowing line traces it */}
        <path
          d={COAST}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeWidth: "calc(0.3px / var(--zoom, 1))", strokeDasharray: "calc(1.2px / var(--zoom, 1)) calc(1.2px / var(--zoom, 1))" }}
        />
        <motion.path
          d={COAST}
          style={{ pathLength: coastLength, strokeWidth: "calc(0.4px / var(--zoom, 1))" }}
          fill="none"
          stroke="url(#reach-sunset)"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#reach-glow)"
        />
        <Routes places={COUNTRIES} color="var(--color-sunset-2)" progress={progress} isStill={isStill} />
        {/* the last chapter flies in the dusk violet, the color the page turns as the moon comes up */}
        <Routes places={OFFICES} color="var(--color-sunset-3)" bow={0.2} progress={progress} isStill={isStill} />
        <Home progress={progress} isStill={isStill} />
      </g>
    </svg>
  );
};

export default ReachMap;
