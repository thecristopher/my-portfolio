import { useState } from "react";
import { motion } from "framer-motion";
import SectionHeader from "../../components/SectionHeader";
import Reveal from "../../components/Reveal";
import TerminalWindow from "../../components/TerminalWindow";
import TypeLine from "../../components/TypeLine";
import { Triforce } from "../../components/Secrets";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { extractYearsOfExperience, splitParagraphs } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

const JsonString = ({ children }) => <span className="text-string">"{children}"</span>;

const JsonList = ({ items }) => (
  <>
    <span className="text-faint">[</span>
    {items.map((item, index) => (
      <span key={item}>
        <JsonString>{item}</JsonString>
        {index < items.length - 1 && <span className="text-faint">, </span>}
      </span>
    ))}
    <span className="text-faint">]</span>
  </>
);

const JsonLine = ({ name, children, isLast = false, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: index * 0.08, ease: easeOutExpo }}
    className="pl-5"
  >
    <span className="text-signal">"{name}"</span>
    <span className="text-faint">: </span>
    {children}
    {!isLast && <span className="text-faint">,</span>}
  </motion.div>
);

const ProfileJson = ({ role, years, mainStack, editor, engagements }) => {
  const [isPrinted, setIsPrinted] = useState(false);

  return (
    <TerminalWindow title="~/cristopher · zsh">
      <div className="flex flex-col gap-3 font-mono text-[13px] leading-relaxed">
        <TypeLine text="cat profile.json" delay={0.2} onDone={() => setIsPrinted(true)} className="text-fg" />
        {isPrinted && (
          <div className="overflow-x-auto">
            <span className="text-faint">{"{"}</span>
            {role && <JsonLine index={0} name="role"><JsonString>{role}</JsonString></JsonLine>}
            {years && <JsonLine index={1} name="experience"><JsonString>{years} years</JsonString></JsonLine>}
            {mainStack.length > 0 && <JsonLine index={2} name="main_stack"><JsonList items={mainStack} /></JsonLine>}
            {editor && <JsonLine index={3} name="editor"><JsonString>{editor}</JsonString></JsonLine>}
            <JsonLine index={4} name="certified"><JsonList items={["AWS Cloud Practitioner", "AWS Developer Associate"]} /></JsonLine>
            <JsonLine index={5} name="engagements" isLast>
              <span className="text-accent">{engagements}</span>
            </JsonLine>
            <span className="text-faint">{"}"}</span>
          </div>
        )}
      </div>
    </TerminalWindow>
  );
};

const About = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();

  const [lead, ...rest] = splitParagraphs(about?.description);
  const years = extractYearsOfExperience(about?.description);

  return (
    <section id="about" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeader index="02" label="about.md" title="From the editor to the org chart." />

        <div className="grid gap-14 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            {isLoading && <SkeletonLines lines={6} />}
            {isError && <LoadError what="the bio" />}
            {lead && (
              <Reveal>
                <p className="text-xl leading-relaxed text-pretty sm:text-2xl">{lead}</p>
              </Reveal>
            )}
            {rest.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 24)} delay={index * 0.05}>
                <p className="leading-relaxed text-muted text-pretty">{paragraph}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <ProfileJson
                role={about?.role}
                years={years}
                mainStack={about?.main_stack ?? []}
                editor={about?.editor}
                engagements={projects.length}
              />
              <div className="mt-3 flex justify-end">
                <Triforce />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default About;
