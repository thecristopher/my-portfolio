export const UMBRELLA_RED = "#d62828";

// the octagon of alternating wedges, turned an eighth of a wedge so a red one points straight up and the top edge
// sits flat, like the logo on every RE box
const WEDGE_TURN = -Math.PI / 8;

export const UMBRELLA_WEDGES = Array.from({ length: 8 }, (_, index) => {
  const angle = WEDGE_TURN + (index * Math.PI) / 4;
  const next = WEDGE_TURN + ((index + 1) * Math.PI) / 4;
  const point = (a) => `${(8 + 7.5 * Math.sin(a)).toFixed(2)} ${(8 - 7.5 * Math.cos(a)).toFixed(2)}`;
  return { path: `M8 8 L${point(angle)} L${point(next)} Z`, isRed: index % 2 === 0 };
});
