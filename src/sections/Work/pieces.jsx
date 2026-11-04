import { motion } from "framer-motion";
import { X } from "lucide-react";
import TechIcon from "../../components/TechIcon";
import { cleanTechName } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { clearTech, pickTech } from "../../lib/stackFilter";
import { COMPANY_LOGOS } from "../../lib/companyLogos";
import { filterSummary } from "./actions";

/**
 * A job's tools as chips. Every chip is a filter: pick one and the jobs that never used it fade back.
 * @param {{ technologies: string[], pickedTech: string | null }} props
 */
export const StackList = ({ technologies, pickedTech }) => (
  <ul className="flex flex-wrap gap-2">
    {technologies.map((tech) => {
      const name = cleanTechName(tech);
      const isPicked = pickedTech === name;
      return (
        <li key={tech}>
          <button
            type="button"
            onClick={() => pickTech(isPicked ? null : name)}
            aria-pressed={isPicked}
            title={isPicked ? "Show every job" : `Only the jobs that shipped with ${name}`}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              isPicked ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-line-strong hover:text-fg"
            }`}
          >
            <TechIcon tech={tech} className="size-3.5" />
            {name}
          </button>
        </li>
      );
    })}
  </ul>
);

/**
 * The filter a skill or a chip started, floating over the jobs, with the way back to all of them.
 * @param {{ tech: string, matches: number, total: number }} props
 */
export const FilterBar = ({ tech, matches, total }) => (
  <motion.div
    initial={{ opacity: 0, y: -12, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.96 }}
    transition={{ duration: 0.4, ease: easeOutExpo }}
    className="glass mx-auto flex w-fit items-center gap-3 rounded-full border border-line py-1.5 pr-1.5 pl-4 text-sm shadow-lg"
  >
    <TechIcon tech={tech} className="size-4" />
    <span className="text-muted">{filterSummary(tech, matches, total)}</span>
    <button type="button" onClick={clearTech} className="flex items-center gap-1 rounded-full bg-raised px-3 py-1 text-xs font-medium transition-colors hover:bg-line-strong">
      <X size={12} aria-hidden="true" /> Clear
    </button>
  </motion.div>
);

/**
 * The company's mark as a flat shape in its brand color, the way the tool logos are drawn.
 * @param {{ company: string, className?: string }} props
 */
export const CompanyMark = ({ company, className = "" }) => {
  const logo = COMPANY_LOGOS[company];
  if (!logo) return null;
  const tint = { background: logo.color, maskImage: `url(${logo.src})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "left center" };
  return <span className={`block ${className}`} style={tint} aria-hidden="true" />;
};
