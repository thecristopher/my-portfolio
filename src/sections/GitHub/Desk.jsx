import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Dumbbell } from "lucide-react";
import { useScrollRange } from "../../hooks/useScrollRange";
import { MAIN_PROJECT } from "./actions";
import { useTypist } from "./useTypist";
import Editor from "./Editor";
import Keyboard from "./Keyboard";
import { Lamp, Mug, NightWindow } from "./Props";

// the drills it runs inside the editor, called out on their own so they never get lost in the feature list
const Practice = () => (
  <div className="relative overflow-hidden rounded-2xl p-5 ring-1 ring-glow/30" style={{ background: "linear-gradient(140deg, color-mix(in oklab, var(--color-glow) 16%, transparent), transparent 70%)" }}>
    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-glow uppercase">
      <Dumbbell size={14} aria-hidden="true" />
      Built in: <span className="whitespace-nowrap">{MAIN_PROJECT.practice.name}</span>
    </p>
    <ul className="mt-3 flex flex-col gap-2 text-sm leading-snug text-stage-fg/85">
      {MAIN_PROJECT.practice.perks.map((perk) => (
        <li key={perk} className="flex gap-2.5">
          <span className="mt-1.5 size-1.5 shrink-0 rotate-45 bg-glow" aria-hidden="true" />
          {perk}
        </li>
      ))}
    </ul>
  </div>
);

// what's on the screen: the pitch on one side and, on the other, the editor typing out what it does
const Screen = ({ typed }) => (
  <a href={MAIN_PROJECT.url} target="_blank" rel="noreferrer" className="group relative grid gap-8 overflow-hidden rounded-[1.1rem] bg-stage p-6 text-stage-fg sm:p-10 lg:grid-cols-[1fr_1.1fr]">
    <span className="bg-sunset pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-40" aria-hidden="true" />
    <div className="relative flex flex-col gap-5">
      <p className="text-sm font-semibold text-glow">Featured project</p>
      <h3 className="text-[clamp(2rem,4.6vw,3.6rem)] leading-none font-semibold tracking-[-0.045em] whitespace-nowrap">{MAIN_PROJECT.title}</h3>
      <p className="text-lg leading-relaxed text-stage-fg/75 text-pretty">{MAIN_PROJECT.pitch}</p>
      <Practice />
      <span className="mt-auto flex w-fit items-center gap-1.5 text-sm font-medium text-glow">
        View on GitHub
        <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </div>
    <div className="relative min-w-0">
      <Editor typed={typed} />
      {/* the editor is drawn for the eyes, screen readers get the same features as a plain list */}
      <ul className="sr-only">
        {MAIN_PROJECT.features.map(([name, what]) => (
          <li key={name}>
            {name}: {what}
          </li>
        ))}
      </ul>
    </div>
  </a>
);

// the warm pool the lamp throws over the laptop and the desk, the same light that's on my glasses in the photo
const LampLight = ({ light }) => (
  <motion.div
    style={{ opacity: light }}
    className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
    aria-hidden="true"
  >
    <span className="absolute top-[30%] left-[8%] h-[70%] w-[60%] rounded-full bg-[radial-gradient(ellipse_at_25%_20%,rgba(255,196,120,0.22),transparent_62%)] blur-xl" />
    <span className="absolute bottom-[4%] left-[14%] h-[18%] w-[50%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,190,110,0.3),transparent_70%)] blur-2xl" />
  </motion.div>
);

// the room the desk sits in: always night, whatever theme the rest of the page is in
const Room = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,#2a2333_0%,#121019_55%,#0a090e_100%)]" />
    <NightWindow className="absolute top-[7%] right-[6%] hidden w-[18%] max-w-56 opacity-90 md:block" />
    {/* the desk top, lit along its front edge */}
    <div className="absolute inset-x-0 bottom-0 h-[16%] bg-gradient-to-b from-[#3b2618] via-[#2a1a10] to-[#160d07]">
      <span className="absolute inset-x-0 top-0 h-px bg-[#7a5236]/60" />
    </div>
  </div>
);

/**
 * The config I live in, on a laptop on my desk at night: the lid opens as it scrolls in, the lamp clicks on over it,
 * the editor types the features out and every keystroke lights its key, next to a mug that's still steaming.
 */
// the lid is all but open here, so the typing starts on a screen you can read instead of one still swinging up
const STARTS_TYPING_AT = 0.78;

const Desk = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const [isOpen, setIsOpen] = useState(() => scrollYProgress.get() >= STARTS_TYPING_AT);
  useMotionValueEvent(scrollYProgress, "change", (value) => value >= STARTS_TYPING_AT && setIsOpen(true));
  const typed = useTypist(isOpen);
  const lid = useScrollRange(scrollYProgress, [0.1, 0.85], [78, 0]);
  const scale = useScrollRange(scrollYProgress, [0, 0.85], [0.9, 1]);
  const lampOn = useScrollRange(scrollYProgress, [0.6, 0.72, 0.76, 0.8, 0.95], [0, 0.7, 0.25, 0.85, 1]);
  const light = prefersReducedMotion ? 1 : lampOn;
  const roomGlow = useTransform(lampOn, (value) => value * 0.9);

  return (
    <div ref={ref} className="relative isolate overflow-hidden rounded-[2rem] px-3 pt-14 pb-[6%] ring-1 ring-line sm:px-10 sm:pt-20 lg:px-24 lg:pt-36">
      <Room />
      {/* the lamp stands on the desk to the left of the laptop, its shade leaning over the keyboard */}
      <Lamp light={light} className="absolute bottom-[5%] left-[1%] z-20 hidden h-[86%] lg:block" />
      {/* a real mug next to a laptop: its body a little under half the lid's height, standing just in front of it */}
      <Mug className="absolute right-[1%] bottom-[3%] z-30 hidden h-[48%] lg:block" />
      <motion.div style={prefersReducedMotion ? undefined : { scale }} className="relative z-10 mx-auto w-full max-w-4xl lg:max-w-2xl">
        <div className="[perspective:1800px]">
          <motion.div
            style={prefersReducedMotion ? undefined : { rotateX: lid }}
            className="relative origin-bottom rounded-t-[1.6rem] rounded-b-md bg-[#0c0c0e] px-2.5 pt-4 pb-2.5 shadow-2xl ring-1 ring-white/10 sm:px-3.5 sm:pt-5 sm:pb-3.5"
          >
            {/* the camera in the top bezel */}
            <span className="absolute top-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#1d2630] ring-1 ring-white/10 sm:top-2" aria-hidden="true" />
            <Screen typed={typed} />
          </motion.div>
        </div>
        <Keyboard typed={typed} />
      </motion.div>
      <LampLight light={prefersReducedMotion ? 1 : roomGlow} />
    </div>
  );
};

export default Desk;
