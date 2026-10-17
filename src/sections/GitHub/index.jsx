import { useEffect, useRef, useState } from "react";
import { motion, useScroll } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, GitFork, Star } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Triforce } from "../../components/Secrets";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { easeOutExpo } from "../../lib/motion";
import { shelfEdges, slugify } from "../../actions";
import { slideShelf } from "../../lib/smoothScroll";

// the same dots GitHub paints next to each language
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572a5",
  Swift: "#f05138",
  Go: "#00add8",
  Rust: "#dea584",
  Lua: "#000080",
  Shell: "#89e051",
};

const formatPushed = (pushedAt) =>
  new Date(pushedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });

// each card rises in as it comes into view, whether the page brought it there or the shelf did
const RepoCard = ({ repo, index }) => (
  <motion.a
    id={`repo-${slugify(repo.name)}`}
    href={repo.url}
    target="_blank"
    rel="noreferrer"
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: easeOutExpo }}
    className="group block h-full"
  >
    <SpotlightCard className="flex h-full flex-col gap-5 rounded-2xl border border-line bg-panel/60 p-6 transition-colors group-hover:border-line-strong">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-mono text-lg text-fg">
          <span className="hidden text-faint sm:inline">{GITHUB_USER}/</span>
          {repo.name}
        </h3>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
        />
      </div>
      <p className="grow leading-relaxed text-muted text-pretty">
        {repo.pitch}
      </p>
      <p className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-faint">
        {repo.language && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: LANGUAGE_COLORS[repo.language] ?? "currentColor" }} />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star size={12} /> {repo.stars}
        </span>
        <span className="flex items-center gap-1">
          <GitFork size={12} /> {repo.forks}
        </span>
        <span>pushed {formatPushed(repo.pushed_at)}</span>
      </p>
    </SpotlightCard>
  </motion.a>
);

// which ends of the shelf can still scroll, so the arrows and the edge fades only show where there's more
const useShelfEdges = (shelfRef, deps) => {
  const [edges, setEdges] = useState({ isAtStart: true, isAtEnd: true });

  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf) return undefined;
    const measure = () => setEdges(shelfEdges(shelf));
    measure();
    shelf.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(shelf);
    return () => {
      shelf.removeEventListener("scroll", measure);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return edges;
};

const SHELF_FADE = {
  both: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
  start: "linear-gradient(to right, transparent, black 4%)",
  end: "linear-gradient(to right, black 96%, transparent)",
};

const fadeFor = ({ isAtStart, isAtEnd }) => {
  if (!isAtStart && !isAtEnd) return SHELF_FADE.both;
  if (!isAtStart) return SHELF_FADE.start;
  if (!isAtEnd) return SHELF_FADE.end;
  return undefined;
};

const ShelfArrow = ({ direction, isDisabled, onClick }) => {
  const Icon = direction < 0 ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-label={direction < 0 ? "Previous repos" : "More repos"}
      className="grid size-9 place-items-center rounded-full border border-line-strong bg-ink/40 text-muted transition-all hover:border-faint hover:text-fg disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon size={15} aria-hidden="true" />
    </button>
  );
};

// the side quests: whatever I build after hours, pulled live from my public GitHub. they sit on a shelf that scrolls
// sideways the way a trackpad, a shift and wheel or a thumb already expect, while scrolling down keeps moving the page
const GitHub = () => {
  const { data: repos = [], isLoading, isError } = useGetReposQuery();
  const shelfRef = useRef(null);
  const edges = useShelfEdges(shelfRef, [repos.length]);
  const { scrollXProgress } = useScroll({ container: shelfRef });
  const canScroll = !(edges.isAtStart && edges.isAtEnd);

  const flip = (direction) => slideShelf(shelfRef.current, direction);

  return (
    <section id="github" className="relative py-24 sm:py-36">
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

        {/* lenis keeps smoothing the page's vertical scroll, and hands every sideways swipe straight to the shelf */}
        <div
          ref={shelfRef}
          data-shelf
          data-lenis-prevent-horizontal
          className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto overscroll-x-contain px-4 py-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
          style={{ maskImage: fadeFor(edges) }}
        >
          {repos.map((repo, index) => (
            <div key={repo.name} className="w-[min(85vw,26rem)] shrink-0 snap-start">
              <RepoCard repo={repo} index={index} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-6">
          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noreferrer"
            className="group flex w-fit shrink-0 items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
          >
            <span className="text-accent">$</span> open github.com/{GITHUB_USER}
            <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
          {canScroll && (
            <div className="flex w-full max-w-sm items-center gap-4">
              <span className="relative h-px flex-1 overflow-hidden bg-line" aria-hidden="true">
                <motion.span style={{ scaleX: scrollXProgress }} className="absolute inset-0 origin-left bg-accent" />
              </span>
              <div className="flex gap-2">
                <ShelfArrow direction={-1} isDisabled={edges.isAtStart} onClick={() => flip(-1)} />
                <ShelfArrow direction={1} isDisabled={edges.isAtEnd} onClick={() => flip(1)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default GitHub;
