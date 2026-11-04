import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import SectionHeading, { Sunset } from "../../components/SectionHeading";
import TechIcon from "../../components/TechIcon";
import SpotlightCard from "../../components/SpotlightCard";
import { SkeletonLines } from "../../components/Skeleton";
import { Trigger as Triforce } from "../../components/Relics/Zelda";
import { useScrollRange } from "../../hooks/useScrollRange";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { brandColorFor, repoLanguages, slugify } from "../../actions";
import { usePinnedTrack } from "../../hooks/usePinnedTrack";
import { easeOutExpo } from "../../lib/motion";
import { MAIN_PROJECT, lastPushed } from "./actions";

const NO_REPOS = [];

const languageColor = (language) => brandColorFor(language ?? "") ?? "var(--color-accent)";

// the config I live in every day, on a dark stage of its own in either theme
const MainProject = () => (
  <motion.a
    href={MAIN_PROJECT.url}
    target="_blank"
    rel="noreferrer"
    initial={{ opacity: 0, y: 48, scale: 0.97 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 1.1, ease: easeOutExpo }}
    className="group relative grid gap-10 overflow-hidden rounded-[2rem] bg-stage p-8 text-stage-fg sm:p-12 lg:grid-cols-[1fr_1.1fr]"
  >
    <span className="bg-sunset pointer-events-none absolute -top-40 -right-32 size-[28rem] rounded-full opacity-25 blur-3xl transition-opacity duration-700 group-hover:opacity-40" aria-hidden="true" />
    <div className="relative flex flex-col gap-5">
      <p className="text-sm font-semibold text-glow">Featured project</p>
      <h3 className="text-[clamp(2.6rem,6vw,4.5rem)] leading-none font-semibold tracking-[-0.045em]">{MAIN_PROJECT.title}</h3>
      <p className="text-lg leading-relaxed text-stage-fg/75 text-pretty">{MAIN_PROJECT.pitch}</p>
      <span className="mt-auto flex w-fit items-center gap-1.5 text-sm font-medium text-glow">
        View on GitHub
        <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </div>
    <ul className="relative grid gap-3 self-start sm:grid-cols-2">
      {MAIN_PROJECT.features.map(([name, what]) => (
        <li key={name} className="flex flex-col gap-1 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10">
          <span className="font-semibold">{name}</span>
          <span className="text-sm text-stage-fg/65">{what}</span>
        </li>
      ))}
    </ul>
  </motion.a>
);

const RepoMeta = ({ repo }) => (
  <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted">
    {repoLanguages(repo).map((language) => (
      <div key={language} className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: languageColor(language) }} aria-hidden="true" />
        <dd>{language}</dd>
      </div>
    ))}
    <div className="flex items-center gap-1">
      <Star size={12} aria-hidden="true" />
      <dd className="tabular-nums">{repo.stars}</dd>
    </div>
    <div className="flex items-center gap-1">
      <GitFork size={12} aria-hidden="true" />
      <dd className="tabular-nums">{repo.forks}</dd>
    </div>
    <dd className="text-faint">Updated {lastPushed(repo.pushed_at)}</dd>
  </dl>
);

