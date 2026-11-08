import { ArrowUpRight, Dumbbell } from "lucide-react";
import { MAIN_PROJECT } from "./actions";
import Editor from "./Editor";

// the drills it runs inside the editor, called out on their own so they never get lost in the feature list
const Practice = () => (
  <div className="relative overflow-hidden rounded-2xl p-5 ring-1 ring-glow/30" style={{ background: "linear-gradient(140deg, color-mix(in oklab, var(--color-glow) 16%, transparent), transparent 70%)" }}>
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold tracking-[0.18em] text-glow uppercase">
      <Dumbbell size={14} aria-hidden="true" />
      <span className="whitespace-nowrap">Built in:</span> <span className="whitespace-nowrap">{MAIN_PROJECT.practice.name}</span>
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

// the title, the pitch and the link out, with the drills under them unless they get a column of their own
const Pitch = ({ isWide }) => (
  <div className="relative flex flex-col gap-5">
    <p className="text-sm font-semibold text-glow">Featured project</p>
    <h3 className={`${isWide ? "text-[clamp(2rem,3.2vw,3rem)]" : "text-[clamp(2rem,4.6vw,3.6rem)]"} leading-none font-semibold tracking-[-0.045em] whitespace-nowrap`}>{MAIN_PROJECT.title}</h3>
    <p className={`${isWide ? "text-base" : "text-lg"} leading-relaxed text-stage-fg/75 text-pretty`}>{MAIN_PROJECT.pitch}</p>
    {!isWide && <Practice />}
    <span className="mt-auto flex w-fit items-center gap-1.5 text-sm font-medium text-glow">
      View on GitHub
      <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </span>
  </div>
);

/**
 * What's on the screen of whichever device is on the desk: the pitch, the drills and the editor typing out what the
 * config does. Three columns across the ultrawide, stacked on the laptop and the phone.
 * @param {{ typed: number, shape: string, isWide?: boolean }} props typed is the keystrokes so far, shape the corners
 *   and padding that fit the device's glass, isWide lays it out across an ultrawide
 */
const Screen = ({ typed, shape, isWide = false }) => (
  <a href={MAIN_PROJECT.url} target="_blank" rel="noreferrer" className={`group relative grid gap-8 overflow-hidden bg-stage text-stage-fg ${isWide ? "grid-cols-[0.95fr_0.9fr_1.35fr] grid-rows-1 items-stretch" : "grid-cols-[minmax(0,1fr)]"} ${shape}`}>
    <span className="bg-sunset pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-40" aria-hidden="true" />
    <Pitch isWide={isWide} />
    {isWide && (
      <div className="relative self-center">
        <Practice />
      </div>
    )}
    <div className="relative min-h-0 min-w-0">
      <Editor typed={typed} isFixed={isWide} />
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

export default Screen;
