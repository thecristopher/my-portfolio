import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { usePinnedTrack } from "../../hooks/usePinnedTrack";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { scrollToSection } from "../../lib/smoothScroll";
import { LINK } from "../../lib/sprites/link";
import { careerSteps } from "./actions";
import Landscape from "./overworld/Landscape";
import Chest from "./overworld/Chest";
import Dialog from "./overworld/Dialog";
import Walker from "./overworld/Walker";
import { useOverworld, useSceneSize } from "./overworld/useOverworld";
import { dwellProgress } from "./overworld/actions";

// how long Link takes to walk up into a chapter before the page follows him there
const ENTER_MS = 600;

// the classic dot and line the titles hang from, for anyone who asked for less movement
const Dot = ({ step }) => (
  <div className="flex items-center gap-3">
    <span className={`size-3 shrink-0 rounded-full ${step.isCurrent ? "bg-sunset" : "border-2 border-line-strong bg-ink"}`} />
    <span className="h-px flex-1 bg-line" aria-hidden="true" />
  </div>
);

const Step = ({ step, index, top, onOpen }) => (
  <li className="flex w-[78vw] max-w-[26rem] shrink-0 flex-col gap-4 sm:w-[24rem]">
    {top}
    <button
      type="button"
      onClick={() => onOpen(step)}
      className={`card group flex min-h-48 flex-col gap-3 rounded-3xl p-7 text-left transition-transform duration-500 hover:-translate-y-1 sm:min-h-52 ${step.isCurrent ? "ring-1 ring-accent/40" : ""}`}
    >
      <span className="flex items-center justify-between text-sm font-medium text-muted">
        <span>
          {String(index + 1).padStart(2, "0")} · {step.isCurrent ? "Now" : step.label}
        </span>
        {step.years && <span>{step.years}</span>}
      </span>
      <span className={`text-3xl leading-tight font-semibold tracking-tight text-balance ${step.isCurrent ? "text-sunset" : ""}`}>{step.title}</span>
      <span className="mt-auto flex items-center gap-1.5 text-muted transition-colors group-hover:text-fg">
        {step.subtitle}
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </button>
  </li>
);

// the stretch of road above each title: a stone pad marks the spot where Link stops, and it lights up while he stands
// on it, so it's always clear which chest is opening
const ChestSlot = ({ isOpen, isFinal, isActive }) => (
  <div className="relative h-[var(--band)]">
    <span
      className={`absolute bottom-[calc(var(--feet)-8px)] left-2 h-3 w-[calc(var(--link-w)+4.5rem)] rounded-[50%] transition-[background-color,box-shadow,opacity] duration-500 ${
        isActive ? "bg-[#ffd84a]/70 shadow-[0_0_24px_8px_#ffb03a80]" : "bg-black/25 opacity-70"
      }`}
      aria-hidden="true"
    />
    {isActive && (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pointer-events-none absolute bottom-[var(--feet)] left-2 h-[85%] w-[calc(var(--link-w)+4.5rem)] bg-[linear-gradient(to_top,#ffd84a40,transparent)] [clip-path:polygon(20%_0,80%_0,100%_100%,0_100%)]"
        aria-hidden="true"
      />
    )}
    <div className="absolute bottom-[var(--feet)] left-[calc(1.25rem+var(--link-w)+4px)]">
      <Chest isOpen={isOpen} isFinal={isFinal} />
    </div>
  </div>
);

// how far along the trip is: one pip per chest, filled once opened, the one he stands at glowing
const ChestCount = ({ count, opened, active }) => (
  <div className="flex shrink-0 flex-col items-end gap-2" aria-label={`${opened} of ${count} chests opened`}>
    <p className="font-pixel text-xs tracking-[0.2em] text-muted tabular-nums">
      CHEST {String(Math.max(1, opened)).padStart(2, "0")}/{String(count).padStart(2, "0")}
    </p>
    <div className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`size-2.5 rotate-45 transition-colors duration-500 ${index < opened ? "bg-[#ffd84a]" : "bg-line-strong"} ${index === active ? "shadow-[0_0_10px_2px_#ffb03a]" : ""}`}
        />
      ))}
    </div>
  </div>
);

