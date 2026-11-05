import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Braces, Brain, Cloud, Database, LayoutTemplate, Server, Shapes, Star } from "lucide-react";
import SpotlightCard from "../../components/SpotlightCard";
import TechIcon from "../../components/TechIcon";
import { brandColorFor, slugify, usesTech } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { pickTech } from "../../lib/stackFilter";
import { scrollToSection } from "../../lib/smoothScroll";
import { MAX_LEVEL, categoryStats, rarityOf, foilColors, jobAnchor, jobsLine, jobsWith, levelDots, levelLine } from "./actions";

const CATEGORY_ICONS = {
  Languages: Braces,
  Frontend: LayoutTemplate,
  Backend: Server,
  "Cloud & DevOps": Cloud,
  Data: Database,
  AI: Brain,
};

const FLIP = { duration: 0.8, ease: easeOutExpo };

// a picked company lights its jobs in the work history and takes you to that exact chapter, never just the top of it
const seeJob = (company, tool) => {
  pickTech(tool);
  scrollToSection(jobAnchor(company, slugify));
};

const colorOf = (name) => brandColorFor(name) ?? "var(--color-fg)";

// five segments filled in the tool's own color, sweeping in from the left the first time the card shows up
const LevelBar = ({ level, color }) => (
  <span className="flex shrink-0 gap-1" role="img" aria-label={`${level} out of ${MAX_LEVEL}`}>
    {levelDots(level).map((isLit, index) => (
      <motion.span
        key={index}
        initial={{ scaleY: 0.3, opacity: 0.4 }}
        whileInView={{ scaleY: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 + index * 0.06, ease: easeOutExpo }}
        className="h-3.5 w-1.5 rounded-full"
        style={{ background: isLit ? color : "var(--color-line-strong)", boxShadow: isLit ? `0 0 10px -2px ${color}` : undefined }}
      />
    ))}
  </span>
);

// the strip of holographic foil on top of the card, sliding its sheen after the cursor like a rare trading card
const Foil = ({ colors, category, number, stats }) => {
  const Icon = CATEGORY_ICONS[category] ?? Shapes;
  return (
  <div className="relative h-28 overflow-hidden rounded-t-[1.75rem]" aria-hidden="true">
    <span className="absolute inset-0" style={{ background: `conic-gradient(from 210deg at 30% 120%, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[0]})` }} />
    <span className="absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover/card:opacity-100 [background:linear-gradient(115deg,transparent_20%,rgb(255_255_255/0.7)_var(--spot-x,45%),transparent_70%)]" />
    <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.07)_0_1px,transparent_1px_6px)]" />
    <Icon className="absolute -right-4 -bottom-6 size-32 text-white/25" strokeWidth={1.25} />
    <span className="absolute top-4 left-5 rounded-full bg-black/30 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-[0.18em] text-white backdrop-blur">
      No. {String(number).padStart(2, "0")}
    </span>
    <span className="absolute bottom-4 left-5 flex items-baseline gap-1.5 text-white drop-shadow">
      <span className="text-4xl leading-none font-semibold tracking-tight tabular-nums">{stats.average.toFixed(1)}</span>
      <span className="text-xs font-medium text-white/80">avg depth</span>
    </span>
  </div>
  );
};

const ToolRow = ({ tool, isPicked, onOpen, buttonRef }) => {
  const color = colorOf(tool.name);
  return (
    <li>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpen(tool)}
        title={`Turn the card over to see where ${tool.name} shipped`}
        className={`group/tool flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition-colors hover:bg-raised focus-visible:bg-raised focus-visible:outline-none ${isPicked ? "bg-accent-soft" : ""}`}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 16%, transparent)` }}>
          <TechIcon tech={tool.name} className="size-[18px]" fallback={<span className="text-xs font-semibold">{tool.name.slice(0, 2)}</span>} />
        </span>
        <span className={`flex min-w-0 flex-1 items-center gap-1.5 truncate ${tool.isMain ? "font-semibold" : "text-muted"}`}>
          {tool.name}
          {tool.isMain && <Star size={12} className="shrink-0 fill-current text-accent" aria-label="main stack" />}
        </span>
        <LevelBar level={tool.level} color={color} />
        <ArrowRight size={14} className="-ml-1 shrink-0 text-faint opacity-0 transition-[opacity,translate] group-hover/tool:translate-x-0.5 group-hover/tool:opacity-100" aria-hidden="true" />
      </button>
    </li>
  );
};

const Front = ({ group, number, colors, pickedTech, onOpen, toolRefs, isHidden }) => {
  const stats = categoryStats(group);
  const tier = rarityOf(stats.average);
  return (
    <div inert={isHidden} className="flex flex-col [grid-area:1/1] [backface-visibility:hidden]">
      <Foil colors={colors} category={group.category} number={number} stats={stats} />
      <div className="flex flex-col gap-1 px-6 pt-5 pb-3">
        <p className="text-2xl font-semibold tracking-tight">{group.category}</p>
        <p className="text-sm text-muted">
          {stats.count} {stats.count === 1 ? "tool" : "tools"}
          {stats.mastered > 0 && ` · ${stats.mastered} at max level`}
        </p>
      </div>
      <ul className="flex flex-col px-3.5 pb-4">
        {group.tools.map((tool) => (
          <ToolRow key={tool.name} tool={tool} isPicked={pickedTech === tool.name} onOpen={onOpen} buttonRef={(node) => (toolRefs.current[tool.name] = node)} />
        ))}
      </ul>
      <div className="mt-auto flex items-center justify-between border-t border-line px-6 py-3.5 text-xs">
        <span className="flex items-center gap-2 font-semibold tracking-wide uppercase">
          <span className="size-2.5 rotate-45 rounded-[2px]" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[2]})` }} aria-hidden="true" />
          {tier}
        </span>
        <span className="text-faint">Pick a tool to flip</span>
      </div>
    </div>
  );
};

