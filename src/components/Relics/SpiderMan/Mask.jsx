import { pointOn, spokeAngles, webRing } from "./helpers";

// our friendly neighbor's mask, traced from the classic comic mask: an egg shaped head narrowing to the chin, a web
// fanning out from the bridge of the nose, and the big angular lenses in thick black frames sweeping up to the temples
const MASK_HEAD =
  "M50.0 5.0 C73.2 5.0 88.8 23.9 89.6 55.9 C90.0 79.7 77.3 101.9 63.3 110.1 C57.6 113.4 53.4 113.9 50.0 113.9 C46.6 113.9 42.4 113.4 36.7 110.1 C22.7 101.9 10.0 79.7 10.4 55.9 C11.2 23.9 26.8 5.0 50.0 5.0 Z";
const MASK_EYE_FRAME = "M53.0 77.7 L84.5 42.8 C87.5 47.7 89.2 59.2 86.1 68.2 C83.0 76.4 74.8 81.2 66.6 81.2 C61.7 81.2 57.6 79.9 53.0 77.7 Z";
const MASK_EYE_LENS = "M60.8 78.2 L83.3 54.1 C85.0 59.6 84.5 66.6 80.9 71.5 C77.3 76.0 70.7 78.2 60.8 78.2 Z";
const MASK_CENTER = [50, 77.7];
const MASK_SPOKES = spokeAngles(12, 0.5);
// the web stretches a little taller than wide, the way it wraps around a head
const MASK_STRETCH = 1.12;
const MASK_RINGS = [4.5, 11, 19, 28, 38, 49, 61, 74].map((radius) =>
  webRing({ center: MASK_CENTER, radius, spokes: MASK_SPOKES, stretchY: MASK_STRETCH })
);
const MASK_SPOKE_LINES = MASK_SPOKES.map((angle) => {
  const [x, y] = pointOn(MASK_CENTER, angle, 120, MASK_STRETCH);
  return `M${MASK_CENTER[0]} ${MASK_CENTER[1]} L${x} ${y}`;
});

// Peter's classic red, and the black suit the symbiote grows over it in Spider-Man 2
const SUITS = {
  classic: { light: "#f0202a", dark: "#b3101a", webbing: "#111111", frame: "#111111" },
  symbiote: { light: "#2b2f3a", dark: "#050608", webbing: "#4a5060", frame: "#050608" },
};

/**
 * The Spider-Man mask, in the classic red or the black symbiote suit.
 * @param {{ className?: string, suit?: "classic" | "symbiote" }} props
 */
export const SpiderMask = ({ className = "", suit = "classic" }) => {
  const colors = SUITS[suit];
  return (
    <svg viewBox="0 0 100 120" className={className}>
      <defs>
        <clipPath id={`spider-mask-head-${suit}`}>
          <path d={MASK_HEAD} />
        </clipPath>
        <radialGradient id={`spider-mask-shade-${suit}`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>
      </defs>
      <path d={MASK_HEAD} fill={`url(#spider-mask-shade-${suit})`} />
      <g clipPath={`url(#spider-mask-head-${suit})`} fill="none" stroke={colors.webbing} strokeWidth="0.7">
        {MASK_SPOKE_LINES.map((line) => (
          <path key={line} d={line} />
        ))}
        {MASK_RINGS.map((ring) => (
          <path key={ring} d={ring} />
        ))}
      </g>
      <path d={MASK_HEAD} fill="none" stroke="#111111" strokeWidth="1.4" />
      {[undefined, "translate(100 0) scale(-1 1)"].map((mirror) => (
        <g key={mirror ?? "right"} transform={mirror}>
          <path d={MASK_EYE_FRAME} fill={colors.frame} />
          <path d={MASK_EYE_LENS} fill="#f4f1ea" />
        </g>
      ))}
    </svg>
  );
};

// the black suit's white spider: long hooked legs and a narrow body, drawn on the left and mirrored to the right
const EMBLEM_LEGS = ["M46 38 L32 22 L28 4", "M45 44 L24 34 L8 40", "M45 52 L24 60 L12 80", "M46 58 L36 76 L34 98"];

/** The white spider the symbiote suit wears on its chest, on a 100 by 100 sheet. */
export const SymbioteEmblem = ({ className = "" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    {[undefined, "translate(100 0) scale(-1 1)"].map((mirror) => (
      <g key={mirror ?? "left"} transform={mirror} fill="none" stroke="#f7f7f2" strokeWidth="4" strokeLinejoin="miter" strokeLinecap="round">
        {EMBLEM_LEGS.map((leg) => (
          <path key={leg} d={leg} />
        ))}
      </g>
    ))}
    <ellipse cx="50" cy="38" rx="5.5" ry="7" fill="#f7f7f2" />
    <path d="M50 44 C58 48 58 62 50 76 C42 62 42 48 50 44 Z" fill="#f7f7f2" />
  </svg>
);
