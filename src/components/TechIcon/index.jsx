import { techIconMap } from "../../lib/techIconMap";
import { brandColorFor } from "../../actions";

// a tool's logo in its brand color. the color rides on a css var so the light colorscheme can deepen it to stay readable
const TechIcon = ({ tech, className = "", isMuted = false, fallback = null }) => {
  const Icon = techIconMap[tech];
  if (!Icon) return fallback;
  const color = brandColorFor(tech);
  return (
    <Icon
      aria-hidden="true"
      className={`tech-icon shrink-0 transition-[color,opacity] duration-300 ${isMuted ? "opacity-60" : ""} ${className}`}
      style={color ? { "--brand": color } : undefined}
    />
  );
};

export default TechIcon;
