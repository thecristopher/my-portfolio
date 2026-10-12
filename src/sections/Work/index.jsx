import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TerminalWindow from "../../components/TerminalWindow";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Umbrella } from "../../components/Secrets";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { techIconMap } from "../../lib/techIconMap";
import { cleanTechName, formatIndex, hostnameFromUrl, slugify, splitFeatured, stackScale } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

const StackList = ({ technologies }) => (
  <ul className="flex flex-col gap-1.5">
    {technologies.map((tech) => {
      const Icon = techIconMap[tech];
      return (
        <li key={tech} className="flex items-center gap-2.5 text-muted">
          <span className="grid w-4 place-items-center text-faint">{Icon ? <Icon size={12} /> : "·"}</span>
          {cleanTechName(tech)}
        </li>
      );
    })}
  </ul>
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
            className="overflow-hidden"
          >
            <p className="leading-relaxed text-muted text-pretty">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EarlierRoles = ({ projects, offset }) => (
  <TerminalWindow title="~/work/earlier">
    <ul className="flex flex-col divide-y divide-line">
      {projects.map((project, index) => (
        <li key={project.title} className="flex flex-col gap-2 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-baseline sm:gap-6">
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
          </div>
          <p className="font-mono text-[11px] text-faint sm:shrink-0 sm:whitespace-nowrap">
            {project.technologies.map(cleanTechName).join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  </TerminalWindow>
);

const ProjectCard = ({ project, index, total, progress, isStacking }) => {
  // each card starts shrinking once the cards after it begin sliding over
  const scale = useTransform(progress, [index / total, 1], [1, stackScale(index, total)]);
  const isCovered = isStacking && index < total - 1;
  const dim = useTransform(progress, [index / total, 1], [0, isCovered ? 0.5 : 0]);

  return (
    <div className={isStacking ? "sticky" : ""} style={isStacking ? { top: `${96 + index * 20}px` } : undefined}>
      <motion.div style={isStacking ? { scale } : undefined} className="relative origin-top">
        <TerminalWindow title={`~/work/${formatIndex(index)}-${slugify(project.title)}`} bodyClassName="p-0">
          <div className="grid md:grid-cols-[1fr_15rem]">
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
                <StackList technologies={project.technologies} />
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

        <div ref={stackRef} className="flex flex-col gap-8 md:gap-[18vh]">
          {featured.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              total={featured.length}
              progress={scrollYProgress}
              isStacking={isStacking}
            />
          ))}
        </div>

        {earlier.length > 0 && <EarlierRoles projects={earlier} offset={featured.length} />}
      </div>
    </section>
  );
};

export default Work;
