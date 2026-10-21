import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDownRight } from "lucide-react";
import KineticName from "../../components/KineticName";
import Magnetic from "../../components/Magnetic";
import { Trigger as PlayerOne } from "../../components/Relics/ScottPilgrim";
import { useGetAboutQuery } from "../../api/aboutApi";
import { easedGlow } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { INTRO_S } from "../../lib/intro";
import ProfileWindow from "./ProfileWindow";

// how far a value is between two points, held at 0 before and 1 after
const clampProgress = (value, from, to) => Math.min(1, Math.max(0, (value - from) / (to - from)));

// the soft shadow the sprite stands on
const FLOOR_SHADOW = easedGlow("var(--color-fg)", { strength: 0.1, shape: "ellipse" });

// the sprite drops in once the name has landed, so he doesn't steal its moment
const AVATAR_ENTERS_AT_S = INTRO_S + 1.2;

// everything in the hero waits for the hub, if it plays
const riseIn = (delay) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.2, delay: INTRO_S + delay, ease: easeOutExpo },
});

// only shows once the api says what I'm open to. the title and the city already have their own places
const OpenTo = ({ openTo }) => (
  <motion.p {...riseIn(0.2)} className="flex w-fit items-center gap-2 rounded-full border border-line-strong bg-panel/60 px-3 py-1.5 font-mono text-xs text-muted backdrop-blur">
    <span className="relative flex size-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-string/60" />
      <span className="relative size-2 rounded-full bg-string" />
    </span>
    {openTo}
  </motion.p>
);

// the resume lives in the bufferline on every screen, so the hero only points into the page
const Actions = () => (
  <motion.div {...riseIn(1.1)} className="flex flex-wrap items-center gap-3">
    <Magnetic>
      <a
        href="#work"
        className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-ink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      >
        See the work
        <ArrowDownRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
      </a>
    </Magnetic>
    <a href="#contact" className="px-2 text-sm text-accent underline-offset-4 hover:underline">
      Get in touch ›
    </a>
  </motion.div>
);

// player one, standing in the tall grass at the edge of the stage
const Stage = () => (
  <figure className="relative flex justify-center">
    <div className="relative">
      {/* exact multiples of the 63 row sprite keep every pixel square */}
      <PlayerOne
        className="h-[126px] sm:h-[252px] lg:h-[315px]"
        entersAfterMs={AVATAR_ENTERS_AT_S * 1000}
        firstWaveAfterMs={(AVATAR_ENTERS_AT_S + 1) * 1000}
      />
      {/* a gradient, because Safari paints a blurred div solid black */}
      <div className="pointer-events-none absolute inset-x-[12.5%] top-[120px] -z-10 h-3 sm:top-[243px] lg:top-[306px]" style={{ background: FLOOR_SHADOW }} aria-hidden="true" />
    </div>
  </figure>
);

const Intro = ({ about }) => {
  const summary = about?.headline?.split(". ").slice(1).join(". ");
  return (
    <div className="flex flex-col gap-7">
      {about?.open_to && <OpenTo openTo={about.open_to} />}
      <KineticName
        lines={[{ text: "Cristopher" }, { text: "Cervantes.", className: "text-accent" }]}
        delay={INTRO_S + 0.5}
        className="text-[clamp(3.25rem,10.5vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.06em]"
      />
      <motion.p {...riseIn(0.95)} className="max-w-xl text-xl leading-snug text-muted text-pretty sm:text-2xl">
        <span className="text-fg">Engineering Manager &amp; Tech Lead.</span> {summary || "AI products, serverless AWS and the teams that ship them."}
      </motion.p>
      <Actions />
    </div>
  );
};

/**
 * The opening scene, the way Apple opens a product page: the name huge and centered, then as you scroll it
 * sinks back and an editor window rises out of the page with the facts a recruiter scans for first.
 */
const Hero = () => {
  const sceneRef = useRef(null);
  const { data: about } = useGetAboutQuery();
  const prefersReducedMotion = useReducedMotion();
  const isScene = !prefersReducedMotion;

  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });
  const introScale = useTransform(scrollYProgress, [0, 0.45], [1, 0.86]);
  // the function form on purpose: framer hands plain opacity ranges to the browser's scroll timeline, which maps
  // this pinned scene's offsets wrong and leaves both layers half visible
  const introOpacity = useTransform(scrollYProgress, (progress) => 1 - clampProgress(progress, 0.05, 0.4));
  const introBlur = useTransform(scrollYProgress, [0.05, 0.4], [0, 12]);
  const introFilter = useMotionTemplate`blur(${introBlur}px)`;
  const windowY = useTransform(scrollYProgress, [0.15, 0.7], ["65vh", "0vh"]);
  const windowScale = useTransform(scrollYProgress, [0.15, 0.75], [0.82, 1]);
  const windowOpacity = useTransform(scrollYProgress, (progress) => clampProgress(progress, 0.15, 0.4));

  return (
    <section id="home" ref={sceneRef} className={`relative ${isScene ? "h-[260svh]" : ""}`}>
      <div className={isScene ? "sticky top-0 h-svh overflow-hidden" : "py-28"}>
        <motion.div
          style={isScene ? { scale: introScale, opacity: introOpacity, filter: introFilter } : undefined}
          className="mx-auto grid h-full w-full max-w-6xl content-center items-center gap-6 px-4 pt-16 pb-10 sm:px-6 lg:grid-cols-12 lg:gap-10"
        >
          <div className="lg:col-span-8">
            <Intro about={about} />
          </div>
          {/* on phones he stands under the buttons, where the scene still has room before the window rises */}
          <div className="lg:col-span-4">
            <Stage />
          </div>
        </motion.div>

        <motion.div
          style={isScene ? { y: windowY, scale: windowScale, opacity: windowOpacity } : undefined}
          className={`${isScene ? "absolute inset-x-0 top-1/2 -translate-y-1/2" : "mt-12"} mx-auto w-full max-w-4xl px-4 sm:px-6`}
        >
          <ProfileWindow about={about} />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