// one repo as a card washed in its main language, the logo pressed into the corner and leaning toward the cursor
const RepoCard = ({ repo, index, progress, count, isStill }) => {
  const [language] = repoLanguages(repo);
  const color = languageColor(language);
  // each card lifts as it reaches the middle of the screen, then settles as it leaves
  const center = count > 1 ? index / (count - 1) : 0.5;
  const lift = useScrollRange(progress, [center - 0.35, center, center + 0.35], [24, 0, 24]);

  return (
    <motion.li id={`repo-${slugify(repo.name)}`} style={isStill ? undefined : { y: lift }} className="w-[82vw] max-w-[24rem] shrink-0 sm:w-[24rem]">
      <SpotlightCard className="card group h-full overflow-hidden rounded-3xl" style={{ "--spot-color": color }}>
        <a href={repo.url} target="_blank" rel="noreferrer" className="relative flex h-full min-h-[22rem] flex-col gap-5 p-7">
          <span className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40" style={{ background: color }} aria-hidden="true" />
          {language && (
            <TechIcon
              tech={language}
              className="pointer-events-none absolute -right-6 -bottom-6 size-36 -rotate-12 opacity-[0.07] transition-[transform,opacity] duration-700 group-hover:scale-110 group-hover:opacity-[0.14]"
            />
          )}
          <span className="relative flex items-center justify-between text-sm text-faint">
            {String(index + 1).padStart(2, "0")}
            <ArrowUpRight size={18} className="transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" aria-hidden="true" />
          </span>
          <h3 className="relative text-3xl font-semibold tracking-tight break-words">{repo.name}</h3>
          <p className="relative leading-relaxed text-muted text-pretty">{repo.pitch}</p>
          <div className="relative mt-auto">
            <RepoMeta repo={repo} />
          </div>
        </a>
      </SpotlightCard>
    </motion.li>
  );
};

// the end of the shelf, where the profile link and the Triforce wait
const ShelfEnd = () => (
  <li className="flex w-[70vw] max-w-[20rem] shrink-0 flex-col items-start justify-center gap-4 sm:w-[20rem]">
    <p className="text-2xl font-semibold tracking-tight">More on GitHub.</p>
    <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="group flex items-center gap-1 text-accent">
      github.com/{GITHUB_USER}
      <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
    {/* every dungeon hides the Triforce past the final room */}
    <Triforce zoom={0.42} />
  </li>
);

// the repos slide past while the scene stays pinned, so scrolling down walks the shelf
const Shelf = ({ repos }) => {
  const { sectionRef, trackRef, x, height, progress } = usePinnedTrack();
  const prefersReducedMotion = useReducedMotion();
  const cards = repos.map((repo, index) => <RepoCard key={repo.name} repo={repo} index={index} count={repos.length} progress={progress} isStill={prefersReducedMotion} />);

  if (prefersReducedMotion) {
    return (
      <ul className="no-scrollbar mx-auto flex max-w-6xl gap-5 overflow-x-auto px-4 pb-4 sm:px-6">
        {cards}
        <ShelfEnd />
      </ul>
    );
  }

  return (
    <div ref={sectionRef} style={{ height }} className="relative">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.ul ref={trackRef} style={{ x }} className="flex w-max items-stretch gap-5 px-[max(1rem,calc((100vw-72rem)/2+1.5rem))]">
          {cards}
          <ShelfEnd />
        </motion.ul>
      </div>
    </div>
  );
};

// when GitHub can't be reached the section still points somewhere useful instead of leaving a hole
const Offline = () => (
  <p className="mx-auto max-w-6xl px-4 text-muted sm:px-6">
    GitHub isn't answering right now. Everything else lives on{" "}
    <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
      github.com/{GITHUB_USER}
    </a>
    .
    {/* the Triforce still waits past the last room, even when the rooms didn't load */}
    <span className="ml-2 inline-flex align-middle">
      <Triforce zoom={0.42} />
    </span>
  </p>
);

/** What I build when nobody's asking: the editor config first, then the public repos live from GitHub on a shelf. */
const GitHub = () => {
  const { data: repos = NO_REPOS, isLoading, isError } = useGetReposQuery();
  const others = repos.filter((repo) => repo.name !== MAIN_PROJECT.name);

  return (
    <section id="github" className="relative pt-28 sm:pt-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 sm:px-6">
        <SectionHeading
          eyebrow="Side projects"
          title={
            <>
              Built for fun. <Sunset>Shipped anyway.</Sunset>
            </>
          }
          lead="What I build when nobody's asking, starting with the editor I write everything in. The rest load live from GitHub, each one pitched by its own README."
        />
        <MainProject />
        {isLoading && <SkeletonLines lines={4} />}
      </div>
      {isError && repos.length === 0 && (
        <div className="pt-14">
          <Offline />
        </div>
      )}
      {others.length > 0 && <Shelf repos={others} />}
    </section>
  );
};

export default GitHub;
