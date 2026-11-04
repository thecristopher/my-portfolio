import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import SectionHeading, { Sunset } from "../../components/SectionHeading";
import TechIcon from "../../components/TechIcon";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Trigger as MillenniumPuzzle } from "../../components/Relics/DarkMagician";
import { useScrollRange } from "../../hooks/useScrollRange";
import { useGetAboutQuery } from "../../api/aboutApi";
import { markMainStack } from "../../actions";
import { MAGIC_BLUE, MAGIC_PINK, useMagicBuff } from "../../lib/magic";
import { easeOutExpo } from "../../lib/motion";
import { echo } from "../../lib/echo";
import { pointOnCircle } from "../../lib/geometry";
import { scrollToSection } from "../../lib/smoothScroll";
import { pickTech, usePickedTech } from "../../lib/stackFilter";
import { MAX_LEVEL, groupByCategory, levelDots, orbitLayout } from "./actions";

// a tool in the grid filters the work history for it, then takes you there to see which jobs light up
const showJobsUsing = (tool) => {
  pickTech(tool);
  echo(`Showing the jobs that shipped with ${tool}`, "success");
  scrollToSection("work");
};

const BUFFED_DOT = { backgroundImage: `linear-gradient(135deg, ${MAGIC_PINK}, ${MAGIC_BLUE})`, boxShadow: `0 0 6px ${MAGIC_PINK}` };

const RING_SIZES = ["52%", "77%", "100%"];

// one tool on its ring: its logo in a round chip that stays upright while the ring turns under it. the name shows in
// the core, so the rings never crowd
const Satellite = ({ tool, counterTurn, isPicked, onFocus }) => {
  const spot = pointOnCircle(tool.angle, 50, { x: 50, y: 50 });
  return (
    <motion.button
      type="button"
      onClick={() => showJobsUsing(tool.name)}
      onPointerEnter={() => onFocus(tool)}
      onFocus={() => onFocus(tool)}
      aria-label={`${tool.name}, level ${tool.level} of ${MAX_LEVEL}. See the jobs that shipped with it`}
      style={{ left: `${spot.x}%`, top: `${spot.y}%`, rotate: counterTurn }}
      className={`card absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[scale,box-shadow] duration-300 hover:z-10 hover:scale-125 focus-visible:scale-125 sm:size-12 ${isPicked ? "ring-2 ring-accent" : ""}`}
    >
      <TechIcon tech={tool.name} className="size-4 sm:size-6" fallback={<span className="text-xs font-semibold">{tool.name.slice(0, 2)}</span>} />
    </motion.button>
  );
};

const Ring = ({ ring, progress, pickedTech, onFocus }) => {
  const direction = ring.ring % 2 === 0 ? 1 : -1;
  const turn = useScrollRange(progress, [0, 1], [-40 * direction, 50 * direction]);
  const counterTurn = useTransform(turn, (degrees) => -degrees);
  return (
    <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line-strong" style={{ width: RING_SIZES[ring.ring], height: RING_SIZES[ring.ring], rotate: turn }}>
      {ring.tools.map((tool) => (
        <Satellite key={tool.name} tool={tool} counterTurn={counterTurn} isPicked={pickedTech === tool.name} onFocus={onFocus} />
      ))}
    </motion.div>
  );
};

