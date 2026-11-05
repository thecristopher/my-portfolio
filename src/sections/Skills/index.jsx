import { motion } from "framer-motion";
import SectionHeading, { Sunset } from "../../components/SectionHeading";
import TechIcon from "../../components/TechIcon";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { markMainStack } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { echo } from "../../lib/echo";
import { scrollToSection } from "../../lib/smoothScroll";
import { pickTech, usePickedTech } from "../../lib/stackFilter";
import { groupByCategory } from "./actions";
import LevelMeter from "./LevelMeter";
import Orbit from "./Orbit";

// a tool in the grid filters the work history for it, then takes you there to see which jobs light up
const showJobsUsing = (tool) => {
  pickTech(tool);
  echo(`Showing the jobs that shipped with ${tool}`, "success");
  scrollToSection("work");
};

const CategoryCard = ({ group, index, pickedTech }) => (
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
            <LevelMeter level={tool.level} />
          </button>
        </li>
      ))}
    </ul>
  </motion.li>
);

/** Every tool I've shipped with: the main stack sliding past in two rows, then each category graded honestly. */
const Skills = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const pickedTech = usePickedTech();
  const tools = about ? markMainStack(about.skill_levels, about.main_stack ?? []) : [];

  return (
    <section id="skills" className="relative overflow-hidden py-28 sm:py-40">
      {/* the heading and the grid sit above the orbit's starfield, so no star ever lands on a word or a card */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
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
        <div className="px-4 pt-6 pb-14 sm:px-6 sm:pt-10 sm:pb-20">
          <Orbit tools={tools} projects={projects} pickedTech={pickedTech} onPick={showJobsUsing} />
        </div>
      )}

      {about && (
        <div id="skill-grid" className="relative z-10 mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 sm:px-6">
          <p className="text-sm text-muted">
            <span className="font-semibold text-fg">Bold</span> is the main stack, the rings are how deep I've gone.
          </p>
          <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupByCategory(tools).map((group, index) => (
              <CategoryCard key={group.category} group={group} index={index} pickedTech={pickedTech} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Skills;
