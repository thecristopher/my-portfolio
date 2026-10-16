import { motion } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import SpotlightCard from "../../components/SpotlightCard";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { Triforce } from "../../components/Secrets";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { easeOutExpo } from "../../lib/motion";
import { slugify } from "../../actions";

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

const RepoCard = ({ repo, index }) => (
  <motion.a
    id={`repo-${slugify(repo.name)}`}
    href={repo.url}
    target="_blank"
    rel="noreferrer"
    initial={{ opacity: 0, y: 24 }}
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

// the side quests: whatever I build after hours, pulled live from my public GitHub
const GitHub = () => {
  const { data: repos = [], isLoading, isError } = useGetReposQuery();

  return (
    <section id="github" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader index="05" label="repos.yml" title="Side quests, shipped after hours." />
          {repos.length > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <p className="font-mono text-xs whitespace-nowrap text-faint">
                <span className="text-accent">$</span> gh repo list {GITHUB_USER} | wc -l{" "}
                <span className="text-fg">→ {repos.length}</span>
              </p>
              <Triforce className="-my-2" />
            </div>
          )}
        </div>

        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="the repos" />}

        <div className="grid gap-5 md:grid-cols-2">
          {repos.map((repo, index) => (
            <RepoCard key={repo.name} repo={repo} index={index} />
          ))}
        </div>

        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noreferrer"
          className="group flex w-fit items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          <span className="text-accent">$</span> open github.com/{GITHUB_USER}
          <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </section>
  );
};

export default GitHub;