// the other side of the card: one tool up close, and every job it shipped at as a door to that job
const Back = ({ tool, projects, onClose, backRef, isHidden }) => {
  const color = colorOf(tool?.name);
  const jobs = tool ? jobsWith(projects, usesTech, tool.name) : [];
  return (
    <div
      inert={isHidden}
      className="relative flex flex-col gap-5 overflow-hidden rounded-[1.75rem] p-6 [grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)]"
    >
      <span className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-40 blur-3xl" style={{ background: color }} aria-hidden="true" />
      <button
        ref={backRef}
        type="button"
        onClick={onClose}
        className="relative flex w-fit items-center gap-1.5 rounded-full bg-raised px-3 py-1.5 text-xs font-medium transition-colors hover:bg-line-strong"
      >
        <ArrowLeft size={13} aria-hidden="true" /> Back to the card
      </button>
      {tool && (
        <>
          <div className="relative flex items-center gap-4">
            <span
              className="grid size-20 shrink-0 place-items-center rounded-3xl"
              style={{ background: `radial-gradient(circle at 30% 25%, color-mix(in oklab, ${color} 45%, transparent), color-mix(in oklab, ${color} 12%, transparent))`, boxShadow: `0 18px 50px -18px ${color}` }}
            >
              <TechIcon tech={tool.name} className="size-10" fallback={<span className="text-xl font-semibold">{tool.name.slice(0, 2)}</span>} />
            </span>
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="truncate text-3xl leading-none font-semibold tracking-tight">{tool.name}</p>
              <LevelBar level={tool.level} color={color} />
            </div>
          </div>
          <div className="relative flex flex-col gap-1 text-sm">
            <p className="font-medium">{levelLine(tool.level, tool.isMain)}</p>
            <p className="text-muted">{jobsLine(jobs.length, projects.length)}</p>
          </div>
          {jobs.length > 0 && (
            <div className="relative flex flex-col gap-2">
              <p className="text-xs font-semibold tracking-wide text-faint uppercase">Take me to the job</p>
              <ul className="flex flex-col gap-1.5">
                {jobs.map((company) => (
                  <li key={company}>
                    <button
                      type="button"
                      onClick={() => seeJob(company, tool.name)}
                      className="group/job flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2.5 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-raised"
                    >
                      {company}
                      <ArrowRight size={14} className="text-faint transition-transform group-hover/job:translate-x-0.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// focus follows the flip: onto the way back when the card turns over, back onto the tool once it turns home
const useFlipFocus = (tool, backRef, toolRefs) => {
  const lastTool = useRef(null);
  useEffect(() => {
    if (tool) {
      lastTool.current = tool.name;
      backRef.current?.focus({ preventScroll: true });
      return;
    }
    if (!lastTool.current) return;
    toolRefs.current[lastTool.current]?.focus({ preventScroll: true });
    lastTool.current = null;
  }, [tool, backRef, toolRefs]);
};

/**
 * One category as a collectible card: a strip of foil in its tools' brand colors, the tools with their levels, and a
 * click on any of them turns the card over to show where that tool shipped. Nothing moves the page until a job is
 * picked on the back.
 * @param {{ group: { category: string, tools: object[] }, index: number, projects: object[], pickedTech: string | null }} props
 */
const SkillCard = ({ group, index, projects, pickedTech }) => {
  const [tool, setTool] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const backRef = useRef(null);
  const toolRefs = useRef({});
  useFlipFocus(tool, backRef, toolRefs);
  const colors = foilColors(group.tools, brandColorFor);
  const close = () => setTool(null);

  return (
    <motion.li
      initial={{ opacity: 0, y: 48, rotateX: 14 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay: (index % 3) * 0.1, ease: easeOutExpo }}
      onKeyDown={(event) => event.key === "Escape" && tool && close()}
      className="[perspective:1600px]"
    >
      <SpotlightCard
        className="group/card card h-full rounded-[1.75rem] transition-transform duration-300 [transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] hover:shadow-2xl"
        style={{ "--spot-color": colors[0] }}
      >
        <motion.div
          className="grid h-full [transform-style:preserve-3d]"
          animate={{ rotateY: tool ? 180 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : FLIP}
        >
          <Front group={group} number={index + 1} colors={colors} pickedTech={pickedTech} onOpen={setTool} toolRefs={toolRefs} isHidden={Boolean(tool)} />
          <Back tool={tool} projects={projects} onClose={close} backRef={backRef} isHidden={!tool} />
        </motion.div>
      </SpotlightCard>
    </motion.li>
  );
};

export default SkillCard;
