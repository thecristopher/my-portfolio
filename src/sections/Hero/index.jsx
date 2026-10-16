import { useRef, useState } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import TextReveal from "../../components/TextReveal";
import TypeLine from "../../components/TypeLine";
import CountUp from "../../components/CountUp";
import PixelAvatar from "../../components/PixelAvatar";
import Magnetic from "../../components/Magnetic";
import { Pokeball } from "../../components/Secrets";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { extractYearsOfExperience, timesCertified } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

const WHOAMI = ["tech lead", "engineering manager", "full stack", "aws certified"];

// the sprite drops in once the name has landed, so he doesn't steal its moment
const AVATAR_ENTERS_AT_S = 1.2;

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

// moves the lit patch of the grid under the cursor through css vars, so react never re-renders for it
const trackGrid = (event) => {
  if (event.pointerType !== "mouse") return;
  const section = event.currentTarget;
  const bounds = section.getBoundingClientRect();
  section.style.setProperty("--grid-x", `${event.clientX - bounds.left}px`);
  section.style.setProperty("--grid-y", `${event.clientY - bounds.top}px`);
};

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
  // on phones the sprite is the last thing in the hero, so sliding him down would shove him past the
  // section's clipped bottom edge. the drift only runs side by side
  const isSideBySide = useMediaQuery("(min-width: 1024px)");
  const avatarDrift = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const avatarY = isSideBySide ? avatarDrift : 0;

  const years = extractYearsOfExperience(about?.description);
  const certified = timesCertified(about?.certifications);

  return (
    <section
      ref={sectionRef}
      id="home"
      onPointerMove={trackGrid}
      className="hero relative flex min-h-svh items-center overflow-hidden pt-28 pb-16"
    >
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="blueprint-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* the glows are gradients, not blurred circles. Safari crops a blur where a moving layer like the sprite sits
          on top of it, which left a hard edged box behind him */}
      <div className="pointer-events-none absolute -left-72 top-[calc(100%/3-8rem)] size-[52rem] bg-radial from-accent/10 to-transparent to-70%" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-72 top-[calc(25%-8rem)] size-[52rem] bg-radial from-signal/10 to-transparent to-70%" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8">
        <motion.div style={{ y: contentY, opacity: contentOpacity, filter: contentFilter }} className="flex flex-col gap-8 lg:col-span-7">
          <div className="flex flex-col gap-1.5 text-sm">
            <TypeLine prompt="~ $" text="whoami" delay={0.3} speed={90} onDone={() => setIsBooted(true)} className="text-muted" />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: isBooted ? 1 : 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap font-mono text-fg"
            >
              {WHOAMI.map((title, index) => (
                <span key={title} className={index === WHOAMI.length - 1 ? "text-accent" : undefined}>
                  {index > 0 && <span className="px-2 text-faint">·</span>}
                  {title}
                </span>
              ))}
            </motion.p>
          </div>

          <h1 className="text-[clamp(3.5rem,10vw,7.5rem)] leading-[0.9] font-medium tracking-[-0.055em]">
            <TextReveal text="Cristopher" delay={0.5} className="block" />
            <TextReveal text="Cervantes" delay={0.62} className="block text-muted" />
          </h1>

          <motion.p {...riseIn(1)} className="max-w-xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">
            Hey there! I'm a <span className="text-fg">full stack developer</span> from{" "}
            <span className="text-fg">Rosarito, Mexico</span>, with {years ?? "9+"} years of building software for every kind of
            market, from small local companies all the way to global corporations. These days I lead engineering
            teams and still write plenty of the code, lately with <span className="text-fg">TypeScript, AWS and LLMs</span>.
          </motion.p>

          <motion.div {...riseIn(1.15)} className="flex flex-wrap gap-3">
            <Magnetic>
              <a
                href="#work"
                className="group inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3.5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                See the work
                <ArrowDownRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-ink/40 px-6 py-3.5 text-sm font-medium backdrop-blur transition-colors duration-300 hover:border-faint"
              >
                Get in touch
                <ArrowUpRight size={16} className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
              </a>
            </Magnetic>
          </motion.div>

          <motion.dl {...riseIn(1.3)} className="grid max-w-lg grid-cols-3 gap-4 pt-6">
            {years && <Stat value={years} label="Years coding" delay={1.4} />}
            {certified && <Stat value={certified} label="AWS Certified" delay={1.5} />}
            {projects.length > 0 && <Stat value={projects.length} label="Companies" delay={1.6} />}
          </motion.dl>
        </motion.div>

        <motion.figure style={{ y: avatarY }} className="relative mx-auto flex flex-col items-center gap-6 lg:col-span-5">
          <div className="relative">
            {/* exact multiples of the 63 row sprite keep every pixel square */}
            <PixelAvatar
              className="h-[189px] sm:h-[252px] lg:h-[378px]"
              entersAfterMs={AVATAR_ENTERS_AT_S * 1000}
              firstWaveAfterMs={(AVATAR_ENTERS_AT_S + 1) * 1000}
            />
            {/* a soft floor shadow so he's standing somewhere. a gradient, because Safari paints a blurred div solid black */}
            <div className="absolute inset-x-[12.5%] -bottom-1 -z-10 h-3 bg-[radial-gradient(closest-side,var(--color-fg),transparent)] opacity-10" aria-hidden="true" />
          </div>
          <motion.figcaption
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: AVATAR_ENTERS_AT_S + 0.8, duration: 0.6 }}
            className="flex items-center gap-2 font-mono text-[11px] text-muted"
          >
            <span className="text-accent">player_1</span>
            <span>poke him</span>
            <Pokeball className="-my-2" />
          </motion.figcaption>
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
