import { motion } from "framer-motion";
import SectionHeader from "../../components/SectionHeader";
import SpotlightCard from "../../components/SpotlightCard";
import TerminalWindow from "../../components/TerminalWindow";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetSkillsQuery } from "../../api/skillsApi";
import { useGetAboutQuery } from "../../api/aboutApi";
import { iconMap } from "../../lib/iconMap";
import { easeOutExpo } from "../../lib/motion";
import { formatIndex, isMaxLevel, markMainStack } from "../../actions";

const MAX_LEVEL = 5;

const CapabilityCard = ({ skill, index }) => {
  const Icon = iconMap[skill.icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1, delay: (index % 3) * 0.1, ease: easeOutExpo }}
    >
      <SpotlightCard className="group flex h-full flex-col gap-6 overflow-hidden rounded-2xl border border-line bg-panel p-7 transition-colors duration-500 hover:border-line-strong sm:p-8">
        <div className="flex items-center justify-between">
          <span className="grid size-11 place-items-center rounded-xl border border-line bg-ink text-muted transition-all duration-500 group-hover:border-accent/40 group-hover:text-accent">
            {Icon && <Icon size={20} aria-hidden="true" />}
          </span>
          <span className="font-mono text-[11px] text-faint">{formatIndex(index)}</span>
        </div>
        <h3 className="text-xl font-medium tracking-tight">{skill.title}</h3>
        <p className="text-sm leading-relaxed text-muted text-pretty">{skill.description}</p>
      </SpotlightCard>
    </motion.div>
  );
};

const HealthHeading = ({ children }) => (
  <p className="flex items-center gap-3 text-fg">
    {children}
    <span className="h-px flex-1 bg-line" />
  </p>
);

// columns fill top to bottom so the list reads in relevance order, and 5/5 tools go green like a passing healthcheck
const RatedReport = ({ tools }) => (
  <ul className="gap-x-12 md:columns-2">
    {tools.map((tool, index) => (
      <li key={tool.name} className="mb-3.5 grid break-inside-avoid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3">
        <span className={`truncate ${tool.isMain ? "text-fg" : "text-muted"}`}>
          <span className={tool.isMain ? "text-accent" : "text-transparent"} aria-hidden="true">
            ●{" "}
          </span>
          {tool.name}
        </span>
        <span className="h-1.5 overflow-hidden rounded-full bg-line">
          <motion.span
            className={`block h-full origin-left rounded-full bg-gradient-to-r ${
              isMaxLevel(tool.level, MAX_LEVEL) ? "from-string to-string/60" : "from-signal/80 to-signal/40"
            }`}
            style={{ width: `${(tool.level / MAX_LEVEL) * 100}%` }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2 + index * 0.05, ease: easeOutExpo }}
          />
        </span>
        <span className={`text-right ${isMaxLevel(tool.level, MAX_LEVEL) ? "text-string" : "text-faint"}`}>
          {tool.level}/{MAX_LEVEL}
        </span>
      </li>
    ))}
  </ul>
);

// laid out like nvim's :checkhealth so the current stack reads as "all green"
const StackHealth = ({ mainStack, skillLevels }) => {
  const ratedTools = markMainStack(skillLevels, mainStack);

  return (
    <TerminalWindow title="~/skills · nvim">
      <div className="flex flex-col gap-6 font-mono text-xs">
        <p className="text-muted">
          <span className="text-signal">:</span>checkhealth stack
        </p>
        {ratedTools.length > 0 && (
          <div className="flex flex-col gap-4">
            <HealthHeading>stack ~</HealthHeading>
            <p className="text-faint">
              - INFO self rated out of {MAX_LEVEL}, by relevance · <span className="text-accent">●</span> main stack ·{" "}
              <span className="text-string">
                {MAX_LEVEL}/{MAX_LEVEL}
              </span>{" "}
              all green
            </p>
            <RatedReport tools={ratedTools} />
          </div>
        )}
      </div>
    </TerminalWindow>
  );
};

const Skills = () => {
  const { data: skills = [], isLoading, isError } = useGetSkillsQuery();
  const { data: about } = useGetAboutQuery();

  return (
    <section id="skills" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeader index="04" label="skills.lua" title="How I lead, and the tools I reach for." />

        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="skills" />}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, index) => (
            <CapabilityCard key={skill.title} skill={skill} index={index} />
          ))}
        </div>

        {about && <StackHealth mainStack={about.main_stack ?? []} skillLevels={about.skill_levels} />}
      </div>
    </section>
  );
};

export default Skills;
