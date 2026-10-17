import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight, FolderGit2, GitFork, Pause, Play, Star } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import TechIcon from "../../components/TechIcon";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Triforce } from "../../components/Secrets";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { easeOutExpo } from "../../lib/motion";
import { activeSlide, brandColorFor, easedGlow, formatIndex, slugify, wrapRange } from "../../actions";

// how long each repo holds the stage before the gallery moves on by itself
const SLIDE_MS = 6000;

const formatPushed = (pushedAt) =>
  new Date(pushedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

// a repo gets its language's color for the light behind it, or the accent when the language has none
const lightFor = (language) => brandColorFor(language ?? "") ?? "var(--color-accent)";

// one repo per tile, its language's logo set big like the product shot on an Apple tile. the whole tile opens the repo
const RepoTile = ({ repo, index, total, isActive }) => {
  const light = lightFor(repo.language);

  return (
    <a
      id={`repo-${slugify(repo.name)}`}
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      aria-roledescription="slide"
      aria-label={`${repo.name}, opens on GitHub`}
      className="group relative flex h-[min(36rem,76svh)] w-[min(86vw,36rem)] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[2rem] border border-line bg-panel p-8 transition-[opacity,border-color] duration-700 hover:border-line-strong sm:p-10"
      style={{ opacity: isActive ? 1 : 0.5 }}
    >
      <div
        className="pointer-events-none absolute -top-1/3 -right-1/3 size-[110%]"
        style={{ background: easedGlow(light, { strength: 0.3 }) }}
        aria-hidden="true"
      />

      <div className="relative flex items-start justify-between gap-6">
        <p className="flex flex-col gap-1 font-mono text-[11px] tracking-[0.2em] text-muted uppercase">
          <span className="text-accent">
            {formatIndex(index)} / {formatIndex(total - 1)}
          </span>
          <span>{repo.language ?? "repo"}</span>
        </p>
        <motion.span
          className="grid size-[clamp(6rem,14vw,9rem)] place-items-center"
          animate={isActive ? { rotate: 0, scale: 1 } : { rotate: -8, scale: 0.85 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
        >
          <TechIcon
            tech={repo.language ?? ""}
            className="size-full drop-shadow-[0_10px_30px_rgb(0_0_0/0.45)]"
            fallback={<FolderGit2 className="size-full text-muted" strokeWidth={1} aria-hidden="true" />}
          />
        </motion.span>
      </div>

      <div className="relative flex flex-col gap-5">
        <h3 className="text-gradient text-[clamp(2.25rem,5vw,3.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] [overflow-wrap:anywhere]">
          {repo.name}
        </h3>
        <p className="line-clamp-4 max-w-md leading-relaxed text-muted text-pretty">{repo.pitch}</p>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 font-mono text-xs text-faint">
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Star size={12} aria-hidden="true" /> {repo.stars}
            </span>
            <span className="flex items-center gap-1">
              <GitFork size={12} aria-hidden="true" /> {repo.forks}
            </span>
            <span>pushed {formatPushed(repo.pushed_at)}</span>
          </span>
          <span className="flex items-center gap-1 text-fg transition-colors group-hover:text-accent">
            View on GitHub
            <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </div>
    </a>
  );
};

// a dot per repo. the one on stage stretches into a pill, and while the gallery plays it fills up like a timer
const Dot = ({ name, isActive, isPlaying, onClick }) => (
  <button type="button" onClick={onClick} aria-label={`Show ${name}`} aria-current={isActive ? "true" : undefined} className="grid h-6 place-items-center">
    <motion.span
      className="relative block h-2 overflow-hidden rounded-full bg-faint/60"
      animate={{ width: isActive ? 40 : 8 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
    >
      {isActive && (
        <motion.span
          key={isPlaying ? "playing" : "paused"}
          className="absolute inset-y-0 left-0 rounded-full bg-fg"
          initial={{ width: isPlaying ? "0%" : "100%" }}
          animate={{ width: "100%" }}
          transition={{ duration: isPlaying ? SLIDE_MS / 1000 : 0, ease: "linear" }}
        />
      )}
    </motion.span>
  </button>
);

const ControlButton = ({ label, onClick, isDisabled = false, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDisabled}
    aria-label={label}
    className="grid size-11 place-items-center rounded-full bg-raised/80 text-fg backdrop-blur transition-all hover:bg-line-strong disabled:pointer-events-none disabled:opacity-30"
  >
    {children}
  </button>
);

// the side quests: whatever I build after hours, pulled live from my public GitHub. each repo gets the stage on a
// row of big tiles that plays by itself, the gallery Apple opens its product pages with. a swipe, a click or h and l
// take over from the autoplay
const GitHub = () => {
  const { data: repos = [], isLoading, isError } = useGetReposQuery();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [isPlaying, setIsPlaying] = useState(!prefersReducedMotion);
  const isInView = useInView(sectionRef, { amount: 0.5 });

  const goTo = (index) => {
    const track = trackRef.current;
    const tile = track?.children[index];
    if (!tile) return;
    track.scrollTo({ left: tile.offsetLeft - track.children[0].offsetLeft, behavior: "smooth" });
  };

  // the visitor took the wheel, so the gallery stops driving
  const steer = (index) => {
    setIsPlaying(false);
    goTo(index);
  };

  const trackActive = () => {
    const track = trackRef.current;
    const [first, second] = track?.children ?? [];
    if (!first) return;
    const slideWidth = second ? second.offsetLeft - first.offsetLeft : first.offsetWidth;
    setActive(activeSlide({ scrollLeft: track.scrollLeft, slideWidth, count: repos.length }));
  };

  // it only plays while it's on screen, so nobody comes back to find it parked on the last repo
  useEffect(() => {
    if (!isPlaying || !isInView || repos.length < 2) return undefined;
    const timer = setTimeout(() => goTo(wrapRange(0, repos.length, active + 1)), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [isPlaying, isInView, active, repos.length]);

  return (
    <section id="github" ref={sectionRef} className="relative py-24 sm:py-36" aria-roledescription="carousel" aria-label="Side quests">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <SectionHeader
          id="github"
          index="05"
          label="repos.yml"
          title="Side quests, shipped after hours."
          aside={
            repos.length > 0 && (
              <div className="flex shrink-0 items-center gap-1">
                <p className="font-mono text-xs whitespace-nowrap text-faint">
                  <span className="text-accent">$</span> gh repo list {GITHUB_USER} | wc -l{" "}
                  <span className="text-fg">→ {repos.length}</span>
                </p>
                <Triforce className="-my-2" />
              </div>
            )
          }
        />

        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="the repos" />}
      </div>

      {repos.length > 0 && (
        <>
          {/* lenis keeps the page's vertical scroll, sideways swipes go straight to the gallery. the tiles start in
              line with the header and bleed off the right edge */}
          <div
            ref={trackRef}
            onScroll={trackActive}
            onPointerDown={() => setIsPlaying(false)}
            data-shelf
            data-lenis-prevent-horizontal
            className="mt-12 flex snap-x snap-mandatory scroll-px-[max(1rem,calc((100%-72rem)/2+1.5rem))] gap-5 overflow-x-auto overscroll-x-contain px-[max(1rem,calc((100%-72rem)/2+1.5rem))] py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {repos.map((repo, index) => (
              <RepoTile key={repo.name} repo={repo} index={index} total={repos.length} isActive={index === active} />
            ))}
            {/* room after the last tile, so even it can snap over to the left edge like the others */}
            <div className="w-[calc(100%-min(86vw,36rem)-1.25rem)] shrink-0" aria-hidden="true" />
          </div>

          <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
            <a
              href={`https://github.com/${GITHUB_USER}`}
              target="_blank"
              rel="noreferrer"
              className="group flex w-fit shrink-0 items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              <span className="text-accent">$</span> open github.com/{GITHUB_USER}
              <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            {repos.length > 1 && (
              <div className="flex items-center gap-3">
                <div className="flex h-14 items-center gap-2.5 rounded-full bg-raised/80 px-5 backdrop-blur">
                  {repos.map((repo, index) => (
                    <Dot key={repo.name} name={repo.name} isActive={index === active} isPlaying={isPlaying && isInView} onClick={() => steer(index)} />
                  ))}
                </div>
                <ControlButton label={isPlaying ? "Pause the side quests" : "Play the side quests"} onClick={() => setIsPlaying((playing) => !playing)}>
                  {isPlaying ? <Pause size={16} fill="currentColor" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />}
                </ControlButton>
                <div className="hidden gap-2 sm:flex">
                  <ControlButton label="Previous repo" onClick={() => steer(active - 1)} isDisabled={active === 0}>
                    <ChevronLeft size={18} aria-hidden="true" />
                  </ControlButton>
                  <ControlButton label="Next repo" onClick={() => steer(active + 1)} isDisabled={active === repos.length - 1}>
                    <ChevronRight size={18} aria-hidden="true" />
                  </ControlButton>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default GitHub;
