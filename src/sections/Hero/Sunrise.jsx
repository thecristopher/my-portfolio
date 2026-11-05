import { useState } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { isLampLit } from "./actions";

const HORIZON = "70%";
const SUN_SIZE = "min(46vmin, 26rem)";
const SEA = "color-mix(in oklab, var(--color-sunset-3) 10%, var(--color-ink))";
// a dusky lavender against the light sky, so the pier belongs to the dawn instead of punching a hole in it, and the
// near black cutout once the page is dark
const SILHOUETTE = "var(--pier-ink)";
const LAMP = "#ffd38a";

// the last stars of the night, scattered by hand so they never land on the same spots twice in a row
const STARS = [
  [6, 12, 2], [14, 30, 1.5], [22, 8, 1], [31, 22, 2], [38, 40, 1], [47, 10, 1.5], [55, 32, 1], [62, 6, 2],
  [69, 26, 1], [76, 14, 1.5], [84, 36, 1], [91, 9, 2], [96, 28, 1], [10, 48, 1], [44, 52, 1], [88, 54, 1.5],
];

// how far the sunrise has gone, in steps, so the lamps don't re-render on every scrolled pixel
const useSunriseStep = (progress) => {
  const [step, setStep] = useState(() => progress.get());
  useMotionValueEvent(progress, "change", (value) => {
    const rounded = Math.round(value * 50) / 50;
    if (rounded !== step) setStep(rounded);
  });
  return step;
};

// the pier in profile, walking out from the shore on the right and sitting a little in front of the horizon: a heavy
// deck on thick piles, a rail, and tall lamp posts that stand up against the sky
const PIER = { width: 600, height: 110, horizonAt: 22, deck: 50, deckDepth: 7, water: 94, lampTop: 12 };
const PILES = Array.from({ length: 12 }, (_, index) => 588 - index * 50);
const LAMP_XS = [538, 438, 338, 238, 138];

const Lamp = ({ x, isLit }) => (
  <g>
    <rect x={x - 1.25} y={PIER.lampTop + 4} width={2.5} height={PIER.deck - PIER.lampTop - 4} fill={SILHOUETTE} />
    <rect x={x - 5} y={PIER.lampTop} width={10} height={5} rx={1.5} fill={SILHOUETTE} />
    <g className="transition-opacity duration-700" style={{ opacity: isLit ? 1 : 0 }}>
      <circle cx={x} cy={PIER.lampTop + 6} r={22} fill="url(#lamp-glow)" />
      <circle cx={x} cy={PIER.lampTop + 6} r={3.2} fill={LAMP} />
      {/* the lamp's light broken up on the water under the deck */}
      <rect x={x - 2} y={PIER.water - 26} width={4} height={3} fill={LAMP} opacity={0.75} />
      <rect x={x - 1.5} y={PIER.water - 19} width={3} height={3} fill={LAMP} opacity={0.5} />
      <rect x={x - 1} y={PIER.water - 12} width={2} height={3} fill={LAMP} opacity={0.3} />
    </g>
  </g>
);

// the Rosarito pier, a dark cutout against the dawn with its lamps still burning from the night
const Pier = ({ step }) => (
  <svg
    viewBox={`0 0 ${PIER.width} ${PIER.height}`}
    className="absolute right-0 w-(--pier) [--pier-ink:#8f80a8] [--pier:min(86vw,32rem)] sm:[--pier:min(52vw,44rem)] dark:[--pier-ink:#160f1c]"
    style={{ top: `calc(${HORIZON} - var(--pier) * ${PIER.horizonAt / PIER.width})` }}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="lamp-glow">
        <stop offset="0%" stopColor={LAMP} stopOpacity="0.7" />
        <stop offset="100%" stopColor={LAMP} stopOpacity="0" />
      </radialGradient>
    </defs>
    {PILES.map((x) => (
      <rect key={x} x={x - 3} y={PIER.deck} width={6} height={PIER.water - PIER.deck} fill={SILHOUETTE} />
    ))}
    {/* cross braces between the piles, the part of a pier you only notice when the sun is behind it */}
    {PILES.slice(1).map((x) => (
      <path key={`brace-${x}`} d={`M${x} ${PIER.deck + 10}L${x + 50} ${PIER.water - 14}`} stroke={SILHOUETTE} strokeWidth={2} />
    ))}
    <rect x={20} y={PIER.deck} width={PIER.width} height={PIER.deckDepth} fill={SILHOUETTE} />
    <rect x={20} y={PIER.deck - 12} width={PIER.width} height={2} fill={SILHOUETTE} />
    {PILES.map((x) => (
      <rect key={`rail-${x}`} x={x - 1} y={PIER.deck - 12} width={2} height={12} fill={SILHOUETTE} />
    ))}
    {/* the dawn catching the top of the rail and the deck, so the pier still reads on a dark sea once its lamps are out */}
    <rect x={20} y={PIER.deck - 12} width={PIER.width} height={0.8} fill="var(--color-sunset-1)" opacity={0.55} />
    <rect x={20} y={PIER.deck} width={PIER.width} height={1} fill="var(--color-sunset-1)" opacity={0.45} />
    {LAMP_XS.map((x, index) => (
      <Lamp key={x} x={x} isLit={isLampLit(index, LAMP_XS.length, step)} />
    ))}
  </svg>
);

