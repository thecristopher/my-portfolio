import SectionIntro, { Gold } from "../../components/SectionIntro";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import Bio from "./Bio";

/** about.md: the story in my own words, next to the portrait. */
const About = ({ number }) => {
  const { data: about, isLoading, isError } = useGetAboutQuery();

  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 sm:px-6">
        <SectionIntro
          sectionId="about"
          number={number}
          title={
            <>
              From the editor <Gold>to the org chart.</Gold>
            </>
          }
          lead="Hand me a hard problem and a team that wants to ship. I'll dig in until it works, and leave code a tired dev can still read at 2 AM."
        />
        {isLoading && <SkeletonLines lines={6} />}
        {isError && !about && <LoadError what="the bio" />}
        {about && <Bio description={about.description} />}
      </div>
    </section>
  );
};

export default About;
