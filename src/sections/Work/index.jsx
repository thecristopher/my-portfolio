import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown, X } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TerminalWindow from "../../components/TerminalWindow";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Umbrella } from "../../components/Secrets";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { techIconMap } from "../../lib/techIconMap";
import {
  careerCommits,
  cleanTechName,
  countUsing,
  formatIndex,
  hostnameFromUrl,
  slugify,
  splitFeatured,
  splitParagraphs,
  stackScale,
  usesTech,
} from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { scrollToSection } from "../../lib/smoothScroll";
import { clearTech, pickTech, usePickedTech } from "../../lib/stackFilter";

// a job that never shipped with the picked tool fades back, so the ones that did stand out
const FILTERED_OUT = "opacity-25 grayscale";

// long stacks split into two columns so the side panel never outgrows the story next to it.
// every tool is a grep: pick one and the other jobs fade back
const StackList = ({ technologies, pickedTech }) => (
  <ul className={`grid gap-x-4 gap-y-1.5 ${technologies.length > 8 ? "grid-cols-2" : "grid-cols-1"}`}>
    {technologies.map((tech) => {
      const Icon = techIconMap[tech];
      const name = cleanTechName(tech);
      const isPicked = pickedTech === name;
      return (
        <li key={tech} className="min-w-0">
          <button
            type="button"
            onClick={() => pickTech(isPicked ? null : name)}
            aria-pressed={isPicked}
            title={isPicked ? "Show every job" : `Only the jobs that shipped with ${name}`}
            className={`flex w-full min-w-0 items-center gap-2 text-left transition-colors ${isPicked ? "text-accent" : "text-muted hover:text-fg"}`}
          >
            <span className={`grid w-4 place-items-center ${isPicked ? "text-accent" : "text-faint"}`}>{Icon ? <Icon size={12} /> : "·"}</span>
            <span className="truncate">{name}</span>
          </button>
        </li>
      );
    })}
  </ul>
);

const COMMIT_TONES = { promote: "text-string", join: "text-signal", init: "text-error" };

// every title I held as a commit, newest on top. each one jumps to the card that tells its story
const CareerLog = ({ projects }) => {
  const commits = careerCommits(projects);

  return (
    <div id="career-log">
      <TerminalWindow title="~/work · git log">
        <div className="flex flex-col gap-4 font-mono text-xs">
          <p className="text-muted">
            <span className="text-accent">$</span> git log --graph --oneline --all
          </p>
          <ol className="flex flex-col">
            {commits.map((commit, index) => (
              <motion.li
                key={commit.hash}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.07, ease: easeOutExpo }}
                className="relative"
              >
                {index < commits.length - 1 && (
                  <span className="absolute top-3 bottom-0 left-[5px] w-px bg-line-strong" aria-hidden="true" />
                )}
                <button
                  type="button"
                  onClick={() => scrollToSection(commit.targetId)}
                  className={`group relative flex w-full items-baseline gap-3 rounded-md py-1.5 text-left ${commit.isNewestAtCompany && index > 0 ? "mt-2" : ""}`}
                >
                  <span className="relative grid size-[11px] shrink-0 translate-y-[1px] place-items-center self-start">
                    {commit.isHead && <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" aria-hidden="true" />}
                    <span className={`size-[9px] rounded-full border-2 border-current bg-panel ${commit.isHead ? "bg-current text-accent" : COMMIT_TONES[commit.type]}`} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                      <span className="text-accent">{commit.hash}</span>
                      {commit.isHead && (
                        <span>
                          <span className="text-faint">(</span>
                          <span className="text-signal">HEAD</span>
                          <span className="text-faint"> → </span>
                          <span className="text-string">main</span>
                          <span className="text-faint">)</span>
                        </span>
                      )}
                      <span>
                        <span className={COMMIT_TONES[commit.type]}>{commit.type}:</span>{" "}
                        <span className="text-fg transition-colors group-hover:text-accent">{commit.message}</span>
                      </span>
                    </span>
                    {commit.years && <span className="text-faint sm:ml-auto sm:shrink-0">{commit.years}</span>}
                  </span>
                </button>
              </motion.li>
            ))}
          </ol>
        </div>
      </TerminalWindow>
    </div>
  );
};