// the middle of the orbit names whatever tool the cursor is on, or counts them all
const Core = ({ focused, total }) => (
  <div className="absolute top-1/2 left-1/2 flex w-[36%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center">
    <AnimatePresence mode="wait">
      <motion.div
        key={focused?.name ?? "all"}
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        transition={{ duration: 0.35, ease: easeOutExpo }}
        className="flex flex-col items-center gap-2"
      >
        {focused ? (
          <>
            <TechIcon tech={focused.name} className="size-9 sm:size-12" fallback={null} />
            <p className="text-lg leading-tight font-semibold tracking-tight sm:text-2xl">{focused.name}</p>
            <LevelMeter level={focused.level} />
          </>
        ) : (
          <>
            <p className="text-sunset text-5xl leading-none font-semibold tracking-tight sm:text-7xl">{total}</p>
            <p className="hidden text-sm text-muted sm:block">tools in orbit. The deeper I've gone, the closer in. Hover one.</p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
);

// every tool around a core, by how deep I've gone: the rings turn against each other as the section scrolls by
const Orbit = ({ tools, pickedTech }) => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 1.4, ease: easeOutExpo }}
      onPointerLeave={() => setFocused(null)}
      className="relative mx-auto aspect-square w-full max-w-[44rem]"
    >
      <span className="bg-sunset absolute top-1/2 left-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl" aria-hidden="true" />
      {orbitLayout(tools).map((ring) => (
        <Ring key={ring.ring} ring={ring} progress={scrollYProgress} pickedTech={pickedTech} onFocus={setFocused} />
      ))}
      <Core focused={focused} total={tools.length} />
    </motion.div>
  );
};

const LevelMeter = ({ level, isBuffed }) => (
  <span className="flex gap-1" aria-label={`${level} out of ${MAX_LEVEL}`}>
    {levelDots(level).map((isLit, index) => (
      <span key={index} className={`size-1.5 rounded-full ${isLit ? "bg-fg" : "bg-line-strong"}`} style={isLit && isBuffed ? BUFFED_DOT : undefined} />
    ))}
  </span>
);

const CategoryCard = ({ group, index, isBuffed, pickedTech }) => (
  <motion.li
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 1, delay: (index % 3) * 0.08, ease: easeOutExpo }}
    className="card flex flex-col gap-5 rounded-3xl p-7"
  >
    <p className="text-xl font-semibold tracking-tight">{group.category}</p>
    <ul className="flex flex-col">
      {group.tools.map((tool) => (
        <li key={tool.name}>
          <button
            type="button"
            onClick={() => showJobsUsing(tool.name)}
            title={`See the jobs that shipped with ${tool.name}`}
            className={`flex w-full items-center gap-3 border-t border-line py-2.5 text-left transition-colors hover:text-accent ${pickedTech === tool.name ? "text-accent" : ""}`}
          >
            <TechIcon tech={tool.name} className="size-4" fallback={<span className="size-4 shrink-0" />} />
            <span className={`flex-1 truncate ${tool.isMain ? "font-semibold" : "text-muted"}`}>{tool.name}</span>
            <LevelMeter level={tool.level} isBuffed={isBuffed} />
          </button>
        </li>
      ))}
    </ul>
  </motion.li>
);

/** Every tool I've shipped with: the main stack sliding past in two rows, then each category graded honestly. */
const Skills = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const isBuffed = useMagicBuff();
  const pickedTech = usePickedTech();
  const tools = about ? markMainStack(about.skill_levels, about.main_stack ?? []) : [];

  return (
    <section id="skills" className="relative overflow-hidden py-28 sm:py-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeading
          eyebrow="Skills"
          title={
            <>
              The tools, <Sunset>graded honestly.</Sunset>
            </>
          }
          lead="Everything I've shipped with, grouped the way the résumé groups it. Pick a tool and the jobs that used it light up."
        />
        {isLoading && <SkeletonLines lines={4} />}
        {isError && !about && <LoadError what="the skills" />}
      </div>

      {tools.length > 0 && (
        <div className="px-4 py-20 sm:px-6">
          <Orbit tools={tools} pickedTech={pickedTech} />
        </div>
      )}

      {about && (
        <div id="skill-grid" className="mx-auto flex max-w-6xl scroll-mt-24 flex-col gap-6 px-4 sm:px-6">
          <p className="flex items-center gap-3 text-sm text-muted">
            <span className="font-semibold text-fg">Bold</span> is the main stack, dots are how deep I've gone.
            {/* the Millennium Puzzle keeps watch over the grades she buffs */}
            <MillenniumPuzzle zoom={0.42} />
          </p>
          <ul className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupByCategory(tools).map((group, index) => (
              <CategoryCard key={group.category} group={group} index={index} isBuffed={isBuffed} pickedTech={pickedTech} />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default Skills;
