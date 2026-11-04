import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import ScrollWords from "../../components/ScrollWords";
import { formatRange, hostnameFromUrl, slugify, usesTech } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { formatRoles } from "../../lib/resume/buildResume";
import { CompanyMark, StackList } from "./pieces";
import CaseStudyCard from "./CaseStudyCard";

// a job that never shipped with the picked tool fades back, so the ones that did stand out
const FILTERED_OUT = "opacity-20 grayscale";

// the side that stays put while the story scrolls past it, the way Apple pins a product while its features roll by
const Masthead = ({ project, index, pickedTech }) => {
  const details = [formatRange(project.start, project.end), project.location, project.work_mode, project.team_size ? `team of ${project.team_size}` : null].filter(Boolean);

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24">
      <p className="text-sm font-semibold text-muted">Chapter {String(index + 1).padStart(2, "0")}</p>
      <CompanyMark company={project.title} className="h-12 w-40" />
      <h3 className="text-[clamp(2.6rem,5vw,4.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-balance">{project.title}</h3>
      {project.roles?.length > 0 && <p className="text-lg text-muted">{formatRoles(project.roles)}</p>}
      {details.length > 0 && <p className="text-sm text-faint">{details.join(" · ")}</p>}
      <a href={project.url} target="_blank" rel="noreferrer" className="group flex w-fit items-center gap-1 text-sm font-medium text-accent">
        {hostnameFromUrl(project.url)}
        <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
      <div className="pt-2">
        <StackList technologies={project.technologies} pickedTech={pickedTech} />
      </div>
    </div>
  );
};

// each win slides in from the side as it scrolls into view, its number first
const Highlight = ({ text, index }) => (
  <motion.li
    initial={{ opacity: 0, x: 40 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.9, ease: easeOutExpo }}
    className="flex gap-5 py-7 text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug font-medium tracking-tight text-pretty"
  >
    <span className="text-sunset mt-1 text-sm font-semibold tabular-nums">{String(index + 1).padStart(2, "0")}</span>
    <span>{text}</span>
  </motion.li>
);

/**
 * One company as one chapter: the masthead pinned on the left, and on the right the pitch read out word by word, the
 * wins, and the case studies told in full.
 * @param {{ project: object, index: number, pickedTech: string | null, studies: object[], relic?: React.ReactNode }} props
 */
const Chapter = ({ project, index, pickedTech, studies, relic }) => (
  <article
    id={`work-${slugify(project.title)}`}
    className={`grid scroll-mt-20 gap-12 border-t border-line pt-16 transition-[opacity,filter] duration-700 lg:grid-cols-12 lg:gap-16 ${usesTech(project, pickedTech) ? "" : FILTERED_OUT}`}
  >
    <div className="lg:col-span-5">
      <Masthead project={project} index={index} pickedTech={pickedTech} />
    </div>
    <div className="flex flex-col gap-12 lg:col-span-7">
      <ScrollWords text={project.description} className="text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.12] font-semibold tracking-[-0.03em] text-pretty" />
      {project.highlights?.length > 0 && (
        <ol className="divide-y divide-line border-y border-line">
          {project.highlights.map((highlight, at) => (
            <Highlight key={highlight} text={highlight} index={at} />
          ))}
        </ol>
      )}
      {studies.length > 0 && (
        <div className="flex flex-col gap-5">
          <p className="flex items-center gap-3 text-sm font-semibold text-muted">
            Case studies
            {relic}
          </p>
          {studies.map((study, at) => (
            <CaseStudyCard key={study.slug} study={study} index={at} />
          ))}
        </div>
      )}
    </div>
  </article>
);

export default Chapter;
