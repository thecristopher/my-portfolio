import { useReducedMotion } from "framer-motion";
import { starField } from "./actions";

// three layers pushed back at their own depths, so when the orbit tilts the far stars drift less than the near ones.
// each layer is blown up to make up for how small the distance makes it look
const LAYERS = [
  { seed: 11, count: 70, depth: -260, scale: 1.9 },
  { seed: 23, count: 60, depth: -520, scale: 2.4 },
  { seed: 37, count: 50, depth: -820, scale: 3 },
];

const Layer = ({ layer, isStill }) => (
  <div className="absolute inset-0" style={{ transform: `translateZ(${layer.depth}px) scale(${layer.scale})` }}>
    {starField(layer.count, layer.seed).map((star, index) => (
      <span
        key={index}
        className={`absolute rounded-full bg-fg ${star.twinkles && !isStill ? "animate-pulse" : ""}`}
        style={{
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          opacity: star.opacity,
          animationDelay: `${star.delay}ms`,
          animationDuration: "3s",
        }}
      />
    ))}
  </div>
);

/**
 * The sky behind the orbit: layers of stars at different depths that drift apart as the orbit tilts.
 * Lives inside the orbit's 3D stage so the tilt moves it.
 */
const Starfield = () => {
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="pointer-events-none absolute inset-0 [transform-style:preserve-3d]" aria-hidden="true">
      {LAYERS.map((layer) => (
        <Layer key={layer.seed} layer={layer} isStill={prefersReducedMotion} />
      ))}
    </div>
  );
};

export default Starfield;
