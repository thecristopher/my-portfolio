import { FLAMEL, FLAMEL_RED } from "./flamel";

/** The Flamel cross from Ed's coat on a 100 by 120 grid: wings, cross, crown and the serpent coiled up the post. */
export const FlamelPaths = () => (
  <g fill={FLAMEL_RED}>
    <path d={FLAMEL.wing} />
    <path d={FLAMEL.wing} transform="translate(100 0) scale(-1 1)" />
    {FLAMEL.cross.map((path) => (
      <path key={path} d={path} />
    ))}
    <path d={FLAMEL.crown} />
    <path d={FLAMEL.serpent} fill="none" stroke={FLAMEL_RED} strokeWidth="5" strokeLinecap="round" />
    <path d={FLAMEL.serpent} fill="none" stroke="#2a0006" strokeWidth="1" strokeDasharray="2 4" />
    <path d={FLAMEL.serpentHead} />
  </g>
);
