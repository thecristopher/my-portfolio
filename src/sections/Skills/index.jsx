import { motion } from "framer-motion";
import SectionIntro, { Gold } from "../../components/SectionIntro";
import EditorWindow from "../../components/EditorWindow";
import { Trigger as MillenniumPuzzle } from "../../components/Relics/DarkMagician";
import { MAGIC_BLUE, MAGIC_PINK, useMagicBuff } from "../../lib/magic";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import TechIcon from "../../components/TechIcon";
import { easeOutExpo } from "../../lib/motion";
import { isMaxLevel, markMainStack } from "../../actions";
import { SKILL_CATEGORY_ORDER } from "../../lib/resume/buildResume";
import { echo } from "../../lib/echo";
import { scrollToSection } from "../../lib/smoothScroll";
import { pickTech, usePickedTech } from "../../lib/stackFilter";

// a tool in the report greps the work history for it, then takes you there to see which jobs light up
const grepWork = (tool) => {
  pickTech(tool);
  echo(`grep -l "${tool}" ~/work/*`, "success");
  scrollToSection("work");
};

const MAX_LEVEL = 5;
const BUFFED_BAR = { backgroundImage: `linear-gradient(to right, ${MAGIC_PINK}, ${MAGIC_BLUE})`, boxShadow: `0 0 8px ${MAGIC_PINK}` };

const HealthHeading = ({ children }) => (
  <p className="flex items-center gap-3 text-fg">
    {children}
    <span className="h-px flex-1 bg-line" />
  </p>
);

// columns fill top to bottom so the list reads in relevance order, and maxed tools go green like a passing healthcheck
const RatedReport = ({ tools, isBuffed, pickedTech }) => (
  <ul className="gap-x-12 md:columns-2">
    {tools.map((tool, index) => (
      <li key={tool.name} className="mb-3.5 grid break-inside-avoid grid-cols-[9rem_1fr_2.5rem] items-center gap-3">
        <button
          type="button"
          onClick={() => grepWork(tool.name)}
          title={`See the jobs that shipped with ${tool.name}`}
          className={`flex min-w-0 items-center gap-2 text-left underline-offset-4 transition-colors hover:text-accent hover:underline ${
            pickedTech === tool.name ? "text-accent" : tool.isMain ? "text-fg" : "text-muted"
          }`}
        >
          <span className={`text-[9px] ${tool.isMain ? "text-accent" : "text-transparent"}`} aria-hidden="true">
            ●
          </span>
          <TechIcon tech={tool.name} className="size-3.5" fallback={<span className="size-3.5 shrink-0" />} />
          <span className="truncate">{tool.name}</span>
        </button>
        <span className="h-1.5 overflow-hidden rounded-full bg-line">
          <motion.span
            className={`block h-full origin-left rounded-full bg-gradient-to-r transition-[box-shadow] duration-500 ${
              isMaxLevel(tool.level, MAX_LEVEL) ? "from-string to-string/60" : "from-signal/80 to-signal/40"
            }`}
            style={{ width: `${(tool.level / MAX_LEVEL) * 100}%`, ...(isBuffed ? BUFFED_BAR : {}) }}
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

// one block per category, the way :checkhealth lists one block per provider. the order matches the resume
const groupByCategory = (tools) =>
  [...SKILL_CATEGORY_ORDER, "Other"]
    .map((category) => ({ category, tools: tools.filter((tool) => (tool.category ?? "Other") === category) }))
    .filter((group) => group.tools.length > 0);

// laid out like nvim's :checkhealth so the current stack reads as "all green"
const StackHealth = ({ mainStack, skillLevels, isBuffed }) => {
  const groups = groupByCategory(markMainStack(skillLevels, mainStack));
  const pickedTech = usePickedTech();

  return (
    <EditorWindow path={["cristopher", "skills", "checkhealth"]}>
      <div className="flex flex-col gap-8 font-mono text-xs">
        <p className="flex flex-wrap justify-between gap-2 text-muted">
          <span className="flex items-center gap-3">
            <span>
              <span className="text-accent">:</span>checkhealth stack
            </span>
            {/* the Millennium Puzzle keeps watch over the report she buffs */}
            <MillenniumPuzzle zoom={0.42} />
          </span>
          <span className="text-faint">● main stack · pick a tool to grep the work history for it</span>
        </p>
        {groups.map((group) => (
          <div key={group.category} className="flex flex-col gap-4">
            <HealthHeading>
              {group.category.toLowerCase()} <span className="text-string">✓ OK</span>
            </HealthHeading>
            <RatedReport tools={group.tools} isBuffed={isBuffed} pickedTech={pickedTech} />
          </div>
        ))}
      </div>
    </EditorWindow>
  );
};

/** skills.lua: every tool I've shipped with as one :checkhealth report, graded honestly. */
const Skills = ({ number }) => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const isBuffed = useMagicBuff();

  return (
    <section id="skills" className="relative py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <SectionIntro
          sectionId="skills"
          number={number}
          title={
            <>
              The tools, <Gold>graded honestly.</Gold>
            </>
          }
          lead="Everything I've shipped with, grouped the way the résumé groups it. Click a tool and the jobs that used it light up."
        />

        {isLoading && <SkeletonLines lines={4} />}
        {isError && !about && <LoadError what="skills" />}

        {about && (
          <div id="checkhealth">
            <StackHealth mainStack={about.main_stack ?? []} skillLevels={about.skill_levels} isBuffed={isBuffed} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
