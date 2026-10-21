import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, FolderGit2, GitFork, Star } from "lucide-react";
import SectionIntro, { Gold } from "../../components/SectionIntro";
import TechIcon from "../../components/TechIcon";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Trigger as Chest } from "../../components/Relics/Zelda";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { brandColorFor, slugify } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

const NO_REPOS = [];

// how long ago a repo was last pushed, in the words a person would use
const lastPushed = (isoDate) => {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const LanguageDot = ({ language }) => (
  <span className="size-2 shrink-0 rounded-full" style={{ background: brandColorFor(language ?? "") ?? "var(--color-faint)" }} aria-hidden="true" />
);

const RepoRow = ({ repo, isActive, onPick }) => (
  <li id={`repo-${slugify(repo.name)}`}>
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={onPick}
      onFocus={onPick}
      aria-pressed={isActive}
      className={`relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left font-mono text-[13px] transition-colors ${isActive ? "bg-raised text-fg" : "text-muted hover:text-fg"}`}
    >
      {isActive && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />}
      <span className={isActive ? "text-accent" : "text-faint"}>❯</span>
      <LanguageDot language={repo.language} />
      <span className="flex-1 truncate">{repo.name}</span>
      <span className="flex items-center gap-1 text-[11px] text-faint tabular-nums">
        <Star size={11} aria-hidden="true" />
        {repo.stars}
      </span>
    </button>
  </li>
);

const Preview = ({ repo }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={repo.name}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      className="flex h-full flex-col gap-6 p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <FolderGit2 size={18} className="text-accent" aria-hidden="true" />
        <h3 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">{repo.name}</h3>
      </div>
      <p className="text-lg leading-relaxed text-muted text-pretty">{repo.pitch}</p>
      <dl className="mt-auto flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs text-muted">
        {repo.language && (
          <div className="flex items-center gap-2">
            <TechIcon tech={repo.language} className="size-3.5" fallback={<LanguageDot language={repo.language} />} />
            <dd>{repo.language}</dd>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Star size={12} aria-hidden="true" />
          <dd>{repo.stars} stars</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <GitFork size={12} aria-hidden="true" />
          <dd>{repo.forks} forks</dd>
        </div>
        <dd className="text-faint">pushed {lastPushed(repo.pushed_at)}</dd>
      </dl>
      <a
        href={repo.url}
        target="_blank"
        rel="noreferrer"
        className="group flex w-fit items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink transition-transform hover:scale-[1.03]"
      >
        Open on GitHub
        <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </motion.div>
  </AnimatePresence>
);

// telescope's picker: the repos on the left, a preview of the one under the cursor on the right
const Picker = ({ repos }) => {
  const [activeName, setActiveName] = useState(repos[0]?.name);
  const active = repos.find((repo) => repo.name === activeName) ?? repos[0];

  return (
    <div className="grid overflow-hidden rounded-2xl border border-accent/50 bg-mantle/85 shadow-[0_40px_100px_-40px_color-mix(in_oklab,var(--color-shadow)_90%,transparent)] backdrop-blur-xl md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="relative border-b border-line-strong md:border-r md:border-b-0">
        <span className="absolute -top-px left-4 bg-mantle px-2 font-mono text-[10px] text-accent">Side quests</span>
        <p className="flex items-center gap-2 border-b border-line px-4 py-3 font-mono text-sm text-faint">
          <span className="text-accent">❯</span> github.com/{GITHUB_USER}
          <span className="ml-auto text-[11px] tabular-nums">
            {repos.length}/{repos.length}
          </span>
        </p>
        <ul className="no-scrollbar max-h-80 overflow-y-auto p-2 md:max-h-[26rem]" data-lenis-prevent>
          {repos.map((repo) => (
            <RepoRow key={repo.name} repo={repo} isActive={repo.name === active.name} onPick={() => setActiveName(repo.name)} />
          ))}
        </ul>
      </div>
      <div className="relative min-h-[20rem]">
        <span className="absolute -top-px right-4 hidden bg-mantle px-2 font-mono text-[10px] text-signal md:block">Preview</span>
        <Preview repo={active} />
      </div>
    </div>
  );
};

/** side-quests.yml: my public repos, live from GitHub, browsed the way telescope browses files. */
const GitHub = ({ number }) => {
  const { data: repos = NO_REPOS, isLoading, isError } = useGetReposQuery();

  return (
    <section id="github" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 sm:px-6">
        <SectionIntro
          sectionId="github"
          number={number}
          title={
            <>
              Side quests, <Gold>live from GitHub.</Gold>
            </>
          }
          lead="What I build when nobody asks me to. Each one pitched by its own README."
        />
        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="the repos" />}
        {repos.length > 0 && <Picker repos={repos} />}
        {/* every dungeon hides one last chest past the final room */}
        <div className="flex justify-center pt-4">
          <Chest />
        </div>
      </div>
    </section>
  );
};

export default GitHub;
