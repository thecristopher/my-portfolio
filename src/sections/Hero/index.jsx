import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import portrait from "../../assets/images/portrait.jpg";
import Magnetic from "../../components/Magnetic";
import { Trigger as PlayerOne } from "../../components/Relics/ScottPilgrim";
import { useScrollRange } from "../../hooks/useScrollRange";
import { useGetAboutQuery } from "../../api/aboutApi";
import { easeOutExpo } from "../../lib/motion";
import { HERO_BEATS, headlineStory } from "./actions";

const FALLBACK = { role: "Engineering Manager & Tech Lead", story: "Nine years of shipping software from a beach town in Baja to people all over the world." };

const riseIn = (delay) => ({
  initial: { opacity: 0, y: 28, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1.3, delay, ease: easeOutExpo },
});

// the name, huge, before the photo takes over the stage
const Title = ({ role, style }) => (
  <motion.div style={style} className="absolute inset-x-0 top-[15svh] flex flex-col items-center gap-4 px-4 text-center sm:top-[13svh]">
    <motion.p {...riseIn(0.3)} className="text-base font-medium text-muted sm:text-lg">
      {role}
    </motion.p>
    <motion.h1 {...riseIn(0.45)} className="text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.9] font-semibold tracking-[-0.06em]">
      Cristopher
      <br />
      <span className="text-sunset">Cervantes.</span>
    </motion.h1>
  </motion.div>
);

// the way in once the photo has the stage: the work, or straight to the inbox
const Actions = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Magnetic>
      <a
        href="#work"
        onClick={(event) => event.stopPropagation()}
        className="group inline-flex items-center gap-2 rounded-full bg-stage-fg px-5 py-3 text-sm font-semibold text-stage transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      >
        See the work
        <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>
    </Magnetic>
    <a href="#contact" onClick={(event) => event.stopPropagation()} className="px-2 text-sm font-medium text-glow underline-offset-4 hover:underline">
      Get in touch
    </a>
  </div>
);

// what the photo says once it fills the stage, laid over its darkest corner
const Caption = ({ about, story, style }) => (
  <motion.div style={style} className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 p-6 text-stage-fg sm:p-10">
    <p className="text-sm text-stage-fg/70">
      {about?.location ?? "Rosarito, Mexico"} · {about?.years_of_experience ?? 9}+ years shipping
    </p>
    <p className="max-w-xl text-[clamp(1.5rem,3.4vw,2.6rem)] leading-[1.08] font-semibold tracking-[-0.03em] text-balance">{story}</p>
    <Actions />
  </motion.div>
);

const ScrollCue = ({ style }) => (
  <motion.p style={style} className="absolute inset-x-0 bottom-6 z-20 flex justify-center text-faint" aria-hidden="true">
    <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
      <ArrowDown size={18} />
    </motion.span>
  </motion.p>
);

// the photo with its own shade, so the caption always reads over it
const Photo = ({ shadeStyle }) => (
  <PlayerOne className="size-full">
    <img src={portrait} alt="Cristopher Cervantes" className="size-full object-cover" fetchPriority="high" />
    <motion.div style={shadeStyle} className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
  </PlayerOne>
);

/** Anyone who asked for less movement gets the same story without the pinned stage. */
const StillHero = ({ about, role, story }) => (
  <section id="home" className="flex flex-col items-center gap-10 px-4 pt-28 pb-16 text-center">
    <h1 className="text-[clamp(3.2rem,11vw,9.5rem)] leading-[0.9] font-semibold tracking-[-0.06em]">
      <span className="block text-base font-medium tracking-normal text-muted sm:text-lg">{role}</span>
      Cristopher <span className="text-sunset">Cervantes.</span>
    </h1>
    <div className="relative aspect-square w-full max-w-xl overflow-hidden rounded-[2rem] bg-stage text-left">
      <Photo />
      <Caption about={about} story={story} />
    </div>
  </section>
);

/**
 * The opening scene, pinned while it plays: my name huge, then the photo rising from below and growing until it owns
 * the stage, the page around it dimming into the green of the wall it was taken against, and the story landing on it.
 */
const Hero = () => {
  const { data: about } = useGetAboutQuery();
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const { grow, title, caption, stage } = HERO_BEATS;

  const photoScale = useScrollRange(scrollYProgress, grow, [0.5, 1]);
  const photoY = useScrollRange(scrollYProgress, grow, ["30svh", "0svh"]);
  const photoRadius = useScrollRange(scrollYProgress, grow, [48, 28]);
  const titleOpacity = useScrollRange(scrollYProgress, title, [1, 0]);
  const titleY = useScrollRange(scrollYProgress, title, [0, -80]);
  const titleBlur = useScrollRange(scrollYProgress, title, ["blur(0px)", "blur(12px)"]);
  // the green spreads out from behind the photo in a circle, so the page never passes through a muddy gray on the way
  const stageReveal = useScrollRange(scrollYProgress, stage, ["circle(0% at 50% 55%)", "circle(120% at 50% 55%)"]);
  const captionOpacity = useScrollRange(scrollYProgress, caption, [0, 1]);
  const captionY = useScrollRange(scrollYProgress, caption, [40, 0]);
  // the buttons only take clicks once they can be seen
  const captionClicks = useTransform(captionOpacity, (opacity) => (opacity > 0.6 ? "auto" : "none"));
  const cueOpacity = useScrollRange(scrollYProgress, [0, 0.06], [1, 0]);

  const role = about?.role ?? FALLBACK.role;
  const story = headlineStory(about?.headline) || FALLBACK.story;

  if (prefersReducedMotion) return <StillHero about={about} role={role} story={story} />;

  return (
    <section id="home" ref={ref} className="relative h-[280svh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <motion.div style={{ clipPath: stageReveal }} className="absolute inset-0 bg-stage" aria-hidden="true" />
        <Title role={role} style={{ opacity: titleOpacity, y: titleY, filter: titleBlur }} />
        <div className="absolute inset-0 z-10 grid place-items-center px-4 pt-14">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.7, ease: easeOutExpo }}>
            <motion.div
              style={{ scale: photoScale, y: photoY, borderRadius: photoRadius }}
              className="relative aspect-square w-[min(92vw,calc(100svh-6rem))] overflow-hidden bg-stage shadow-2xl"
            >
              <Photo shadeStyle={{ opacity: captionOpacity }} />
              <Caption about={about} story={story} style={{ opacity: captionOpacity, y: captionY, pointerEvents: captionClicks }} />
            </motion.div>
          </motion.div>
        </div>
        <ScrollCue style={{ opacity: cueOpacity }} />
      </div>
    </section>
  );
};

export default Hero;
