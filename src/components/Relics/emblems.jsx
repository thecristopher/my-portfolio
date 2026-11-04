import {
  POKE_RED,
  FLAMEL_RED,
  FLAMEL_STROKES,
  UMBRELLA_RED,
  UMBRELLA_WEDGES,
  PUZZLE_GOLD,
  AIR_ORANGE,
  ARROW_BLUE,
  TRIFORCE_GOLD,
  TRIFORCE_PIECES,
  WATER_BLUE,
  GRACE_GOLD,
  GRACE_STROKES,
  D20_GOLD,
  D20_OUTLINE,
  D20_FACE,
  D20_EDGES,
  WILLOW_RED,
  TWIG_HALVES,
} from "./artwork";

// every emblem is a clean vector on a 64 unit square, drawn in its franchise's own colors. the page shows them tiny
// and nearly see through, each moment draws them again large

const Svg = ({ className, children, label }) => (
  <svg viewBox="0 0 64 64" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"}>
    {children}
  </svg>
);

/** The Poké Ball: red over white, the band and the button. */
export const PokeBall = ({ className = "" }) => (
  <Svg className={className}>
    <path d="M6 32a26 26 0 0 1 52 0Z" fill={POKE_RED} />
    <path d="M6 32a26 26 0 0 0 52 0Z" fill="#f4f4f4" />
    <circle cx="32" cy="32" r="26" fill="none" stroke="#1a1a1a" strokeWidth="3" />
    <path d="M6 32h52" stroke="#1a1a1a" strokeWidth="3.5" />
    <circle cx="32" cy="32" r="8" fill="#f4f4f4" stroke="#1a1a1a" strokeWidth="3" />
    <circle cx="32" cy="32" r="3.5" fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
  </Svg>
);

/** The Flamel cross from the back of Ed's coat. */
export const FlamelCross = ({ className = "" }) => (
  <Svg className={className}>
    {FLAMEL_STROKES.map((d) => (
      <path key={d} d={d} fill="none" stroke={FLAMEL_RED} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    ))}
  </Svg>
);

/** The Umbrella Corporation logo, eight wedges in red and white. */
export const UmbrellaLogo = ({ className = "" }) => (
  <Svg className={className}>
    {UMBRELLA_WEDGES.map((wedge) => (
      <path key={wedge.d} d={wedge.d} fill={wedge.fill} />
    ))}
  </Svg>
);

/** The Millennium Puzzle: an upside down pyramid of gold with the eye on its face. */
export const MillenniumPuzzle = ({ className = "" }) => (
  <Svg className={className}>
    <path d="M6 10H58L32 58Z" fill={PUZZLE_GOLD} stroke="#8a6420" strokeWidth="2" strokeLinejoin="round" />
    <path d="M32 10L19 34M32 10L45 34" stroke="#b58a32" strokeWidth="1" />
    <path d="M22 22Q32 14 42 22Q32 30 22 22Z" fill="#3a2a08" />
    <circle cx="32" cy="22" r="3" fill={PUZZLE_GOLD} />
    <path d="M28 27L26 34M36 27L38 33" stroke="#3a2a08" strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

/** Aang's arrow, pointing down the way it runs onto his forehead. */
export const AirbenderArrow = ({ className = "" }) => (
  <Svg className={className}>
    <path d="M32 60L16 36H26V6H38V36H48Z" fill={ARROW_BLUE} />
    <path d="M32 60L16 36H26V6H38V36H48Z" fill="none" stroke="#1d4f8a" strokeWidth="1.5" strokeLinejoin="round" />
  </Svg>
);

/** The Triforce: three golden triangles. */
export const Triforce = ({ className = "" }) => (
  <Svg className={className}>
    {TRIFORCE_PIECES.map((d) => (
      <path key={d} d={d} fill={TRIFORCE_GOLD} stroke="#a87b12" strokeWidth="1.5" strokeLinejoin="round" />
    ))}
  </Svg>
);

/** Tanjiro's black Nichirin blade, resting at an angle, its edge catching the water. */
export const NichirinBlade = ({ className = "" }) => (
  <Svg className={className}>
    <path d="M22 42L56 8" stroke="#141414" strokeWidth="5" strokeLinecap="round" />
    <path d="M24 39L55 9" stroke={WATER_BLUE} strokeWidth="1.2" strokeLinecap="round" />
    <rect x="15" y="40" width="10" height="10" rx="2" transform="rotate(45 20 45)" fill="#2a2a2a" stroke="#c9a14a" strokeWidth="1.2" />
    <path d="M17 47L7 57" stroke="#3b2a1a" strokeWidth="5" strokeLinecap="round" />
    <path d="M15 49l-2 2m0-4 2 2m-4 2 2 2m0-4-2 2" stroke="#c9a14a" strokeWidth="0.8" />
  </Svg>
);

/** The sigil of grace, drawn in golden light. */
export const GraceSigil = ({ className = "" }) => (
  <Svg className={className}>
    {GRACE_STROKES.map((d) => (
      <path key={d} d={d} fill="none" stroke={GRACE_GOLD} strokeWidth="2.5" strokeLinecap="round" />
    ))}
  </Svg>
);

/**
 * The d20 face on, with the number it shows.
 * @param {{ className?: string, face?: number }} props
 */
export const D20 = ({ className = "", face = 20 }) => (
  <Svg className={className}>
    <polygon points={D20_OUTLINE} fill="#2a1a0c" stroke={D20_GOLD} strokeWidth="2" strokeLinejoin="round" />
    {D20_EDGES.map((d) => (
      <path key={d} d={d} stroke={D20_GOLD} strokeWidth="1" opacity="0.6" />
    ))}
    <polygon points={D20_FACE} fill="#3a2610" stroke={D20_GOLD} strokeWidth="1.6" strokeLinejoin="round" />
    <text x="32" y="38.5" textAnchor="middle" fontSize="11" fontWeight="700" fill={D20_GOLD} fontFamily="ui-sans-serif, system-ui">
      {face}
    </text>
  </Svg>
);

/**
 * The One Wish Willow, a twig with a red thread tied at its middle. Snapped, the halves fall apart.
 * @param {{ className?: string, isSnapped?: boolean }} props
 */
export const WillowTwig = ({ className = "", isSnapped = false }) => (
  <Svg className={className}>
    {TWIG_HALVES.map((half) => (
      <g key={half.side} style={{ transform: isSnapped ? `translate(${half.side * 3}px, 3px) rotate(${half.side * 12}deg)` : "none", transformOrigin: "32px 34px", transition: "transform 0.5s" }}>
        <path d={half.d} fill="none" stroke="#7a5532" strokeWidth="3.5" strokeLinecap="round" />
        <path d={half.leaf} fill="#6fa35a" />
      </g>
    ))}
    {!isSnapped && <path d="M30 31l4 6M34 31l-4 6" stroke={WILLOW_RED} strokeWidth="2" strokeLinecap="round" />}
  </Svg>
);
