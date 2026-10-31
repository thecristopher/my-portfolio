import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import portrait from "../../assets/images/portrait.jpg";
import Reveal from "../../components/Reveal";
import { Trigger as FlamelCross } from "../../components/Relics/Fullmetal";
import { Trigger as BatSignal } from "../../components/Relics/Batman";
import { splitParagraphs } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

// the real me, wiping in the first time the photo scrolls into view
const PORTRAIT_WIPE = {
  hidden: { clipPath: "inset(100% 0% 0% 0% round 28px)" },
  shown: { clipPath: "inset(0% 0% 0% 0% round 28px)", transition: { duration: 1.6, ease: easeOutExpo } },
};

const PORTRAIT_ZOOM = {
  hidden: { scale: 1.35 },
  // it settles a touch zoomed in, so the scroll drift never shows the frame's edge
  shown: { scale: 1.12, transition: { duration: 2.2, ease: easeOutExpo } },
};

// the photo drifts inside its frame as the bio scrolls by, like looking through a window
const Portrait = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <motion.figure ref={ref} initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.3 }} className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <motion.div variants={PORTRAIT_WIPE} className="relative overflow-hidden rounded-[28px] bg-panel">
        <motion.img
          src={portrait}
          alt="Portrait of Cristopher Cervantes"
          variants={PORTRAIT_ZOOM}
          style={prefersReducedMotion ? undefined : { y: drift }}
          className="aspect-[4/5] w-full object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <figcaption className="absolute right-5 bottom-5 flex items-center gap-2 font-mono text-[11px] text-muted">
          {/* every photo is evidence, and Gotham stamps its own */}
          <BatSignal zoom={0.32} />
          <span className="text-accent">fig.01</span>
          <span>portrait.jpg</span>
        </figcaption>
      </motion.div>
    </motion.figure>
  );
};

/** The story in my own words, the first paragraph set large like a lead, next to the portrait, with Ed's emblem at the end. */
const Bio = ({ description }) => {
  const [lead, ...rest] = splitParagraphs(description);
  return (
    <div className="grid gap-14 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <Portrait />
        </div>
      </div>
      <div id="bio" className="flex flex-col gap-6 lg:col-span-7 lg:pt-8">
        {lead && (
          <Reveal>
            <p className="text-2xl leading-snug font-medium tracking-tight text-pretty sm:text-3xl">{lead}</p>
          </Reveal>
        )}
        {rest.map((paragraph, index) => (
          <Reveal key={paragraph.slice(0, 24)} delay={index * 0.05}>
            <p className="text-lg leading-relaxed text-muted text-pretty">{paragraph}</p>
          </Reveal>
        ))}
        {/* Ed's emblem signs off the story: hard problems in, readable code out */}
        <span className="flex justify-end">
          <FlamelCross zoom={0.42} />
        </span>
      </div>
    </div>
  );
};

export default Bio;
