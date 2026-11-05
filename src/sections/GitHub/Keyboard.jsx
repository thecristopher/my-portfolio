import { KEYBOARD_ROWS, deckKeys, deckPolygon, litKeys } from "./actions";
import { BUFFER_TEXT } from "./useTypist";

// the base drawn in a 1000 wide box: the deck starts at the hinge as wide as the lid and flares a little toward the
// front edge, the way a laptop looks from a chair slightly above it
const DECK = { top: 9, bottom: 80, topLeft: 19, topRight: 981, bottomLeft: 0, bottomRight: 1000 };
const KEYS = deckKeys(KEYBOARD_ROWS, { u0: 0.07, u1: 0.93, v0: 0.06, v1: 0.6, gap: 0.004 }, DECK);
const TRACKPAD = deckPolygon({ u0: 0.37, u1: 0.63, v0: 0.66, v1: 0.95 }, DECK);
const SURFACE = deckPolygon({ u0: 0, u1: 1, v0: 0, v1: 1 }, DECK);

const KEY_COLOR = "#141417";

// a pressed key takes on the warm light of the lamp, brighter the more recently it was hit
const keyFill = (glow) => (glow ? `color-mix(in oklab, var(--color-glow) ${Math.round(glow * 100)}%, ${KEY_COLOR})` : KEY_COLOR);

/**
 * The laptop's base under the lid, from the same slightly raised view as the rest of the desk: the hinge, a shallow
 * keyboard deck in perspective with its trackpad, and the front edge showing the base's thickness. Each key lights up
 * the moment the editor types its character and fades as the cursor moves on.
 * @param {{ typed: number }} props keystrokes typed so far, the same count the editor shows
 */
const Keyboard = ({ typed }) => {
  const lit = litKeys(BUFFER_TEXT, typed);
  return (
    <svg viewBox="0 0 1000 100" className="relative -ml-[2%] block w-[104%] overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id="laptop-deck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2c31" />
          <stop offset="100%" stopColor="#45454c" />
        </linearGradient>
        <linearGradient id="laptop-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b5b63" />
          <stop offset="100%" stopColor="#1e1e22" />
        </linearGradient>
      </defs>
      {/* the shadow the laptop casts on the desk */}
      <ellipse cx="500" cy="96" rx="520" ry="7" fill="#000" opacity="0.55" />
      {/* the front edge, the thickness of the base, with the scoop that lets a thumb lift the lid */}
      <path d="M0 80 L1000 80 L994 92 Q992 95 986 95 L14 95 Q8 95 6 92 Z" fill="url(#laptop-edge)" />
      <path d="M440 80 Q500 88 560 80 Z" fill="#141417" />
      <polygon points={SURFACE} fill="url(#laptop-deck)" />
      <line x1="0" y1="80" x2="1000" y2="80" stroke="#ffffff" strokeOpacity="0.14" />
      {/* the hinge, where the lid folds into the base */}
      <rect x="60" y="0" width="880" height="10" rx="4" fill="#0b0b0d" />
      <rect x="60" y="8" width="880" height="2" fill="#ffffff" opacity="0.05" />
      {KEYS.map((key) => (
        <polygon key={key.id} points={key.points} style={{ fill: keyFill(lit[key.id]), transition: "fill 150ms" }} stroke="#000" strokeOpacity="0.35" strokeWidth="0.6" />
      ))}
      <polygon points={TRACKPAD} fill="#3a3a41" stroke="#ffffff" strokeOpacity="0.08" />
    </svg>
  );
};

export default Keyboard;
