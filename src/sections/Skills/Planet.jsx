import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import TechIcon from "../../components/TechIcon";
import { brandColorFor } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import Encounter from "./Encounter";
import LevelMeter from "./LevelMeter";
import { jobsLine, levelLine } from "./actions";

// the card waits for the camera to get close before it grows out of the satellite
const ARRIVES_AFTER = 0.35;

// keeps Tab inside the card while it's open, the orbit behind it is out of reach anyway
const keepFocusInside = (event, dialog) => {
  if (event.key !== "Tab" || !dialog) return;
  const focusable = dialog.querySelectorAll("button, a[href]");
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

// Escape flies back out, wherever focus is
const useEscape = (onClose) => {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);
};

// a ring around the planet tipped toward you: the back half sits behind the planet, the front half crosses over it
const PlanetRing = ({ half, isStill }) => (
  <motion.span
    className={`absolute top-1/2 left-1/2 size-[170%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-sunset-1/70 ${half === "front" ? "z-10 [clip-path:inset(50%_0_0_0)]" : "[clip-path:inset(0_0_50%_0)]"}`}
    style={{ rotateX: 74 }}
    animate={isStill ? undefined : { rotateZ: 360 }}
    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
    aria-hidden="true"
  />
);

// the tool as a planet in its brand color, with the satellite's chip at its heart
const Sphere = ({ tool, ref }) => {
  const prefersReducedMotion = useReducedMotion();
  const color = brandColorFor(tool.name) ?? "var(--color-sunset-2)";
  return (
    <div ref={ref} className="relative grid size-20 shrink-0 place-items-center sm:size-40">
      <PlanetRing half="back" isStill={prefersReducedMotion} />
      <span
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${color} 35%, white) 0%, ${color} 38%, color-mix(in oklab, ${color} 35%, black) 100%)`,
          boxShadow: `0 0 60px 6px color-mix(in oklab, ${color} 45%, transparent), inset -14px -18px 40px rgba(0, 0, 0, 0.45)`,
        }}
        aria-hidden="true"
      />
      <span className="card relative grid size-10 place-items-center rounded-full sm:size-16">
        <TechIcon tech={tool.name} className="size-5 sm:size-8" fallback={<span className="text-sm font-semibold">{tool.name.slice(0, 2)}</span>} />
      </span>
      <PlanetRing half="front" isStill={prefersReducedMotion} />
    </div>
  );
};

const Details = ({ tool, jobs, total }) => (
  <div className="flex flex-col items-start gap-2 text-left sm:gap-3">
    <p className="text-xs font-semibold tracking-wide text-accent uppercase">Planet</p>
    <h3 id={`planet-${tool.name}`} className="text-2xl leading-none font-semibold tracking-tight sm:text-4xl">
      {tool.name}
    </h3>
    <p className="flex items-center gap-2 text-sm text-muted">
      <LevelMeter level={tool.level} className="size-8" />
      {levelLine(tool.level, tool.isMain)}
    </p>
    {total > 0 && <p className="text-sm text-muted">{jobsLine(jobs.length, total)}</p>}
    {jobs.length > 0 && (
      <ul className="flex flex-wrap gap-1.5" aria-label="Where it shipped">
        {jobs.map((job) => (
          <li key={job} className="rounded-full bg-raised px-3 py-1 text-xs font-medium">
            {job}
          </li>
        ))}
      </ul>
    )}
  </div>
);

/**
 * A tool opened up as a planet once the camera has dived into it: its level, the jobs that shipped with it and the way
 * to go see them. Grows out of the satellite it came from, and shrinks back into it on the way out. When the Metroid
 * larva was hiding behind the tool, Samus's fight with it plays out around the card.
 * @param {{ tool: object, origin: { x: number, y: number }, jobs: string[], total: number, encounter: object | null, onClose: () => void, onSeeJobs: () => void }} props
 *   origin is where the satellite sat, in px from the orbit's center, encounter how the larva fared, null when it
 *   wasn't there
 */
const Planet = ({ tool, origin, jobs, total, encounter, onClose, onSeeJobs }) => {
  const dialog = useRef(null);
  const sphere = useRef(null);
  useEscape(onClose);
  useEffect(() => dialog.current?.focus(), []);
  const fromSatellite = { x: origin.x, y: origin.y, scale: 0.08, opacity: 0 };

  return (
    <div className="absolute inset-0 z-30 grid place-items-center" onClick={onClose}>
      <motion.div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`planet-${tool.name}`}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => keepFocusInside(event, dialog.current)}
        initial={fromSatellite}
        animate={{ x: 0, y: 0, scale: 1, opacity: 1, transition: { duration: 0.8, delay: ARRIVES_AFTER, ease: easeOutExpo } }}
        exit={{ ...fromSatellite, transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
        // side by side on every screen, so on a phone the card still fits inside the orbit it grew out of
        className="card relative flex w-[min(100%,30rem)] flex-row items-center gap-4 rounded-[2rem] p-5 shadow-2xl outline-none sm:gap-6 sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to the orbit"
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
        >
          <X size={16} aria-hidden="true" />
        </button>
        <Sphere tool={tool} ref={sphere} />
        <div className="flex min-w-0 flex-col items-start gap-4 sm:gap-5">
          <Details tool={tool} jobs={jobs} total={total} />
          <button
            type="button"
            onClick={onSeeJobs}
            disabled={jobs.length === 0}
            className="bg-sunset group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
          >
            See these jobs
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>
        </div>
        {encounter && <Encounter encounter={encounter} cardRef={dialog} sphereRef={sphere} />}
      </motion.div>
    </div>
  );
};

export default Planet;
