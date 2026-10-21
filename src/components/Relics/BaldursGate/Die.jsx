import { D20_FACETS, D20_OUTLINE } from "./helpers";

const ENGRAVING = "#4a3210";

/**
 * The gold d20: ten shaded facets, an engraved rim and the face number on the front triangle.
 * @param {{ face: number, numberColor?: string, className?: string, style?: object, children?: React.ReactNode }} props
 */
export const Die = ({ face, numberColor = "#2a1806", className = "", style, children }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
    {D20_FACETS.map(({ points, shade }) => (
      <polygon key={points} points={points} fill={shade} stroke={ENGRAVING} strokeWidth="0.9" strokeLinejoin="round" />
    ))}
    <path d={D20_OUTLINE} fill="none" stroke="#fbe9b4" strokeWidth="1.6" strokeLinejoin="round" />
    {/* a thin engraved border inside the front face, the filigree every fancy die has */}
    <path d="M50 36 L66 62.5 L34 62.5 Z" fill="none" stroke={ENGRAVING} strokeWidth="0.5" strokeOpacity="0.6" />
    <text
      x="50"
      y="58.5"
      textAnchor="middle"
      fontSize={face >= 10 ? 15 : 17}
      fontWeight="700"
      fontFamily="Cinzel, Georgia, serif"
      fill={numberColor}
    >
      {face}
    </text>
    {children}
  </svg>
);
