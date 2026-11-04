import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import SectionHeading, { Sunset } from "../../components/SectionHeading";
import TechIcon from "../../components/TechIcon";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Trigger as MillenniumPuzzle } from "../../components/Relics/DarkMagician";
import { useScrollRange } from "../../hooks/useScrollRange";
import { useGetAboutQuery } from "../../api/aboutApi";
import { markMainStack } from "../../actions";
import { MAGIC_BLUE, MAGIC_PINK, useMagicBuff } from "../../lib/magic";
import { easeOutExpo } from "../../lib/motion";
import { echo } from "../../lib/echo";
import { scrollToSection } from "../../lib/smoothScroll";
import { pickTech, usePickedTech } from "../../lib/stackFilter";
import { MAX_LEVEL, groupByCategory, levelDots, splitMarqueeRows } from "./actions";

// a tool in the grid filters the work history for it, then takes you there to see which jobs light up
const showJobsUsing = (tool) => {
  pickTech(tool);
  echo(`Showing the jobs that shipped with ${tool}`, "success");
  scrollToSection("work");
};

const BUFFED_DOT = { backgroundImage: `linear-gradient(135deg, ${MAGIC_PINK}, ${MAGIC_BLUE})`, boxShadow: `0 0 6px ${MAGIC_PINK}` };

// one row of logos sliding forever, and drifting a little further with the scroll
const MarqueeRow = ({ tools, reverse = false, drift }) => (
  <motion.div style={{ x: drift }} className="marquee overflow-hidden">
    <div className="marquee-track flex w-max gap-4" data-direction={reverse ? "reverse" : undefined} style={{ "--marquee-duration": `${tools.length * 4}s` }}>
      {[...tools, ...tools].map((tool, index) => (
        <span key={`${tool}-${index}`} className="card flex items-center gap-3 rounded-full px-5 py-3 text-lg font-semibold tracking-tight whitespace-nowrap">
          <TechIcon tech={tool} className="size-6" fallback={<span className="size-2 rounded-full bg-accent" />} />
          {tool}
        </span>
      ))}
    </div>
  </motion.div>
);

const Marquee = ({ tools }) => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const forward = useScrollRange(scrollYProgress, [0, 1], ["4%", "-8%"]);
  const backward = useScrollRange(scrollYProgress, [0, 1], ["-8%", "4%"]);
  const [first, second] = splitMarqueeRows(tools);

  return (
    <div ref={ref} className="flex flex-col gap-4" aria-hidden="true">
      <MarqueeRow tools={first} drift={prefersReducedMotion ? undefined : forward} />
      <MarqueeRow tools={second} reverse drift={prefersReducedMotion ? undefined : backward} />
    </div>
  );
};

const LevelMeter = ({ level, isBuffed }) => (
  <span className="flex gap-1" aria-label={`${level} out of ${MAX_LEVEL}`}>
    {levelDots(level).map((isLit, index) => (
      <span key={index} className={`size-1.5 rounded-full ${isLit ? "bg-fg" : "bg-line-strong"}`} style={isLit && isBuffed ? BUFFED_DOT : undefined} />
    ))}
  </span>
);

const CategoryCard = ({ group, index, isBuffed, pickedTech }) => (
  <motion.li
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 1, delay: (index % 3) * 0.08, ease: easeOutExpo }}
    className="card flex flex-col gap-5 rounded-3xl p-7"
  >
    <p className="text-xl font-semibold tracking-tight">{group.category}</p>
    <ul className="flex flex-col">
      {group.tools.map((tool) => (
        <li key={tool.name}>
          <button
            type="button"
            onClick={() => showJobsUsing(tool.name)}
            title={`See the jobs that shipped with ${tool.name}`}
            className={`flex w-full items-center gap-3 border-t border-line py-2.5 text-left transition-colors hover:text-accent ${pickedTech === tool.name ? "text-accent" : ""}`}
          >
            <TechIcon tech={tool.name} className="size-4" fallback={<span className="size-4 shrink-0" />} />
            <span className={`flex-1 truncate ${tool.isMain ? "font-semibold" : "text-muted"}`}>{tool.name}</span>
            <LevelMeter level={tool.level} isBuffed={isBuffed} />
          </button>
        </li>
      ))}
    </ul>
  </motion.li>
);

/** Every tool I've shipped with: the main stack sliding past in two rows, then each category graded honestly. */
const Skills = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const isBuffed = useMagicBuff();
  const pickedTech = usePickedTech();
  const tools = about ? markMainStack(about.skill_levels, about.main_stack ?? []) : [];

  return (
    <section id="skills" className="relative overflow-hidden py-28 sm:py-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeading
          eyebrow="Skills"
          title={
            <>
              The tools, <Sunset>graded honestly.</Sunset>
            </>
          }
          lead="Everything I've shipped with, grouped the way the résumé groups it. Pick a tool and the jobs that used it light up."
        />
        {isLoading && <SkeletonLines lines={4} />}
        {isError && !about && <LoadError what="the skills" />}
      </div>

      {tools.length > 0 && (
        <div className="py-16">
          <Marquee tools={tools.map((tool) => tool.name)} />
        </div>
      )}

      {about && (
        <div id="skill-grid" className="mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 sm:px-6">
          <p className="flex items-center gap-3 text-sm text-muted">
            <span className="font-semibold text-fg">Bold</span> is the main stack, dots are how deep I've gone.
            {/* the Millennium Puzzle keeps watch over the grades she buffs */}
            <MillenniumPuzzle zoom={0.42} />
          </p>
          <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupByCategory(tools).map((group, index) => (
              <CategoryCard key={group.category} group={group} index={index} isBuffed={isBuffed} pickedTech={pickedTech} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Skills;
