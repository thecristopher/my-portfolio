import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Triforce } from "../../components/Secrets";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { easeOutExpo } from "../../lib/motion";
import { slugify } from "../../actions";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { registerScrollTarget } from "../../lib/smoothScroll";

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

// on the shelf the slide is the entrance, so a card that arrives by sliding in never waits on its own reveal
const RepoCard = ({ repo, index, revealsOnView = true }) => (
  <motion.a
    id={`repo-${slugify(repo.name)}`}
    href={repo.url}
    target="_blank"
    rel="noreferrer"
    initial={revealsOnView ? { opacity: 0, y: 24 } : false}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, delay: index * 0.08, ease: easeOutExpo }}
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

// the track only pins on screens with room for the header and a full row of cards at once
const PIN_QUERY = "(min-width: 1024px) and (min-height: 680px)";
// the shelf holds still for a moment at both ends of the pin before and after it slides
const SHELF = [0.04, 0.96];
const SHELF_SPAN = SHELF[1] - SHELF[0];

// how far the row of cards has to slide for the last one to land at the right edge
const useOverflow = (viewportRef, trackRef, deps) => {
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return undefined;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - viewport.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return distance;
};

// the side quests: whatever I build after hours, pulled live from my public GitHub. their signature: on wide
// screens the page pins and the repos slide past sideways as you keep scrolling down, like flipping through a shelf
const GitHub = () => {
  const { data: repos = [], isLoading, isError } = useGetReposQuery();
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const hasRoom = useMediaQuery(PIN_QUERY);
  const distance = useOverflow(viewportRef, trackRef, [repos.length, hasRoom]);
  const isPinned = hasRoom && !prefersReducedMotion && distance > 0;

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const slide = useSpring(useTransform(scrollYProgress, SHELF, [0, -distance]), { stiffness: 140, damping: 30, mass: 0.4 });
  const shelf = useTransform(scrollYProgress, SHELF, [0, 1]);

  // the file tree jumps to a repo by scrolling down to the point where the shelf has slid it into view
  useEffect(() => {
    if (!isPinned) return undefined;
    const ids = repos.map((repo) => `repo-${slugify(repo.name)}`);
    const unregister = ids.map((id) =>
      registerScrollTarget(id, () => {
        const section = sectionRef.current;
        const card = document.getElementById(id);
        if (!section || !card) return null;
        const top = section.getBoundingClientRect().top + window.scrollY;
        const pinnedFor = distance / SHELF_SPAN;
        return top + pinnedFor * SHELF[0] + Math.min(distance, card.offsetLeft);
      })
    );
    return () => unregister.forEach((release) => release());
  }, [isPinned, repos, distance]);

  return (
    <section
      id="github"
      ref={sectionRef}
      className={`relative ${isPinned ? "" : "py-24 sm:py-36"}`}
      style={isPinned ? { height: `calc(100svh + ${distance / SHELF_SPAN}px)` } : undefined}
    >
      <div className={isPinned ? "sticky top-0 flex h-svh flex-col justify-center overflow-hidden py-16" : ""}>
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

          {/* the shelf is clipped to the column with soft edges, so repos slide in and out of view instead of under the tree */}
          <div
            ref={viewportRef}
            className={hasRoom && !prefersReducedMotion ? "-mx-4 overflow-hidden px-4 py-2" : ""}
            style={isPinned ? { maskImage: "linear-gradient(to right, transparent, black 3%, black 97%, transparent)" } : undefined}
          >
            <motion.div
              ref={trackRef}
              style={isPinned ? { x: slide } : undefined}
              className={hasRoom && !prefersReducedMotion ? "flex w-max gap-5" : "grid gap-5 md:grid-cols-2"}
            >
              {repos.map((repo, index) => (
                <div key={repo.name} className={hasRoom && !prefersReducedMotion ? "w-[26rem] shrink-0" : ""}>
                  <RepoCard repo={repo} index={index} revealsOnView={!(hasRoom && !prefersReducedMotion)} />
                </div>
              ))}
            </motion.div>
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
            {isPinned && (
              <span className="relative h-px w-full max-w-xs overflow-hidden bg-line" aria-hidden="true">
                <motion.span style={{ scaleX: shelf }} className="absolute inset-0 origin-left bg-accent" />
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GitHub;