const Heading = () => (
  <p className="max-w-md text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
    Every title I've held, <span className="text-muted">from the first line of code to the org chart.</span>
  </p>
);

// the gutter the track keeps on both sides and how wide one title is, so Link can find the first and last stop
const TRACK_GUTTER = "max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))";
const SCENE_VARS = "[--band:clamp(150px,28svh,240px)] [--feet:27px] [--step:min(78vw,26rem)] sm:[--step:24rem]";

// a click on a title sends Link walking up into it first, then the page follows him to the chapter
const useEnterChapter = () => {
  const [isEntering, setIsEntering] = useState(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const enter = (step) => {
    if (isEntering) return;
    setIsEntering(true);
    timers.current = [setTimeout(() => scrollToSection(step.targetId), ENTER_MS), setTimeout(() => setIsEntering(false), ENTER_MS + 900)];
  };
  return { isEntering, enter };
};

// every chest gets its own stretch of scroll to stand still in, so the scene is that much longer than the slide
const STRETCH = 2.8;

const Overworld = ({ steps }) => {
  const shape = useCallback((raw) => dwellProgress(raw, steps.length), [steps.length]);
  const { sectionRef, trackRef, x, height, progress } = usePinnedTrack({ shape, stretch: STRETCH });
  const world = useOverworld(progress, steps.length);
  const { viewport, track } = useSceneSize(trackRef);
  const { isEntering, enter } = useEnterChapter();
  const scale = useMediaQuery("(min-width: 640px)") ? 3 : 2;
  const holding = world.isAt && !world.isWalking && !isEntering ? steps[world.index] : null;
  const isFinal = world.index === steps.length - 1;

  return (
    <div id="career-timeline" ref={sectionRef} style={{ height }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 overflow-hidden pt-14">
        <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-6 px-4 sm:px-6">
          <Heading />
          <ChestCount count={steps.length} opened={world.opened} active={world.isAt ? world.index : -1} />
        </div>
        <div className={`relative ${SCENE_VARS}`} style={{ "--gutter": TRACK_GUTTER, "--link-w": `${LINK.cell.width * scale}px` }}>
          <div className="absolute inset-x-0 top-0 h-[var(--band)]">
            <Landscape trackX={x} viewport={viewport} track={track} />
            <Dialog step={holding} />
            <Walker progress={progress} world={world} scale={scale} isEntering={isEntering} isFinal={isFinal} />
          </div>
          <motion.ol ref={trackRef} style={{ x }} className="relative flex w-max gap-6 px-[max(1rem,calc((100vw-72rem)/2+1.5rem))]">
            {steps.map((step, index) => (
              <Step
                key={step.key}
                step={step}
                index={index}
                onOpen={enter}
                top={<ChestSlot isOpen={index < world.opened} isFinal={index === steps.length - 1} isActive={world.isAt && world.index === index} />}
              />
            ))}
          </motion.ol>
        </div>
      </div>
    </div>
  );
};

const openChapter = (step) => scrollToSection(step.targetId);

/**
 * The career as Link's overworld: the scene pins while the row of titles slides past, and scrolling walks him from
 * the coast where it started to the offices where it is now, opening a chest at every title. Each title still jumps
 * to the chapter that tells it. Anyone who asked for less movement gets the plain row.
 * @param {{ projects: object[] }} props
 */
const Timeline = ({ projects }) => {
  const steps = careerSteps(projects);
  const prefersReducedMotion = useReducedMotion();

  if (!prefersReducedMotion) return <Overworld steps={steps} />;

  return (
    <div id="career-timeline" className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-12 sm:px-6">
      <Heading />
      <ol className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
        {steps.map((step, index) => (
          <Step key={step.key} step={step} index={index} onOpen={openChapter} top={<Dot step={step} />} />
        ))}
      </ol>
    </div>
  );
};

export default Timeline;
