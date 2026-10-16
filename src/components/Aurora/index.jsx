import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

// the two colors the light behind each section is mixed from, out of the colorscheme's own palette
const SECTION_LIGHT = {
  home: ["accent", "signal"],
  manifesto: ["accent", "error"],
  about: ["signal", "string"],
  work: ["accent", "signal"],
  education: ["string", "signal"],
  github: ["error", "accent"],
  skills: ["signal", "error"],
  contact: ["accent", "error"],
};

// a slow wash of colored light behind the whole page. it drifts as you scroll and takes on each section's colors
// as you reach it, crossfading through registered css properties so the gradients can actually transition.
// it sits first in the page so every section, all positioned, paints over it
const Aurora = ({ sectionId }) => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const driftA = useTransform(scrollYProgress, [0, 1], ["-10%", "35%"]);
  const driftB = useTransform(scrollYProgress, [0, 1], ["20%", "-25%"]);
  const [first, second] = SECTION_LIGHT[sectionId] ?? SECTION_LIGHT.home;

  return (
    <div
      aria-hidden="true"
      className="aurora pointer-events-none fixed inset-0 overflow-hidden"
      style={{ "--aurora-a": `var(--color-${first})`, "--aurora-b": `var(--color-${second})` }}
    >
      <motion.div className="aurora-a absolute -top-1/4 -left-1/4 size-[80vmax]" style={prefersReducedMotion ? undefined : { x: driftA }} />
      <motion.div className="aurora-b absolute -right-1/4 -bottom-1/3 size-[80vmax]" style={prefersReducedMotion ? undefined : { x: driftB }} />
    </div>
  );
};

export default Aurora;
