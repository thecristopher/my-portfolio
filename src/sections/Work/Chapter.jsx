import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { formatRange, hostnameFromUrl, slugify, usesTech } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { formatRoles } from "../../lib/resume/buildResume";
import { CompanyMark, StackList } from "./pieces";
import CaseStudies from "./CaseStudies";

// a job that never shipped with the picked tool fades back, so the ones that did stand out
const FILTERED_OUT = "opacity-25 grayscale";

// the side that stays put while the story scrolls past it, the way Apple pins a product while its features roll by
const Masthead = ({ project, index, pickedTech }) => {
  const dates = formatRange(project.start, project.end);
  const details = [dates, project.location, project.work_mode, project.team_size ? `team of ${project.team_size}` : null].filter(Boolean);

  return (
    <div className="relative isolate flex flex-col gap-6 lg:sticky lg:top-24">
      <CompanyMark company={project.title} />
      <p className="font-mono text-sm text-accent">{String(index + 1).padStart(2, "0")}</p>
      <h3 className="text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.045em]">{project.title}</h3>
      {project.roles?.length > 0 && <p className="text-lg text-fg">{formatRoles(project.roles)}</p>}
      {details.length > 0 && <p className="font-mono text-xs text-muted">{details.join(" · ")}</p>}
      <a
        href={project.url}
        target="_blank"
        rel="noreferrer"
        className="group flex w-fit items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        {hostnameFromUrl(project.url)}
        <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
      <div className="rounded-2xl border border-line bg-panel/60 p-5 font-mono text-xs backdrop-blur">
        <p className="mb-3 text-faint">
          <span className="text-accent">$</span> ls ./stack
        </p>
        <StackList technologies={project.technologies} pickedTech={pickedTech} />
      </div>
    </div>
  );
};

// each win rises in once as it scrolls into view, then stays put so it reads like any other line
const Highlight = ({ text, index }) => (
  <motion.li
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.6 }}
    transition={{ duration: 0.6, ease: easeOutExpo }}
    className="flex gap-5 py-6 text-[clamp(1.35rem,2.6vw,2rem)] leading-snug font-medium tracking-tight text-pretty"
  >
    <span className="mt-2 font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
    <span>{text}</span>
  </motion.li>
);

/**
 * One company as one chapter: the masthead pinned on the left, and on the right the pitch, the wins that have no
 * case study of their own, then the case studies told in full.
 * @param {{ project: object, index: number, pickedTech: string | null, studies: object[], relic?: React.ReactNode }} props
 */
const Chapter = ({ project, index, pickedTech, studies, relic }) => (
  <article
    id={`work-${slugify(project.title)}`}
    className={`group grid gap-10 border-t border-line pt-14 transition-[opacity,filter] duration-500 lg:grid-cols-12 lg:gap-16 ${usesTech(project, pickedTech) ? "" : FILTERED_OUT}`}
  >
    <div className="lg:col-span-5">
      <Masthead project={project} index={index} pickedTech={pickedTech} />
    </div>
    <div className="flex flex-col gap-10 lg:col-span-7">
      <p className="text-[clamp(1.35rem,2.6vw,2rem)] leading-snug font-medium tracking-tight text-pretty">{project.description}</p>
      {project.highlights?.length > 0 && (
        <ol className="divide-y divide-line">
          {project.highlights.map((highlight, at) => (
            <Highlight key={highlight} text={highlight} index={at} />
          ))}
        </ol>
      )}
      <CaseStudies studies={studies} relic={relic} />
    </div>
  </article>
);

export default Chapter;
