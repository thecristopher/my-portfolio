import { motion } from "framer-motion";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import SectionIntro, { Gold } from "../../components/SectionIntro";
import TechIcon from "../../components/TechIcon";
import SpotlightCard from "../../components/SpotlightCard";
import { SkeletonLines } from "../../components/Skeleton";
import { Trigger as Triforce } from "../../components/Relics/Zelda";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { brandColorFor, formatIndex, repoLanguages, slugify } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

const NO_REPOS = [];

// the config this whole site is drawn from, pinned above the rest. what it does comes from its own README
const MAIN_QUEST = {
  name: "nvim-config",
  title: "Eldentree",
  url: `https://github.com/${GITHUB_USER}/nvim-config`,
  pitch:
    "A Neovim config forged in the Lands Between. Catppuccin Mocha, recolored for whichever Elden Ring region you wake up in, with banners, runes and a Site of Grace that lets you rest when you step away.",
  modules: [
    ["themes", "six region palettes, a fresh roll every launch"],
    ["hub", "a living dashboard with gold headers and rising embers"],
    ["banner", "ENEMY FELLED for commits, PRs and test runs"],
    ["runes", "a rune tally in the statusline, saves pay out"],
    ["rest", "five idle minutes and the editor rests at grace"],
    ["trial", "runs the project's tests and announces the verdict"],
  ],
};

// this page is the config's twin: the regions, the hub, the banners, the runes and the rest all came from here
const MainQuest = () => (
  <a
    href={MAIN_QUEST.url}
    target="_blank"
    rel="noreferrer"
    className="group relative grid gap-8 overflow-hidden rounded-3xl border border-line bg-panel/70 p-7 transition-colors hover:border-accent/50 sm:p-10 lg:grid-cols-[1fr_1.1fr]"
  >
    <div className="flex flex-col gap-4">
      <p className="font-mono text-xs text-accent">main quest · {MAIN_QUEST.name}</p>
      <h3 className="shimmer w-fit font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-none font-semibold tracking-[0.08em] uppercase">{MAIN_QUEST.title}</h3>
      <p className="text-lg leading-relaxed text-muted text-pretty">{MAIN_QUEST.pitch}</p>
      <p className="text-sm text-faint">Everything this page does with regions, banners, runes and resting started here.</p>
      <span className="mt-auto flex w-fit items-center gap-1.5 text-sm text-accent">
        Open on GitHub
        <ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </div>
    <ul className="flex flex-col divide-y divide-line self-start rounded-2xl border border-line bg-mantle/60 font-mono text-[13px]">
      {MAIN_QUEST.modules.map(([module, what]) => (
        <li key={module} className="flex gap-4 px-4 py-3">
          <span className="w-24 shrink-0 text-rose">core/{module}</span>
          <span className="text-muted">{what}</span>
        </li>
      ))}
    </ul>
  </a>
);

// when GitHub can't be reached the shelf still points somewhere useful instead of leaving a hole
const Offline = () => (
  <p className="rounded-2xl border border-line bg-panel/50 px-6 py-5 text-muted">
    GitHub isn't answering right now. The rest of the side quests are on{" "}
    <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
      github.com/{GITHUB_USER}
    </a>
    .
  </p>
);

