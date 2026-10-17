import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import portrait from "../../assets/images/portrait.jpg";
import SectionHeader from "../../components/SectionHeader";
import Reveal from "../../components/Reveal";
import TerminalWindow from "../../components/TerminalWindow";
import TypeLine from "../../components/TypeLine";
import { Airbender } from "../../components/Secrets";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { splitParagraphs } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { TIMEZONE } from "../../lib/profile";

const JsonString = ({ children }) => <span className="text-string">"{children}"</span>;

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

// only what the rest of the page doesn't already say: the tools and certifications have their own sections
const ProfileJson = ({ editor }) => {
  const [isPrinted, setIsPrinted] = useState(false);

  return (
    <TerminalWindow title="~/cristopher · zsh">
      <div className="flex flex-col gap-3 font-mono text-[13px] leading-relaxed">
        <TypeLine text="cat profile.json" delay={0.2} onDone={() => setIsPrinted(true)} className="text-fg" />
        {isPrinted && (
          <div className="overflow-x-auto">
            <span className="text-faint">{"{"}</span>
            <JsonLine index={0} name="timezone" isLast={!editor}><JsonString>{TIMEZONE}</JsonString></JsonLine>
            {editor && <JsonLine index={1} name="editor" isLast><JsonString>{editor}</JsonString></JsonLine>}
            <span className="text-faint">{"}"}</span>
          </div>
        )}
      </div>
    </TerminalWindow>
  );
};

// the real me, wiping in the first time the section scrolls into view. the frame watches the scroll instead of
// the clipped photo, because a fully clipped element never counts as visible and the wipe would never start
const PORTRAIT_WIPE = {
  hidden: { clipPath: "inset(100% 0% 0% 0% round 24px)" },
  shown: { clipPath: "inset(0% 0% 0% 0% round 24px)", transition: { duration: 1.6, ease: easeOutExpo } },
};
const PORTRAIT_ZOOM = {
  hidden: { scale: 1.35 },
  // it settles a touch zoomed in, so the scroll drift never shows the frame's edge
  shown: { scale: 1.12, transition: { duration: 2.2, ease: easeOutExpo } },
};
const PORTRAIT_GLOW = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 1, delay: 0.6 } },
};

// about's signature: the photo drifts inside its frame as the bio scrolls by, like looking through a window
const Portrait = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.figure
      ref={ref}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.3 }}
      className="relative mx-auto w-full max-w-sm lg:max-w-none"
    >
      <motion.div variants={PORTRAIT_WIPE} className="relative overflow-hidden rounded-3xl bg-panel">
        <motion.img
          src={portrait}
          alt="Portrait of Cristopher Cervantes"
          variants={PORTRAIT_ZOOM}
          style={prefersReducedMotion ? undefined : { y: drift }}
          className="aspect-[4/5] w-full object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <figcaption className="absolute right-5 bottom-5 flex gap-2 font-mono text-[11px] text-muted">
          <span className="text-accent">fig.01</span>
          <span>portrait.jpg</span>
        </figcaption>
      </motion.div>
      <motion.div
        variants={PORTRAIT_GLOW}
        className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-accent/50 via-transparent to-signal/50 blur-sm"
        aria-hidden="true"
      />
    </motion.figure>
  );
};

const About = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const [lead, ...rest] = splitParagraphs(about?.description);

  return (
    <section id="about" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeader id="about" index="02" label="about.md" title="From the editor to the org chart." />

        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Portrait />
            </div>
          </div>

          <div id="bio" className="flex flex-col gap-6 lg:col-span-7">
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

            <Reveal delay={0.15} className="mt-6" id="profile">
              <ProfileJson editor={about?.editor ?? "Neovim"} />
              <div className="mt-3 flex justify-end">
                <Airbender />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
