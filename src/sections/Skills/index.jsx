import SectionHeading, { Sunset } from "../../components/SectionHeading";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { markMainStack, slugify, usesTech } from "../../actions";
import { echo } from "../../lib/echo";
import { scrollToSection } from "../../lib/smoothScroll";
import { pickTech, usePickedTech } from "../../lib/stackFilter";
import { groupByCategory, jobAnchor } from "./actions";
import Orbit from "./Orbit";
import SkillCard from "./SkillCard";

// a planet's "see these jobs" lights them in the work history and lands on the first one, not on the section's top
const showJobsUsing = (tool, projects) => {
  pickTech(tool);
  echo(`Showing the jobs that shipped with ${tool}`, "success");
  const first = projects.find((project) => usesTech(project, tool));
  scrollToSection(first ? jobAnchor(first.title, slugify) : "work");
};

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
          lead="Everything I've shipped with, grouped the way the résumé groups it. Pick a tool to see where it shipped, then jump straight to that job."
        />
        {isLoading && <SkeletonLines lines={4} />}
        {isError && !about && <LoadError what="the skills" />}
      </div>

      {tools.length > 0 && (
        <div className="px-4 pt-6 pb-14 sm:px-6 sm:pt-10 sm:pb-20">
          <Orbit tools={tools} projects={projects} pickedTech={pickedTech} onPick={(tool) => showJobsUsing(tool, projects)} />
        </div>
      )}

      {about && (
        <div id="skill-grid" className="relative z-10 mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 sm:px-6">
          <p className="text-sm text-muted">
            <span className="font-semibold text-fg">Bold</span> is the main stack, the bars are how deep I've gone. Pick a tool to turn its card over.
          </p>
          <ul className="grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
            {groupByCategory(tools).map((group, index) => (
              <SkillCard key={group.category} group={group} index={index} projects={projects} pickedTech={pickedTech} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Skills;
