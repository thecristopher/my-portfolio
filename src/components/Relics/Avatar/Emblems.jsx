// the four nation emblems on a 40 unit grid, all drawn in a single color so they can sit unlit as chalk or glow in their own

const WaterEmblem = ({ color }) => (
  <>
    <circle cx="20" cy="20" r="18" fill="none" stroke={color} strokeWidth="2" />
    {/* the moon over the ocean */}
    <path d="M24 5 A8 8 0 1 0 27 17 A7 7 0 0 1 24 5 Z" fill={color} />
    <g fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M8.5 25 q2.75 -3 5.5 0 t5.5 0 t5.5 0 t5.5 0" />
      <path d="M11.25 30 q2.75 -3 5.5 0 t5.5 0 t5.5 0" />
      <path d="M14 35 q2.75 -3 5.5 0 t5.5 0" />
    </g>
  </>
);

const EarthEmblem = ({ color }) => (
  <>
    {/* a disc with a square cut out of the middle, like an old coin */}
    <path d="M20 2 A18 18 0 1 1 20 38 A18 18 0 1 1 20 2 Z M11.5 11.5 V28.5 H28.5 V11.5 Z" fill={color} fillRule="evenodd" />
    <g fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17 H25.5" />
      <path d="M14.5 25 q2.75 -6 5.5 0 q2.75 -6 5.5 0" />
    </g>
  </>
);

const FireEmblem = ({ color }) => (
  <path
    d="M20 2 C22 8 25 11 25 15 C26 12 28 11 29 9 C31 15 31 22 28 28 C26 33 23 36 20 36 C17 36 14 33 12 28 C9 22 9 15 11 9 C12 11 14 12 15 15 C15 11 18 8 20 2 Z M20 16 C22 20 25 23 24 28 C23 31 22 32 20 32 C18 32 17 31 16 28 C15 23 18 20 20 16 Z"
    fill={color}
    fillRule="evenodd"
  />
);

const AirEmblem = ({ color }) => (
  <>
    <circle cx="20" cy="20" r="3.2" fill={color} />
    <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round">
      {[0, 120, 240].map((turn) => (
        <path key={turn} d="M20 15.5 C20 9 27 6 31.5 10 C34.5 13 33 18.5 28.5 18.5 C25.5 18.5 24.5 15.5 26.5 14.5" transform={`rotate(${turn} 20 20)`} />
      ))}
    </g>
  </>
);

const EMBLEMS = { water: WaterEmblem, earth: EarthEmblem, fire: FireEmblem, air: AirEmblem };

/**
 * One nation's emblem as its own svg.
 * @param {{ nation: { id: string, color: string }, color?: string, className?: string, style?: object }} props
 */
export const NationEmblem = ({ nation, color = nation.color, className = "", style }) => {
  const Emblem = EMBLEMS[nation.id];
  return (
    <svg viewBox="0 0 40 40" className={`overflow-visible ${className}`} style={style} aria-hidden="true">
      <Emblem color={color} />
    </svg>
  );
};

// Aang's arrow pointing down, the way it runs down his forehead
export const AangArrow = ({ color, className = "", style }) => (
  <svg viewBox="0 0 40 64" className={className} style={style} aria-hidden="true">
    <path d="M16 0 H24 V38 H34 L20 62 L6 38 H16 Z" fill={color} />
  </svg>
);
