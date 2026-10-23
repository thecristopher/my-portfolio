import { motion } from "framer-motion";
import SectionIntro, { Gold } from "../../components/SectionIntro";
import SpotlightCard from "../../components/SpotlightCard";
import EditorWindow from "../../components/EditorWindow";
import DuelMonsterCard from "../../components/DuelMonsterCard";
import { Trigger as MillenniumPuzzle } from "../../components/Relics/DarkMagician";
import { MAGIC_BLUE, MAGIC_PINK, useMagicBuff } from "../../lib/magic";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetSkillsQuery } from "../../api/skillsApi";
import { useGetAboutQuery } from "../../api/aboutApi";
import { iconMap } from "../../lib/iconMap";
import TechIcon from "../../components/TechIcon";
import { easeOutExpo } from "../../lib/motion";
import { formatIndex, isMaxLevel, markMainStack } from "../../actions";
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

const BUFF_ATK = 500;

// the first card takes a big square of the grid, the bento layout Apple lays its feature tiles out in
const CapabilityCard = ({ skill, index, isBuffed }) => {
  const Icon = iconMap[skill.icon];
  const isDuelMonster = isBuffed && Boolean(skill.effect);
  const isLead = index === 0;

  return (
    // skills' signature: the cards stand up out of the page, tipped back like a deck being dealt onto the table
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 28, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.2, delay: (index % 3) * 0.1 + Math.floor(index / 3) * 0.08, ease: easeOutExpo }}
      style={{ perspective: 1200, transformPerspective: 1200, transformOrigin: "50% 100%" }}
      className={isLead ? "lg:col-span-2 lg:row-span-2" : ""}
    >
      {/* a returning visitor's cards are already monsters, so only a fresh cast plays the flip into a real card */}
      <motion.div
        initial={false}
        animate={{ rotateY: isDuelMonster ? 360 : 0 }}
        transition={{ duration: 0.9, delay: (index % 3) * 0.12, ease: easeOutExpo }}
        className="h-full"
      >
        {isDuelMonster ? (
          <DuelMonsterCard skill={skill} Icon={Icon} index={index} isLead={isLead} buff={BUFF_ATK} />
        ) : (
          <SpotlightCard className="group flex h-full flex-col gap-6 rounded-3xl border border-line bg-panel/80 p-7 transition-[border-color,box-shadow] duration-500 hover:border-line-strong sm:p-8">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-xl border border-line bg-ink text-muted transition-all duration-500 group-hover:border-accent/40 group-hover:text-accent">
                {Icon && <Icon size={20} aria-hidden="true" />}
              </span>
              <span className="font-mono text-[11px] text-faint">{formatIndex(index)}</span>
            </div>
            {isLead && Icon && (
              <Icon
                aria-hidden="true"
                strokeWidth={0.8}
                className="mx-auto my-auto hidden size-48 text-line-strong transition-colors duration-700 group-hover:text-accent/40 lg:block"
              />
            )}
            <div className="flex flex-col gap-4">
              <h3 className={isLead ? "text-gold text-3xl font-semibold tracking-[-0.03em] sm:text-5xl" : "text-xl font-medium tracking-tight"}>
                {skill.title}
              </h3>
              <p className={`leading-relaxed text-muted text-pretty ${isLead ? "max-w-lg text-base sm:text-lg" : "text-sm"}`}>{skill.description}</p>
            </div>
          </SpotlightCard>
        )}
      </motion.div>
    </motion.div>
  );
};

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
          <span>
            <span className="text-accent">:</span>checkhealth stack
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

// lazy.nvim's plugin list, one line per thing I'm good at, the way every plugin reports itself loaded
const Expertise = ({ areas }) => (
  <EditorWindow path={["cristopher", "skills", "lazy.nvim"]}>
    <div className="flex flex-col gap-5 font-mono text-xs">
      <p className="flex flex-wrap items-center justify-between gap-2 text-muted">
        <span>
          <span className="text-accent">:</span>Lazy <span className="text-faint">· what I lead with</span>
        </span>
        <span className="rounded-full bg-string/15 px-2.5 py-0.5 text-string">● {areas.length} loaded</span>
      </p>
      <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2">
        {areas.map((area, index) => (
          <motion.li
            key={area}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: easeOutExpo }}
            className="flex items-center gap-3"
          >
            <span className="text-string">●</span>
            <span className="text-[15px] text-fg">{area}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  </EditorWindow>
);

/** skills.lua: how I lead as a deck of cards, the four elements I bend, and the tools as a :checkhealth report. */
const Skills = ({ number }) => {
  const { data: skills = [], isLoading, isError } = useGetSkillsQuery();
  const { data: about } = useGetAboutQuery();
  const isBuffed = useMagicBuff();

  return (
    <section id="skills" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionIntro
          sectionId="skills"
          number={number}
          title={
            <>
              How I lead, <Gold>and what I reach for.</Gold>
            </>
          }
          lead="How I work, what I lead with, and every tool I've shipped with, graded honestly. Click any tool and the jobs that used it light up."
        />

        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="skills" />}

        {/* the Millennium Puzzle at the very start of the deck she buffs */}
        <p className="-mb-10 flex items-center gap-3 font-mono text-xs text-faint">
          <MillenniumPuzzle zoom={0.42} />
          <span>
            <span className="text-accent">--</span> cards.lua
          </span>
        </p>
        <div id="skill-cards" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill, index) => (
            <CapabilityCard key={skill.title} skill={skill} index={index} isBuffed={isBuffed} />
          ))}
        </div>


        {about?.expertise?.length > 0 && <Expertise areas={about.expertise} />}

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
