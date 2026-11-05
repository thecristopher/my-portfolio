import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import TechIcon from "../../components/TechIcon";
import { GITHUB_USER } from "../../api/githubApi";
import { brandColorFor, repoLanguages, slugify } from "../../actions";
import { usePinnedTrack } from "../../hooks/usePinnedTrack";
import { cartridgeTurn, lastPushed } from "./actions";

const languageColor = (language) => brandColorFor(language ?? "") ?? "var(--color-accent)";

// pulled out on hover or keyboard focus, and always out on touch screens where there is no hover to ask for it
const PULLED_OUT = "group-hover:-translate-y-14 group-focus-visible:-translate-y-14";
const SHOWN_WHEN_PULLED = "max-h-0 opacity-0 group-hover:max-h-56 group-hover:opacity-100 group-focus-visible:max-h-56 group-focus-visible:opacity-100 [@media(hover:none)]:max-h-56 [@media(hover:none)]:opacity-100";

const Meta = ({ repo }) => (
  <dl className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-white/70">
    {repoLanguages(repo).map((language) => (
      <div key={language} className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: languageColor(language) }} aria-hidden="true" />
        <dd>{language}</dd>
      </div>
    ))}
    <div className="flex items-center gap-1">
      <Star size={11} aria-label="Stars" />
      <dd className="tabular-nums">{repo.stars}</dd>
    </div>
    <div className="flex items-center gap-1">
      <GitFork size={11} aria-label="Forks" />
      <dd className="tabular-nums">{repo.forks}</dd>
    </div>
    <dd className="text-white/45">Updated {lastPushed(repo.pushed_at)}</dd>
  </dl>
);

