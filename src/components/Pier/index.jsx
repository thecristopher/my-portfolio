// a dusky lavender against the light sky, so the pier belongs to the sky instead of punching a hole in it, and a near
// black cutout once the page is dark. set on the svg as --pier-ink
const SILHOUETTE = "var(--pier-ink)";
const LAMP = "#ffd38a";

// the pier in profile, walking out from the shore past the right edge and standing in the water a little in front of
// the horizon: a deck with real thickness on paired piles braced in X, a rail with posts, and lamp posts with their
// lanterns hanging off an arm. the piles end at the waterline, where the water breaks around them and mirrors them
const PIER = { width: 600, height: 128, horizonAt: 22, start: 18, deck: 50, deckDepth: 8, water: 90, lampTop: 10 };
const BAY = 48;
const PILES = Array.from({ length: 13 }, (_, index) => PIER.width - 8 - index * BAY);
const BALUSTERS = Array.from({ length: 50 }, (_, index) => PIER.width - 4 - index * 12).filter((x) => x > PIER.start);
const LAMP_XS = [544, 448, 352, 256, 160];
const RAIL = { top: PIER.deck - 13, middle: PIER.deck - 6 };

const Lamp = ({ x, isLit, side }) => (
  <g>
    <rect x={x - 1.4} y={PIER.lampTop + 2} width={2.8} height={PIER.deck - PIER.lampTop - 2} fill={SILHOUETTE} />
    {/* the arm reaching out over the deck and the lantern hanging off it */}
    <path d={`M${x} ${PIER.lampTop + 3} q0 -6 7 -6 l3 0`} fill="none" stroke={SILHOUETTE} strokeWidth={2} />
    <path d={`M${x + 6.5} ${PIER.lampTop - 2} h7 l-1.5 6 h-4 z`} fill={SILHOUETTE} />
    <g className="transition-opacity duration-700" style={{ opacity: isLit ? 1 : 0 }}>
      <circle cx={x + 10} cy={PIER.lampTop + 3} r={22} fill={`url(#lamp-glow-${side})`} />
      <circle cx={x + 10} cy={PIER.lampTop + 2.5} r={2.6} fill={LAMP} />
      {/* the lantern's light broken up on the water past the piles */}
      <rect x={x + 8} y={PIER.water + 4} width={4} height={2} fill={LAMP} opacity={0.75} />
      <rect x={x + 8.5} y={PIER.water + 10} width={3} height={2} fill={LAMP} opacity={0.45} />
      <rect x={x + 9} y={PIER.water + 16} width={2} height={2} fill={LAMP} opacity={0.25} />
    </g>
  </g>
);

// the piles in pairs, front and back, with an X brace in every bay between them
const Piles = () => (
  <g fill={SILHOUETTE}>
    {PILES.map((x) => (
      <g key={x}>
        <rect x={x - 3.5} y={PIER.deck} width={7} height={PIER.water - PIER.deck} />
        <rect x={x - 8} y={PIER.deck} width={3} height={PIER.water - PIER.deck - 2} opacity={0.6} />
      </g>
    ))}
    {PILES.slice(1).map((x) => (
      <path key={`brace-${x}`} d={`M${x} ${PIER.deck + 8}L${x + BAY} ${PIER.water - 10}M${x + BAY} ${PIER.deck + 8}L${x} ${PIER.water - 10}`} stroke={SILHOUETTE} strokeWidth={1.6} opacity={0.85} />
    ))}
  </g>
);

// where the piles meet the sea: a lit waterline, a little foam around each pile and their reflection fading under it
const Waterline = ({ side }) => (
  <g>
    <g opacity={0.45}>
      {PILES.map((x) => (
        <rect key={x} x={x - 3} y={PIER.water + 1} width={6} height={18} fill={`url(#pile-reflection-${side})`} />
      ))}
    </g>
    <rect x={PIER.start} y={PIER.water - 0.5} width={PIER.width - PIER.start} height={1} fill="var(--color-sunset-1)" opacity={0.35} />
    {PILES.map((x) => (
      <ellipse key={`foam-${x}`} cx={x} cy={PIER.water} rx={7} ry={1.4} fill="#fff" opacity={0.22} />
    ))}
  </g>
);

const Rail = () => (
  <g fill={SILHOUETTE}>
    <rect x={PIER.start} y={RAIL.top} width={PIER.width - PIER.start} height={2.2} />
    <rect x={PIER.start} y={RAIL.middle} width={PIER.width - PIER.start} height={1.2} />
    {BALUSTERS.map((x) => (
      <rect key={x} x={x - 0.8} y={RAIL.top} width={1.6} height={PIER.deck - RAIL.top} />
    ))}
  </g>
);

/**
 * The Rosarito pier in profile, standing in the water just in front of the horizon. The same pier opens the page at
 * dawn and closes it at dusk, so both scenes draw it from here. Its lamps fade on and off as `lit` says.
 * @param {{ lit: boolean[], horizon: string, side?: "right" | "left", className?: string, svgRef?: import("react").Ref<SVGSVGElement> }} props
 *   lit is one flag per lamp, the first the one nearest the shore. horizon is where the sea starts, from the top of the
 *   scene. side is where the shore is: the pier walks out from that edge. className sets --pier, its width
 */
const Pier = ({ lit, horizon, side = "right", className = "", svgRef }) => (
  <svg
    ref={svgRef}
    style={{ top: `calc(${horizon} - var(--pier) * ${PIER.horizonAt / PIER.width})` }}
    viewBox={`0 0 ${PIER.width} ${PIER.height}`}
    className={`absolute w-(--pier) overflow-visible [--pier-ink:#8f80a8] dark:[--pier-ink:#160f1c] ${side === "left" ? "left-0 -scale-x-100" : "right-0"} ${className}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id={`lamp-glow-${side}`}>
        <stop offset="0%" stopColor={LAMP} stopOpacity="0.7" />
        <stop offset="100%" stopColor={LAMP} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`pile-reflection-${side}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={{ stopColor: SILHOUETTE, stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: SILHOUETTE, stopOpacity: 0 }} />
      </linearGradient>
    </defs>
    <Waterline side={side} />
    <Piles />
    <Rail />
    {/* the deck with its thickness, and the end of the pier squared off with a post so it doesn't just stop */}
    <rect x={PIER.start} y={PIER.deck} width={PIER.width - PIER.start} height={PIER.deckDepth} fill={SILHOUETTE} />
    <rect x={PIER.start - 2} y={RAIL.top - 3} width={4} height={PIER.deck - RAIL.top + PIER.deckDepth + 3} fill={SILHOUETTE} />
    {/* the low sun catching the top of the rail and the deck, so the pier still reads on a dark sea with its lamps out */}
    <rect x={PIER.start} y={RAIL.top} width={PIER.width - PIER.start} height={0.8} fill="var(--color-sunset-1)" opacity={0.55} />
    <rect x={PIER.start} y={PIER.deck} width={PIER.width - PIER.start} height={1} fill="var(--color-sunset-1)" opacity={0.45} />
    {LAMP_XS.map((x, index) => (
      <Lamp key={x} x={x} isLit={lit[index] ?? false} side={side} />
    ))}
  </svg>
);

/** How many lamps the pier has. */
export const PIER_LAMPS = LAMP_XS.length;

export default Pier;
