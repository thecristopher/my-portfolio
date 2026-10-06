import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TerminalWindow from "../../components/TerminalWindow";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { techIconMap } from "../../lib/techIconMap";
import { cleanTechName, formatIndex, hostnameFromUrl, slugify, stackScale } from "../../actions";

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
              <p className="leading-relaxed text-muted text-pretty">{project.detailed_description}</p>
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
  const isStacking = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <section id="work" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader index="03" label="work.json" title="Where the systems shipped." />
          {projects.length > 0 && (
            <p className="font-mono text-xs text-faint">
              <span className="text-accent">$</span> ls ~/work | wc -l <span className="text-fg">→ {projects.length}</span>
            </p>
          )}
        </div>

        {isLoading && <SkeletonLines lines={5} />}
        {isError && <LoadError what="projects" />}

        <div ref={stackRef} className="flex flex-col gap-8 md:gap-[18vh]">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              total={projects.length}
              progress={scrollYProgress}
              isStacking={isStacking}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
