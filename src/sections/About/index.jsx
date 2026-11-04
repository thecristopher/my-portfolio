import SectionHeading, { Sunset } from "../../components/SectionHeading";
import ScrollWords from "../../components/ScrollWords";
import Reveal from "../../components/Reveal";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Trigger as FlamelCross } from "../../components/Relics/Fullmetal";
import { useGetAboutQuery } from "../../api/aboutApi";
import { splitParagraphs } from "../../actions";
import Glance from "./Glance";

// the lead lights up as it's read, the rest of the story follows in a calmer column
const Story = ({ description }) => {
  const [lead, ...rest] = splitParagraphs(description);
  return (
    <div className="flex flex-col gap-20 sm:gap-28">
      {lead && <ScrollWords text={lead} className="text-[clamp(1.9rem,4.6vw,3.6rem)] leading-[1.12] font-semibold tracking-[-0.035em] text-pretty" />}
      <div className="grid gap-10 lg:grid-cols-12">
        <p className="text-sm font-semibold text-muted lg:col-span-4">How I got here</p>
        <div className="flex flex-col gap-6 lg:col-span-8">
          {rest.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 24)} delay={index * 0.05}>
              <p className="text-xl leading-relaxed text-muted text-pretty sm:text-2xl">{paragraph}</p>
            </Reveal>
          ))}
          {/* Ed's emblem signs off the story: hard problems in, readable code out */}
          <span className="flex justify-end">
            <FlamelCross zoom={0.42} />
          </span>
        </div>
      </div>
    </div>
  );
};

/** The story in my own words, read to you one word at a time, then the whole profile at a glance. */
const About = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();

  return (
    <section id="about" className="relative py-28 sm:py-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-20 px-4 sm:gap-28 sm:px-6">
        <SectionHeading
          eyebrow="About"
          title={
            <>
              From the editor <Sunset>to the org chart.</Sunset>
            </>
          }
          lead="Hand me a hard problem and a team that wants to ship. I'll dig in until it works, and leave code a tired dev can still read at 2 AM."
        />
        {isLoading && <SkeletonLines lines={6} />}
        {isError && !about && <LoadError what="the story" />}
        {about && <Story description={about.description} />}
        {about && <Glance about={about} />}
      </div>
    </section>
  );
};

export default About;
