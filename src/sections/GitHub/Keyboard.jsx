import { KEYBOARD_ROWS, deckKeys, deckPolygon, litKeys } from "./actions";
import { BUFFER_TEXT } from "./useTypist";

// the laptop's base drawn in a 1000 wide box: the deck starts at the hinge as wide as the lid and flares a little
// toward the front edge, the way a laptop looks from a chair slightly above it
const LAPTOP_DECK = { top: 9, bottom: 80, topLeft: 19, topRight: 981, bottomLeft: 0, bottomRight: 1000 };
const LAPTOP_KEYS = deckKeys(KEYBOARD_ROWS, { u0: 0.07, u1: 0.93, v0: 0.06, v1: 0.6, gap: 0.004 }, LAPTOP_DECK);
const TRACKPAD = deckPolygon({ u0: 0.37, u1: 0.63, v0: 0.66, v1: 0.95 }, LAPTOP_DECK);
const LAPTOP_SURFACE = deckPolygon({ u0: 0, u1: 1, v0: 0, v1: 1 }, LAPTOP_DECK);

// the desk keyboard lying flat in front of the monitor, its back edge a little narrower than its front
const DESK_DECK = { top: 6, bottom: 84, topLeft: 26, topRight: 974, bottomLeft: 0, bottomRight: 1000 };
const DESK_KEYS = deckKeys(KEYBOARD_ROWS, { u0: 0.025, u1: 0.975, v0: 0.06, v1: 0.94, gap: 0.005 }, DESK_DECK);
const DESK_SURFACE = deckPolygon({ u0: 0, u1: 1, v0: 0, v1: 1 }, DESK_DECK);

const KEY_COLOR = "#141417";

// a pressed key takes on the warm glow of the screen, brighter the more recently it was hit
const keyFill = (glow) => (glow ? `color-mix(in oklab, var(--color-glow) ${Math.round(glow * 100)}%, ${KEY_COLOR})` : KEY_COLOR);

// every key, lit while its character is being typed
const Keys = ({ keys, typed }) => {
  const lit = litKeys(BUFFER_TEXT, typed);
  return keys.map((key) => (
    <polygon key={key.id} points={key.points} style={{ fill: keyFill(lit[key.id]), transition: "fill 150ms" }} stroke="#000" strokeOpacity="0.35" strokeWidth="0.6" />
  ));
};

/**
 * The laptop's base under the lid, from the same slightly raised view as the rest of the desk: the hinge, a shallow
 * keyboard deck in perspective with its trackpad, and the front edge showing the base's thickness. Each key lights up
 * the moment the editor types its character and fades as the cursor moves on.
 * @param {{ typed: number }} props keystrokes typed so far, the same count the editor shows
 */
export const LaptopKeyboard = ({ typed }) => (
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
    <polygon points={LAPTOP_SURFACE} fill="url(#laptop-deck)" />
    <line x1="0" y1="80" x2="1000" y2="80" stroke="#ffffff" strokeOpacity="0.14" />
    {/* the hinge, where the lid folds into the base */}
    <rect x="60" y="0" width="880" height="10" rx="4" fill="#0b0b0d" />
    <rect x="60" y="8" width="880" height="2" fill="#ffffff" opacity="0.05" />
    <Keys keys={LAPTOP_KEYS} typed={typed} />
    <polygon points={TRACKPAD} fill="#3a3a41" stroke="#ffffff" strokeOpacity="0.08" />
  </svg>
);

/**
 * A full size keyboard lying on the desk in front of the monitor, seen from the same raised view: its case, the
 * front edge showing how thick it is, and every key lighting up as the editor types it.
 * @param {{ typed: number, className?: string }} props keystrokes typed so far, the same count the editor shows
 */
export const DeskKeyboard = ({ typed, className = "" }) => (
  <svg viewBox="0 0 1000 100" className={`block overflow-visible ${className}`} aria-hidden="true">
    <defs>
      <linearGradient id="desk-keyboard-case" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#25252a" />
        <stop offset="100%" stopColor="#3a3a41" />
      </linearGradient>
    </defs>
    <ellipse cx="500" cy="96" rx="520" ry="6" fill="#000" opacity="0.5" />
    <path d="M0 84 L1000 84 L996 92 Q994 95 988 95 L12 95 Q6 95 4 92 Z" fill="#1b1b1f" />
    <polygon points={DESK_SURFACE} fill="url(#desk-keyboard-case)" />
    <line x1="0" y1="84" x2="1000" y2="84" stroke="#ffffff" strokeOpacity="0.12" />
    <Keys keys={DESK_KEYS} typed={typed} />
  </svg>
);

/**
 * The mouse beside the keyboard, lying flat on the desk and foreshortened the same way the keyboard is: its back
 * toward the screen, the split between the buttons and the wheel up front, the edge it sits on showing its height, and a
 * faint glow on the desk from the screen.
 */
export const Mouse = ({ className = "" }) => (
  <svg viewBox="0 0 60 44" className={`block overflow-visible ${className}`} aria-hidden="true">
    <ellipse cx="30" cy="38" rx="36" ry="6" fill="var(--color-glow)" opacity="0.16" />
    <ellipse cx="30" cy="39" rx="29" ry="4" fill="#000" opacity="0.55" />
    {/* the side of the shell, the part of its height the raised view still shows */}
    <path d="M2 20 C2 30 14 37 30 37 C46 37 58 30 58 20 L58 24 C58 34 46 41 30 41 C14 41 2 34 2 24 Z" fill="#18181c" />
    <path d="M30 2 C48 2 58 10 58 20 C58 30 46 37 30 37 C14 37 2 30 2 20 C2 10 12 2 30 2 Z" fill="#2c2c31" />
    {/* the buttons, the half of the shell nearest the screen, split down the middle with the wheel between them */}
    <path d="M30 2 C46 2 56 8 57.5 16 L2.5 16 C4 8 14 2 30 2 Z" fill="#35353b" />
    <line x1="30" y1="2.5" x2="30" y2="16" stroke="#000" strokeOpacity="0.55" strokeWidth="1" />
    <rect x="27.6" y="5.5" width="4.8" height="6" rx="2.2" fill="#141417" />
    <path d="M10 10 Q6 18 9 26" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2.4" strokeLinecap="round" fill="none" />
  </svg>
);
