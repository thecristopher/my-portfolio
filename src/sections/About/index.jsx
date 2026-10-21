import SectionIntro, { Gold } from "../../components/SectionIntro";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import Philosophy from "./Philosophy";
import Glance from "./Glance";
import Bio from "./Bio";
import Principles from "./Principles";

/** about.md: the philosophy, the page at a glance, the story and how I lead. */
const About = ({ number }) => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();

  return (
    <section id="about" className="relative">
      <Philosophy />
      <div className="mx-auto flex max-w-6xl flex-col gap-24 px-4 pb-24 sm:gap-32 sm:px-6 sm:pb-36">
        <SectionIntro
          sectionId="about"
          number={number}
          title={
            <>
              From the editor <Gold>to the org chart.</Gold>
            </>
          }
          lead={about?.summary}
        />
        {isLoading && <SkeletonLines lines={6} />}
        {isError && <LoadError what="the bio" />}
        {about && <Glance about={about} current={projects[0]} />}
        {about && <Bio description={about.description} />}
        {about?.principles?.length > 0 && <Principles principles={about.principles} />}
      </div>
    </section>
  );
};

export default About;