// the sticker on the front of the cartridge: the repo's language color, its logo and its name, and the pitch that
// unfolds under them once it's pulled out
const Label = ({ repo, index, color, language }) => (
  <div className="relative overflow-hidden rounded-xl p-4 ring-1 ring-black/20" style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${color} 70%, #1b1b20), #141418 78%)` }}>
    <span className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full opacity-40 blur-2xl" style={{ background: color }} aria-hidden="true" />
    <span className="relative flex items-center justify-between text-[11px] font-semibold tracking-widest text-white/60">
      {String(index + 1).padStart(2, "0")}
      <ArrowUpRight size={15} className="text-white/50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
    </span>
    {language && <TechIcon tech={language} className="relative my-4 size-10 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />}
    <h3 className="relative text-xl leading-tight font-semibold tracking-tight break-words text-white">{repo.name}</h3>
    <div className={`relative overflow-hidden transition-[max-height,opacity] duration-500 ease-[var(--ease-out-expo)] motion-reduce:transition-none ${SHOWN_WHEN_PULLED}`}>
      <p className="pt-3 text-sm leading-relaxed text-white/80 text-pretty">{repo.pitch}</p>
      <div className="pt-3">
        <Meta repo={repo} />
      </div>
    </div>
  </div>
);

// the grooves along the top of the shell, where a thumb grips it to pull it out
const Grip = () => (
  <span className="mx-auto mb-3 block h-3 w-[70%] rounded-sm bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.28)_0_3px,transparent_3px_7px)]" aria-hidden="true" />
);

// the gold contacts at the bottom, hidden in the slot until the cartridge comes out
const Contacts = () => (
  <span className="mx-auto mt-3 block h-5 w-[78%] rounded-b-sm bg-[repeating-linear-gradient(90deg,#c9a43c_0_4px,#7a5d18_4px_7px)] opacity-90" aria-hidden="true" />
);

// where the cartridge sits along the row before it slides, measured once it's laid out and again on resize
const useSlot = () => {
  const ref = useRef(null);
  const [slot, setSlot] = useState({ center: 0, viewport: 0 });
  useLayoutEffect(() => {
    const measure = () => setSlot({ center: ref.current.offsetLeft + ref.current.offsetWidth / 2, viewport: window.innerWidth });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return [ref, slot];
};

// one repo as a cartridge standing in the shelf. it turns to face you as it crosses the middle of the screen
const Cartridge = ({ repo, index, trackX, isStill }) => {
  const [language] = repoLanguages(repo);
  const color = languageColor(language);
  const [ref, slot] = useSlot();
  const turn = useTransform(trackX, (x) => cartridgeTurn(slot.center + x, slot.viewport));

  return (
    <motion.li ref={ref} id={`repo-${slugify(repo.name)}`} style={isStill ? undefined : { rotateY: turn, transformPerspective: 1000 }} className="w-[70vw] max-w-[16rem] shrink-0 sm:w-[16rem]">
      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className={`group block rounded-t-[1.4rem] rounded-b-md bg-gradient-to-b from-[#d9d9de] to-[#a9a9b2] px-3 pt-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.6)] ring-1 ring-black/10 transition-transform duration-500 ease-[var(--ease-out-expo)] outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none dark:from-[#34343a] dark:to-[#1d1d21] dark:ring-white/10 ${PULLED_OUT}`}
      >
        <Grip />
        <Label repo={repo} index={index} color={color} language={language} />
        <Contacts />
      </a>
    </motion.li>
  );
};

// the last slot on the shelf, empty, with the way to everything else
const ShelfEnd = () => (
  <li className="flex w-[64vw] max-w-[16rem] shrink-0 flex-col items-start justify-center gap-3 self-center pb-16 sm:w-[16rem]">
    <p className="text-2xl font-semibold tracking-tight">More on GitHub.</p>
    <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="group flex items-center gap-1 text-accent">
      github.com/{GITHUB_USER}
      <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  </li>
);

// the front lip of the shelf, laid over the bottom of every cartridge so they read as slotted in
const Plank = () => (
  <div className="pointer-events-none absolute inset-x-0 -bottom-12 z-10 h-20" aria-hidden="true">
    <div className="h-full bg-gradient-to-b from-[#a0714a] via-[#7d5434] to-[#5a3a22] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] dark:from-[#5c3d26] dark:via-[#432b1a] dark:to-[#2a1a0e]" />
    <span className="absolute inset-x-0 top-0 h-px bg-white/25" />
  </div>
);

// a warm pool of light over the shelf, so the row reads as lit furniture instead of floating in an empty screen
const ShelfLight = () => (
  <div
    className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_100%,color-mix(in_oklab,var(--color-sunset-1)_16%,transparent),transparent_70%)]"
    aria-hidden="true"
  />
);

const Caption = () => (
  <p className="mx-auto w-full max-w-6xl px-4 text-sm font-semibold text-muted sm:px-6">The rest of the shelf. Pull one out.</p>
);

/**
 * The public repos as cartridges on a shelf. The scene pins while the shelf slides past, each cartridge turning to
 * face you as it reaches the middle, and hovering or focusing one pulls it out to show its pitch.
 * @param {{ repos: object[] }} props
 */
const Shelf = ({ repos }) => {
  const { sectionRef, trackRef, x, height } = usePinnedTrack();
  const prefersReducedMotion = useReducedMotion();
  const cartridges = repos.map((repo, index) => (
    <Cartridge key={repo.name} repo={repo} index={index} trackX={x} isStill={prefersReducedMotion} />
  ));

  if (prefersReducedMotion) {
    return (
      <div className="flex flex-col gap-8 pt-16">
        <Caption />
        <div className="relative">
          <ul className="no-scrollbar mx-auto flex max-w-6xl items-end gap-6 overflow-x-auto px-4 pt-16 sm:px-6">
            {cartridges}
            <ShelfEnd />
          </ul>
          <Plank />
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} style={{ height }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-8 overflow-hidden">
        <Caption />
        <div className="relative">
          <ShelfLight />
          <motion.ul ref={trackRef} style={{ x }} className="flex w-max items-end gap-8 px-[max(1rem,calc((100vw-72rem)/2+1.5rem))] pt-20">
            {cartridges}
            <ShelfEnd />
          </motion.ul>
          <Plank />
        </div>
      </div>
    </div>
  );
};

export default Shelf;
