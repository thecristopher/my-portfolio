import SectionIntro, { Gold } from "../../components/SectionIntro";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import Philosophy from "./Philosophy";
import Bio from "./Bio";
import Day from "./Day";

/** about.md: the philosophy, the story in my own words, and what a weekday here looks like. */
const About = ({ number }) => {
  const { data: about, isLoading, isError } = useGetAboutQuery();

  return (
    <section id="about" className="relative">
      <Philosophy />
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 sm:gap-20 sm:px-6 sm:pb-36">
        <SectionIntro
          sectionId="about"
          number={number}
          title={
            <>
              From the editor <Gold>to the org chart.</Gold>
            </>
          }
        />
        {isLoading && <SkeletonLines lines={6} />}
        {isError && <LoadError what="the bio" />}
        {about && <Bio description={about.description} />}
        <Day />
      </div>
    </section>
  );
};

export default About;
