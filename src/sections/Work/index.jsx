import { AnimatePresence } from "framer-motion";
import SectionHeading, { Sunset } from "../../components/SectionHeading";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetCaseStudiesQuery } from "../../api/caseStudiesApi";
import { countUsing, splitFeatured } from "../../actions";
import { usePickedTech } from "../../lib/stackFilter";
import { FilterBar } from "./pieces";
import Timeline from "./Timeline";
import Chapter from "./Chapter";
import EarlierRoles from "./EarlierRoles";

/** The career: every title on a timeline that walks forward as you scroll, then one chapter per company. */
const Work = () => {
  const { data: projects = [], isLoading, isError } = useGetProjectsQuery();
  const { data: caseStudies = [] } = useGetCaseStudiesQuery();
  const { featured, earlier } = splitFeatured(projects);
  const pickedTech = usePickedTech();

  return (
    <section id="work" className="relative pt-28 sm:pt-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <SectionHeading
          eyebrow="Experience"
          title={
            <>
              Five companies. <Sunset>Nine years.</Sunset>
            </>
          }
          lead="Some down the street from home, some an ocean away. Every title I held is on the timeline below, then each company gets a chapter with its wins and the case studies behind them."
        />
        {isLoading && <SkeletonLines lines={5} />}
        {isError && projects.length === 0 && <LoadError what="the work history" />}
      </div>

      {projects.length > 0 && <Timeline projects={projects} />}

      {/* always in the flow at zero height, so the filter floats over the jobs instead of shoving them down */}
      <div className="sticky top-20 z-20 h-0">
        <AnimatePresence>{pickedTech && <FilterBar tech={pickedTech} matches={countUsing(projects, pickedTech)} total={projects.length} />}</AnimatePresence>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-28 px-4 sm:px-6">
        {featured.map((project, index) => (
          <Chapter
            key={project.title}
            project={project}
            index={index}
            pickedTech={pickedTech}
            studies={caseStudies.filter((study) => study.company === project.title)}
          />
        ))}
        {earlier.length > 0 && <EarlierRoles projects={earlier} pickedTech={pickedTech} caseStudies={caseStudies} />}
      </div>
    </section>
  );
};

export default Work;
