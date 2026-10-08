import { useRef, useState } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import portrait from "../../assets/images/portrait.jpg";
import TextReveal from "../../components/TextReveal";
import TypeLine from "../../components/TypeLine";
import CountUp from "../../components/CountUp";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { extractYearsOfExperience } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

// shown while the API wakes up so the hero never renders half a sentence
const FALLBACK_ROLE = "Tech Lead & Engineering Manager";
const FALLBACK_STACK = ["TypeScript", "Next.js", "Serverless", "AWS", "DynamoDB", "MySQL"];

const stackList = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

const riseIn = (delay) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.2, delay, ease: easeOutExpo },
});

const Stat = ({ value, label, delay }) => (
  <div className="flex flex-col gap-1.5 border-l border-line pl-4">
    <dd className="text-3xl font-medium tracking-tight sm:text-4xl">
      <CountUp value={value} delay={delay} />
    </dd>
    <dt className="order-last font-mono text-[11px] uppercase tracking-[0.15em] text-muted">{label}</dt>
  </div>
);

const Hero = () => {
  const sectionRef = useRef(null);
  const [isBooted, setIsBooted] = useState(false);
  const { data: about } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentBlur = useTransform(scrollYProgress, [0, 0.7], [0, 10]);
  const contentFilter = useMotionTemplate`blur(${contentBlur}px)`;
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const years = extractYearsOfExperience(about?.description);
  const role = about?.role ?? FALLBACK_ROLE;
  const mainStack = about?.main_stack ?? FALLBACK_STACK;

  return (
    <section ref={sectionRef} id="home" className="relative flex min-h-svh items-center overflow-hidden pt-28 pb-16">
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-40 top-1/3 size-[36rem] rounded-full bg-accent/10 blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-40 top-1/4 size-[36rem] rounded-full bg-signal/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8">
        <motion.div style={{ y: contentY, opacity: contentOpacity, filter: contentFilter }} className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-col gap-1.5 text-sm">
            <TypeLine prompt="~ $" text="whoami" delay={0.3} speed={90} onDone={() => setIsBooted(true)} className="text-muted" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isBooted ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="font-mono text-fg"
            >
              {role.toLowerCase()}
              <span className="text-faint"> · </span>typescript
              <span className="hidden sm:inline">
                <span className="text-faint"> · </span>
                <span className="text-signal">aws certified</span>
              </span>
            </motion.p>
          </div>

          <h1 className="text-[clamp(3.5rem,10vw,7.5rem)] leading-[0.9] font-medium tracking-[-0.055em]">
            <TextReveal text="Cristopher" delay={0.5} className="block" />
            <TextReveal text="Cervantes" delay={0.62} className="block text-muted" />
          </h1>

          <motion.p {...riseIn(1)} className="max-w-xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">
            I lead the engineers behind platforms that have to work on Monday morning. People, architecture and
            delivery, across <span className="text-fg">{stackList.format(mainStack)}</span>.
          </motion.p>

          <motion.div {...riseIn(1.15)} className="flex flex-wrap gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3.5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              See the work
              <ArrowDownRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink/40 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors duration-300 hover:border-faint"
            >
              Get in touch
              <ArrowUpRight size={16} className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
            </a>
          </motion.div>

          <motion.dl {...riseIn(1.3)} className="grid max-w-lg grid-cols-3 gap-4 pt-6">
            {years && <Stat value={years} label="Years shipping" delay={1.4} />}
            {projects.length > 0 && <Stat value={projects.length} label="Engagements" delay={1.5} />}
            <Stat value="2×" label="AWS certs" delay={1.6} />
          </motion.dl>
        </motion.div>

        <motion.figure style={{ y: portraitY }} className="relative mx-auto w-full max-w-sm lg:col-span-5 lg:max-w-none">
          <motion.div
            initial={{ clipPath: "inset(100% 0% 0% 0% round 24px)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0% round 24px)" }}
            transition={{ duration: 1.6, delay: 0.4, ease: easeOutExpo }}
            className="relative overflow-hidden rounded-3xl bg-panel"
          >
            <motion.div style={{ scale: portraitScale }}>
              <motion.img
                src={portrait}
                alt="Portrait of Cristopher Cervantes"
                initial={{ scale: 1.35 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2.2, delay: 0.4, ease: easeOutExpo }}
                className="aspect-[4/5] w-full object-cover object-center"
              />
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <p className="absolute inset-x-5 bottom-5 flex justify-between font-mono text-[11px] text-muted">
              <span className="text-accent">fig.01</span>
              <span>portrait.jpg</span>
            </p>
          </motion.div>
          <div className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-accent/50 via-transparent to-signal/50 blur-sm" aria-hidden="true" />
        </motion.figure>
      </div>

      <motion.a
        href="#manifesto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-faint sm:flex"
      >
        scroll
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <motion.span
            className="absolute inset-x-0 top-0 h-1/2 bg-accent"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
};

export default Hero;