/**
 * Dawn over the sea off Rosarito, the mirror of the sunset that closes the page: as the opening scrolls, the last stars
 * fade, the sun climbs out of the water behind the photo and the pier's lamps go out one by one, farthest first.
 * @param {{ progress: import("framer-motion").MotionValue<number> }} props how far the sunrise has gone, from 0 to 1
 */
const Sunrise = ({ progress }) => {
  const step = useSunriseStep(progress);
  const sunY = useScrollRange(progress, [0, 1], ["105%", "-40%"]);
  const sky = useScrollRange(progress, [0, 1], [0.12, 0.5]);
  const halo = useScrollRange(progress, [0.1, 0.8], [0, 0.7]);
  const stars = useScrollRange(progress, [0, 0.35], [1, 0]);
  const reflection = useScrollRange(progress, [0.15, 0.9], [0, 0.75]);
  const reflectionReach = useScrollRange(progress, [0.15, 1], [0.2, 1]);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.div className="bg-sunset absolute inset-x-0 top-0 blur-3xl" style={{ height: HORIZON, opacity: sky, maskImage: "linear-gradient(to bottom, transparent 20%, black)" }} />
      <motion.div className="absolute inset-x-0 top-0 hidden dark:block" style={{ height: HORIZON, opacity: stars }}>
        {STARS.map(([left, top, size]) => (
          <span key={`${left}-${top}`} className="absolute rounded-full bg-white" style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }} />
        ))}
      </motion.div>
      <motion.span
        className="absolute left-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ top: HORIZON, width: `calc(${SUN_SIZE} * 2.4)`, height: `calc(${SUN_SIZE} * 1.6)`, opacity: halo, background: "radial-gradient(closest-side, color-mix(in oklab, var(--color-sunset-1) 55%, transparent), transparent)" }}
      />
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
        <motion.span
          className="absolute bottom-0 left-[28%] aspect-square -translate-x-1/2 rounded-full"
          style={{
            width: SUN_SIZE,
            y: sunY,
            background: "radial-gradient(circle at 50% 40%, #fff4d1 0%, var(--color-sunset-1) 45%, var(--color-sunset-2) 100%)",
            boxShadow: "0 0 120px 30px color-mix(in oklab, var(--color-sunset-1) 45%, transparent)",
          }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0" style={{ top: HORIZON, background: SEA }}>
        <motion.span
          className="absolute top-0 left-[28%] h-[80%] -translate-x-1/2 origin-top blur-[2px]"
          style={{
            width: `calc(${SUN_SIZE} * 0.9)`,
            opacity: reflection,
            scaleY: reflectionReach,
            background: "linear-gradient(to bottom, var(--color-sunset-1), transparent)",
            maskImage: "repeating-linear-gradient(to bottom, black 0 5px, transparent 5px 13px)",
          }}
        />
      </div>
      <span className="absolute inset-x-0 h-px bg-[color-mix(in_oklab,var(--color-sunset-1)_60%,transparent)]" style={{ top: HORIZON }} />
      <Pier step={step} />
    </div>
  );
};

export default Sunrise;
