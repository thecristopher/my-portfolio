import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { X } from "lucide-react";
import EditorWindow from "../../components/EditorWindow";
import { Trigger as PokeBall } from "../../components/Relics/Pokemon";
import TechIcon from "../../components/TechIcon";
import { careerCommits, cleanTechName } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { scrollToSection } from "../../lib/smoothScroll";
import { clearTech, pickTech } from "../../lib/stackFilter";

// long stacks split into two columns so the side panel never outgrows the story next to it.
// every tool is a grep: pick one and the other jobs fade back
export const StackList = ({ technologies, pickedTech }) => (
  <ul className={`grid gap-x-4 gap-y-1.5 ${technologies.length > 8 ? "grid-cols-2" : "grid-cols-1"}`}>
    {technologies.map((tech) => {
      const name = cleanTechName(tech);
      const isPicked = pickedTech === name;
      return (
        <li key={tech} className="min-w-0">
          <button
            type="button"
            onClick={() => pickTech(isPicked ? null : name)}
            aria-pressed={isPicked}
            title={isPicked ? "Show every job" : `Only the jobs that shipped with ${name}`}
            className={`flex w-full min-w-0 items-center gap-2 text-left transition-colors ${isPicked ? "text-accent" : "text-muted hover:text-fg"}`}
          >
            <span className="grid w-4 place-items-center text-faint">
              <TechIcon tech={tech} className="size-3" fallback="·" />
            </span>
            <span className="truncate">{name}</span>
          </button>
        </li>
      );
    })}
  </ul>
);

const COMMIT_TONES = { promote: "text-string", join: "text-signal", init: "text-error" };

// every title I held as a commit, newest on top. each one jumps to the card that tells its story
export const CareerLog = ({ projects }) => {
  const commits = careerCommits(projects);
  const listRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  // the work section's signature: the branch line draws itself down the log as you read it
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 0.85", "end 0.55"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  return (
    <div id="career-log">
      <EditorWindow path={["cristopher", "work", "career.log"]}>
        <div className="flex flex-col gap-4 font-mono text-xs">
          {/* every commit below is an evolution, so the grass grows beside the log that lists them */}
          <p className="flex items-center justify-between text-muted">
            <span>
              <span className="text-accent">$</span> git log --graph --oneline --all
            </span>
            <PokeBall zoom={0.42} />
          </p>
          <ol ref={listRef} className="relative flex flex-col">
            <span className="absolute top-3 bottom-3 left-[5px] w-px bg-line" aria-hidden="true" />
            <motion.span
              style={prefersReducedMotion ? undefined : { scaleY: drawn }}
              className="absolute top-3 bottom-3 left-[5px] w-px origin-top bg-gradient-to-b from-accent via-signal to-error"
              aria-hidden="true"
            />
            {commits.map((commit, index) => (
              <motion.li
                key={commit.hash}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.07, ease: easeOutExpo }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => scrollToSection(commit.targetId)}
                  className={`group relative flex w-full items-baseline gap-3 rounded-md py-1.5 text-left ${commit.isNewestAtCompany && index > 0 ? "mt-2" : ""}`}
                >
                  <span className="relative grid size-[11px] shrink-0 translate-y-[1px] place-items-center self-start">
                    {commit.isHead && <span className="absolute inset-0 animate-ping rounded-full bg-accent/50" aria-hidden="true" />}
                    <span className={`size-[9px] rounded-full border-2 border-current bg-panel ${commit.isHead ? "bg-current text-accent" : COMMIT_TONES[commit.type]}`} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                    <span className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                      <span className="text-accent">{commit.hash}</span>
                      {commit.isHead && (
                        <span>
                          <span className="text-faint">(</span>
                          <span className="text-signal">HEAD</span>
                          <span className="text-faint"> → </span>
                          <span className="text-string">main</span>
                          <span className="text-faint">)</span>
                        </span>
                      )}
                      <span>
                        <span className={COMMIT_TONES[commit.type]}>{commit.type}:</span>{" "}
                        <span className="text-fg transition-colors group-hover:text-accent">{commit.message}</span>
                      </span>
                    </span>
                    {commit.years && <span className="text-faint sm:ml-auto sm:shrink-0">{commit.years}</span>}
                  </span>
                </button>
              </motion.li>
            ))}
          </ol>
        </div>
      </EditorWindow>
    </div>
  );
};

// the grep the skills or a card's stack started, with the way back to every job
export const GrepBanner = ({ tech, matches, total }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.4, ease: easeOutExpo }}
    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-panel/90 px-4 py-3 font-mono text-xs shadow-[0_18px_40px_-16px_color-mix(in_oklab,var(--color-shadow)_80%,transparent)] backdrop-blur-xl"
  >
    <p className="text-muted">
      <span className="text-accent">$</span> grep -l "{tech}" ~/work/* <span className="text-fg">→ {matches} of {total} jobs</span>
    </p>
    <button
      type="button"
      onClick={clearTech}
      className="flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
    >
      <X size={13} aria-hidden="true" /> clear
    </button>
  </motion.div>
);

