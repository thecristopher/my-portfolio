import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cleanTechName, formatRange, slugify, usesTech } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { CompanyMark } from "./pieces";
import CaseStudyCard from "./CaseStudyCard";

// the dates when there are any, and the city the job was in
const details = (project) => [formatRange(project.start, project.end), project.location, project.work_mode].filter(Boolean);

const EarlierRole = ({ project, pickedTech, studies, index }) => (
  <motion.li
    id={`work-${slugify(project.title)}`}
    initial={{ opacity: 0, y: 32 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay: index * 0.05, ease: easeOutExpo }}
    className={`grid scroll-mt-24 gap-5 py-10 transition-[opacity,filter] duration-700 md:grid-cols-[16rem_1fr] md:gap-12 ${usesTech(project, pickedTech) ? "" : "opacity-20 grayscale"}`}
  >
    <div className="flex flex-col gap-2">
      <CompanyMark company={project.title} className="mb-1 h-7 w-24" />
      {/* the arrow rides along at the end of the name, even when a long name wraps onto a second line */}
      <a href={project.url} target="_blank" rel="noreferrer" className="group w-fit text-2xl font-semibold tracking-tight text-balance">
        {project.title}
        <ArrowUpRight size={16} className="ml-1 inline align-baseline text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
      {details(project).length > 0 && <p className="text-sm text-muted">{details(project).join(" · ")}</p>}
    </div>
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2 text-lg leading-relaxed text-muted">
        {(project.highlights?.length ? project.highlights : [project.description]).map((line) => (
          <li key={line} className="text-pretty">
            {line}
          </li>
        ))}
      </ul>
      <p className="text-sm text-faint">{project.technologies.map(cleanTechName).join(" · ")}</p>
      {/* a quiet thank you, it reads like a footnote instead of a headline */}
      {project.note && <p className="text-sm text-muted italic">{project.note}</p>}
      {studies.map((study, at) => (
        <CaseStudyCard key={study.slug} study={study} index={at} />
      ))}
    </div>
  </motion.li>
);

/**
 * The jobs before the featured ones, one row each: where, what I did and the stack.
 * @param {{ projects: object[], pickedTech: string | null, caseStudies: object[] }} props
 */
const EarlierRoles = ({ projects, pickedTech, caseStudies }) => (
  <div id="work-earlier" className="flex flex-col gap-4">
    <p className="text-sm font-semibold text-muted">Where it started</p>
    <ul className="divide-y divide-line border-t border-line">
      {projects.map((project, index) => (
        <EarlierRole
          key={project.title}
          project={project}
          index={index}
          pickedTech={pickedTech}
          studies={caseStudies.filter((study) => study.company === project.title)}
        />
      ))}
    </ul>
  </div>
);

export default EarlierRoles;