// how long ago a repo was last pushed, in the words a person would use
const lastPushed = (isoDate) => {
  const days = Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

const languageColor = (language) => brandColorFor(language ?? "") ?? "var(--color-accent)";

const LanguageDot = ({ language }) => (
  <span className="size-2 shrink-0 rounded-full" style={{ background: languageColor(language) }} aria-hidden="true" />
);

// every fourth card opens and closes a row wide, so any number of repos lands as a bento instead of a plain grid
const isWide = (index) => index % 4 === 0 || index % 4 === 3;

const RepoMeta = ({ repo }) => (
  <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-muted">
    {repoLanguages(repo).map((language) => (
      <div key={language} className="flex items-center gap-2 rounded-full border border-line bg-mantle/70 px-2.5 py-1">
        <LanguageDot language={language} />
        <dd>{language}</dd>
      </div>
    ))}
    <div className="flex items-center gap-1.5">
      <Star size={12} aria-hidden="true" />
      <dd className="tabular-nums">{repo.stars}</dd>
    </div>
    <div className="flex items-center gap-1.5">
      <GitFork size={12} aria-hidden="true" />
      <dd className="tabular-nums">{repo.forks}</dd>
    </div>
    <dd className="text-faint">pushed {lastPushed(repo.pushed_at)}</dd>
  </dl>
);

// where each language's logo is pressed into the card, main language biggest, the rest stacked around it
const WATERMARK_SPOTS = [
  "-right-6 -bottom-8 size-44 -rotate-12",
  "right-32 -bottom-10 size-28 rotate-6",
  "-right-4 bottom-32 size-20 rotate-12",
];

// one repo as a card dressed in its languages: a glow per language, every logo pressed into the panel like a
// watermark, and the spotlight border following the cursor in the main language's color
const RepoCard = ({ repo, index }) => {
  const wide = isWide(index);
  const languages = repoLanguages(repo).slice(0, WATERMARK_SPOTS.length);
  const color = languageColor(languages[0]);
  const secondColor = languages[1] ? languageColor(languages[1]) : null;

  return (
    <motion.li
      id={`repo-${slugify(repo.name)}`}
      initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: (index % 2) * 0.12, ease: easeOutExpo }}
      className={`min-w-0 ${wide ? "lg:col-span-2" : ""}`}
    >
      <SpotlightCard
        className="group h-full overflow-hidden rounded-3xl border border-line bg-panel/70 transition-colors duration-500 hover:border-line-strong"
        style={{ "--color-accent": color }}
      >
        <a href={repo.url} target="_blank" rel="noreferrer" className="relative flex h-full min-h-[17rem] flex-col gap-5 p-6 sm:p-8">
          <span
            className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full opacity-15 blur-3xl transition-opacity duration-700 group-hover:opacity-35"
            style={{ background: color }}
            aria-hidden="true"
          />
          {secondColor && (
            <span
              className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full opacity-10 blur-3xl transition-opacity duration-700 group-hover:opacity-25"
              style={{ background: secondColor }}
              aria-hidden="true"
            />
          )}
          {languages.map((language, spot) => (
            <TechIcon
              key={language}
              tech={language}
              className={`pointer-events-none absolute ${WATERMARK_SPOTS[spot]} opacity-[0.05] transition-[transform,opacity] duration-700 group-hover:scale-110 group-hover:-rotate-6 group-hover:opacity-[0.12]`}
            />
          ))}
          <div className="relative flex items-center justify-between gap-4 font-mono text-[11px] text-faint">
            <span>
              side quest {formatIndex(index)} · <span className="text-muted">~/{GITHUB_USER}</span>
            </span>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-faint transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden="true"
            />
          </div>
          <h3 className={`relative font-semibold tracking-tight break-words ${wide ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
            <span className="text-faint">/</span>
            {repo.name}
          </h3>
          <p className={`relative max-w-2xl leading-relaxed text-muted text-pretty ${wide ? "text-lg" : "text-base"}`}>{repo.pitch}</p>
          <div className="relative mt-auto flex min-w-0 flex-col gap-4">
            <RepoMeta repo={repo} />
            <code className="block w-fit max-w-full truncate rounded-lg border border-line bg-mantle/80 px-3 py-1.5 font-mono text-[11px] text-faint transition-colors group-hover:text-muted">
              <span className="text-accent">$</span> gh repo clone {GITHUB_USER}/{repo.name}
            </code>
          </div>
        </a>
      </SpotlightCard>
    </motion.li>
  );
};

const SideQuests = ({ repos }) => (
  <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {repos.map((repo, index) => (
      <RepoCard key={repo.name} repo={repo} index={index} />
    ))}
  </ul>
);

/** side-quests.yml: my public repos, live from GitHub, each one a card dressed in the color of its language. */
const GitHub = ({ number }) => {
  const { data: repos = NO_REPOS, isLoading, isError } = useGetReposQuery();
  const sideQuests = repos.filter((repo) => repo.name !== MAIN_QUEST.name);

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
          lead="What I build when nobody's asking, starting with the editor this whole page is drawn from. The rest load live from GitHub, each one pitched by its own README."
        />
        <MainQuest />
        {isLoading && <SkeletonLines lines={4} />}
        {isError && repos.length === 0 && <Offline />}
        {sideQuests.length > 0 && <SideQuests repos={sideQuests} />}
        {/* every dungeon hides the Triforce past the final room */}
        <div className="-mt-8 flex justify-end pr-2">
          <Triforce zoom={0.42} />
        </div>
      </div>
    </section>
  );
};

export default GitHub;
