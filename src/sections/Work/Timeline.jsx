import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Trigger as PokeBall } from "../../components/Relics/Pokemon";
import { usePinnedTrack } from "../../hooks/usePinnedTrack";
import { scrollToSection } from "../../lib/smoothScroll";
import { careerSteps } from "./actions";

const Step = ({ step, index }) => (
  <li className="flex w-[78vw] max-w-[26rem] shrink-0 flex-col gap-6 sm:w-[24rem]">
    <div className="flex items-center gap-3">
      <span className={`size-3 shrink-0 rounded-full ${step.isCurrent ? "bg-sunset" : "border-2 border-line-strong bg-ink"}`} />
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
    <button
      type="button"
      onClick={() => scrollToSection(step.targetId)}
      className={`card group flex min-h-56 flex-col gap-3 rounded-3xl p-7 text-left transition-transform duration-500 hover:-translate-y-1 ${step.isCurrent ? "ring-1 ring-accent/40" : ""}`}
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

const Heading = () => (
  <div className="flex items-end justify-between gap-6">
    <p className="max-w-md text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
      Every title I've held, <span className="text-muted">from the first line of code to the org chart.</span>
    </p>
    {/* every title on the timeline is an evolution, so the ball waits where it starts */}
    <PokeBall zoom={0.42} />
  </div>
);

/**
 * The career as one row of titles, oldest to newest. The scene pins while the row slides past, so scrolling down walks
 * the career forward. Each title jumps to the chapter that tells it.
 * @param {{ projects: object[] }} props
 */
const Timeline = ({ projects }) => {
  const steps = careerSteps(projects);
  const { sectionRef, trackRef, x, height } = usePinnedTrack();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div id="career-timeline" className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <Heading />
        <ol className="no-scrollbar flex gap-6 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <Step key={step.key} step={step} index={index} />
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div id="career-timeline" ref={sectionRef} style={{ height }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-12 overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <Heading />
        </div>
        <motion.ol ref={trackRef} style={{ x }} className="flex w-max gap-6 px-[max(1rem,calc((100vw-72rem)/2+1.5rem))]">
          {steps.map((step, index) => (
            <Step key={step.key} step={step} index={index} />
          ))}
        </motion.ol>
      </div>
    </div>
  );
};

export default Timeline;