// the grep the skills or a card's stack started, with the way back to every job
const GrepBanner = ({ tech, matches, total }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.4, ease: easeOutExpo }}
    className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-panel/90 px-4 py-3 font-mono text-xs backdrop-blur-xl xl:top-6"
  >
    <p className="text-muted">
      <span className="text-accent">$</span> grep -l "{tech}" ~/work/* <span className="text-fg">→ {matches} of {total} jobs</span>
    </p>
    <button
      type="button"
      onClick={clearTech}
      className="flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
    >
      <X size={13} aria-hidden="true" /> clear
    </button>
  </motion.div>
);

// the short pitch always shows, the full story waits behind a toggle so the section skims fast
const MoreDetail = ({ id, text }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={() => setIsOpen((open) => !open)}
        className="group flex w-fit items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        <span className="text-accent">$</span> {isOpen ? "less" : "cat details.md"}
        <ChevronDown size={13} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className="flex flex-col gap-3 overflow-hidden"
          >
            {splitParagraphs(text).map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="leading-relaxed text-muted text-pretty">
                {paragraph}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EarlierRoles = ({ projects, offset, pickedTech }) => (
  <TerminalWindow title="~/work/earlier">
    <ul className="flex flex-col divide-y divide-line">
      {projects.map((project, index) => (
        <li
          key={project.title}
          id={`work-${slugify(project.title)}`}
          className={`flex flex-col gap-2 py-5 transition-[opacity,filter] duration-500 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6 ${
            usesTech(project, pickedTech) ? "" : FILTERED_OUT
          }`}
        >
          <span className="font-mono text-xs text-accent">{formatIndex(offset + index)}</span>
          <div className="flex grow flex-col gap-1">
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="group flex w-fit items-center gap-1.5 text-lg font-medium tracking-tight transition-colors hover:text-accent"
            >
              {project.title}
              <ArrowUpRight size={14} className="text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <p className="text-sm leading-relaxed text-muted text-pretty">{project.description}</p>
            {project.detailed_description && (
              <div className="mt-2 text-sm">
                <MoreDetail id={`work-${slugify(project.title)}-details`} text={project.detailed_description} />
              </div>
            )}
          </div>
          <p className="font-mono text-[11px] text-faint sm:shrink-0 sm:whitespace-nowrap">
            {project.technologies.map(cleanTechName).join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  </TerminalWindow>
);

const ProjectCard = ({ project, index, total, progress, isStacking, pickedTech }) => {
  // each card starts shrinking once the cards after it begin sliding over
  const scale = useTransform(progress, [index / total, 1], [1, stackScale(index, total)]);
  const isCovered = isStacking && index < total - 1;
  const dim = useTransform(progress, [index / total, 1], [0, isCovered ? 0.5 : 0]);

  return (
    <div
      id={`work-${slugify(project.title)}`}
      className={`${isStacking ? "sticky" : ""} transition-[opacity,filter] duration-500 ${usesTech(project, pickedTech) ? "" : FILTERED_OUT}`}
      style={isStacking ? { top: `${96 + index * 20}px` } : undefined}
    >
      <motion.div style={isStacking ? { scale } : undefined} className="relative origin-top">
        <TerminalWindow title={`~/work/${formatIndex(index)}-${slugify(project.title)}`} bodyClassName="p-0">
          <div className="grid md:grid-cols-[1fr_20.5rem]">
            <div className="flex flex-col gap-6 p-6 sm:p-10">
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-sm text-accent">{formatIndex(index)}</span>
                <h3 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight font-medium tracking-[-0.03em]">{project.title}</h3>
              </div>
              <p className="text-lg leading-relaxed text-pretty">{project.description}</p>
              {project.detailed_description && (
                <MoreDetail id={`work-${slugify(project.title)}-details`} text={project.detailed_description} />
              )}
            </div>

            <div className="flex flex-col justify-between gap-8 border-t border-line bg-ink/30 p-6 font-mono text-xs md:border-t-0 md:border-l sm:p-8">
              <div className="flex flex-col gap-4">
                <p><span className="text-accent">$</span> ls ./stack</p>
                <StackList technologies={project.technologies} pickedTech={pickedTech} />
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
              >
                <span className="text-accent">$</span> open {hostnameFromUrl(project.url)}
                <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </TerminalWindow>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 rounded-2xl bg-ink" />
      </motion.div>
    </div>
  );
};

const Work = () => {
  const stackRef = useRef(null);
  const { data: projects = [], isLoading, isError } = useGetProjectsQuery();
  const { featured, earlier } = splitFeatured(projects);
  const isStacking = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });
  const pickedTech = usePickedTech();

  return (
    <section id="work" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader index="03" label="work.json" title="Where the systems shipped." />
          {projects.length > 0 && (
            <div className="flex items-center gap-1">
              <p className="font-mono text-xs text-faint">
                <span className="text-accent">$</span> ls -t ~/work <span className="text-fg">→ newest first</span>
              </p>
              <Umbrella className="-my-2" />
            </div>
          )}
        </div>

        {isLoading && <SkeletonLines lines={5} />}
        {isError && <LoadError what="projects" />}

        {projects.length > 0 && <CareerLog projects={projects} />}

        <AnimatePresence>
          {pickedTech && <GrepBanner tech={pickedTech} matches={countUsing(projects, pickedTech)} total={projects.length} />}
        </AnimatePresence>

        <div ref={stackRef} className="flex flex-col gap-8 md:gap-[18vh]">
          {featured.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              total={featured.length}
              progress={scrollYProgress}
              isStacking={isStacking}
              pickedTech={pickedTech}
            />
          ))}
        </div>

        {earlier.length > 0 && (
          <div id="work-earlier">
            <EarlierRoles projects={earlier} offset={featured.length} pickedTech={pickedTech} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;
