import { AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionIntro, { Gold } from "../../components/SectionIntro";
import EditorWindow from "../../components/EditorWindow";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Trigger as UmbrellaLogo } from "../../components/Relics/ResidentEvil";
import { Trigger as AirbenderArrow } from "../../components/Relics/Avatar";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetCaseStudiesQuery } from "../../api/caseStudiesApi";
import { cleanTechName, countUsing, formatRange, slugify, splitFeatured, usesTech } from "../../actions";
import { formatRoles } from "../../lib/resume/buildResume";
import { usePickedTech } from "../../lib/stackFilter";
import { CareerLog, CompanyMark, GrepBanner } from "./pieces";
import Chapter from "./Chapter";
import CaseStudies from "./CaseStudies";

// the jobs before the featured ones, one line of what I did and the stack, with each one's own bullets
const EarlierRoles = ({ projects, pickedTech, caseStudies }) => (
  <EditorWindow path={["cristopher", "work", "earlier.log"]}>
    <ul className="flex flex-col divide-y divide-line">
      {projects.map((project) => (
        <li
          key={project.title}
          id={`work-${slugify(project.title)}`}
          className={`group relative isolate grid gap-3 py-6 transition-[opacity,filter] duration-500 first:pt-1 last:pb-1 md:grid-cols-[14rem_1fr] md:gap-8 ${usesTech(project, pickedTech) ? "" : "opacity-25 grayscale"}`}
        >
          <CompanyMark company={project.title} layout="row" />
          <div className="flex flex-col gap-1">
            <a href={project.url} target="_blank" rel="noreferrer" className="group flex w-fit items-center gap-1.5 text-lg font-semibold tracking-tight transition-colors hover:text-accent">
              {project.title}
              <ArrowUpRight size={14} className="text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="font-mono text-[11px] text-muted">{[formatRoles(project.roles), formatRange(project.start, project.end)].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="flex flex-col gap-2">
            <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
              {(project.highlights?.length ? project.highlights : [project.description]).map((line) => (
                <li key={line} className="flex gap-2 text-pretty">
                  <span className="text-accent">•</span>
                  {line}
                </li>
              ))}
            </ul>
            <p className="font-mono text-[11px] text-faint">{project.technologies.map(cleanTechName).join(" · ")}</p>
            {/* a quiet thank you, it reads like a footnote instead of a headline */}
            {project.note && <p className="text-xs text-muted italic">{project.note}</p>}
            {/* yes, I really worked at a company called Umbrella. its logo had to be here */}
            {project.title === "Umbrella Seguros" && (
              <span className="flex justify-end">
                <UmbrellaLogo zoom={0.42} />
              </span>
            )}
            <div className="mt-2">
              <CaseStudies studies={caseStudies.filter((study) => study.company === project.title)} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  </EditorWindow>
);

/** experience.json: the career as a git log, one chapter per company with its case studies, then the earlier jobs. */
const Work = ({ number }) => {
  const { data: projects = [], isLoading, isError } = useGetProjectsQuery();
  const { data: caseStudies = [] } = useGetCaseStudiesQuery();
  const { featured, earlier } = splitFeatured(projects);
  const pickedTech = usePickedTech();

  return (
    <section id="work" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 sm:px-6">
        <SectionIntro
          sectionId="work"
          number={number}
          title={
            <>
              Intern to Engineering Manager. <Gold>Every commit of it.</Gold>
            </>
          }
          lead="Five companies in nine years, some down the street from home and some an ocean away. Each chapter has the wins and the case studies behind them."
        />

        {isLoading && <SkeletonLines lines={5} />}
        {isError && projects.length === 0 && <LoadError what="the work history" />}

        {projects.length > 0 && <CareerLog projects={projects} />}

        {/* always in the flow at zero height, so the banner floats over the jobs instead of shoving them down */}
        <div className="sticky top-16 z-20 -mb-20 h-0">
          <AnimatePresence>{pickedTech && <GrepBanner tech={pickedTech} matches={countUsing(projects, pickedTech)} total={projects.length} />}</AnimatePresence>
        </div>

        <div className="flex flex-col gap-24">
          {featured.map((project, index) => (
            <Chapter
              key={project.title}
              project={project}
              index={index}
              pickedTech={pickedTech}
              studies={caseStudies.filter((study) => study.company === project.title)}
              // four kinds of work across the case studies, and the Avatar's arrow at the first of them
              relic={index === 0 ? <AirbenderArrow zoom={0.42} /> : null}
            />
          ))}
        </div>

        {earlier.length > 0 && (
          <div id="work-earlier" className="flex flex-col gap-6">
            <p className="font-mono text-xs text-faint">
              <span className="text-accent">//</span> where it started
            </p>
            <EarlierRoles projects={earlier} pickedTech={pickedTech} caseStudies={caseStudies} />
          </div>
        )}

      </div>
    </section>
  );
};

export default Work;
