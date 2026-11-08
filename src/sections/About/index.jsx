import SectionHeading, { Sunset } from "../../components/SectionHeading";
import ScrollWords from "../../components/ScrollWords";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { splitParagraphs } from "../../actions";
import Glance from "./Glance";
import Reach from "./Reach";
import StoryChapters from "./StoryChapters";

// the lead lights up as it's read, the rest of the story follows as chapters on a rail that fills as you go
const Story = ({ description }) => {
  const [lead, ...rest] = splitParagraphs(description);
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {lead && <ScrollWords pinned text={lead} className="text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[1.12] font-semibold tracking-[-0.035em] text-pretty" />}
      {rest.length > 0 && <StoryChapters paragraphs={rest} />}
    </div>
  );
};

/** The story in my own words, read to you one word at a time, the map of where the work reached, then the whole profile at a glance. */
const About = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();

  return (
    <section id="about" className="relative pt-28 sm:pt-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 sm:gap-28 sm:px-6">
        <SectionHeading
          eyebrow="About"
          title={
            <>
              From the border <Sunset>to the world.</Sunset>
            </>
          }
          lead="Hand me a hard problem and a team that wants to ship. I'll dig in until it works, and leave code a tired dev can still read at 2 AM."
        />
        {isLoading && <SkeletonLines lines={6} />}
        {isError && !about && <LoadError what="the story" />}
        {about && <Story description={about.description} />}
        {about && <Reach />}
        {about && <Glance about={about} />}
      </div>
    </section>
  );
};

export default About;
