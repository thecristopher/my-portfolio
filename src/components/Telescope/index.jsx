import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CornerDownLeft } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useGetContactQuery } from "../../api/contactApi";
import { useGetCaseStudiesQuery } from "../../api/caseStudiesApi";
import { filterCommands, findCommandByAlias } from "../../actions";
import { pauseSmoothScroll, resumeSmoothScroll } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";
import { easeOutExpo } from "../../lib/motion";
import { useRegion } from "../../hooks/useRegion";
import { buildCommands } from "./commands";

const NO_ITEMS = [];

// the region's palette as a row of swatches, scoped to that region so it shows its own colors on any page
const REGION_SWATCHES = ["ink", "panel", "fg", "accent", "rose", "lavender", "string", "signal", "error"];

const RegionPreview = ({ region }) => (
  <div data-theme={region.name} className="flex h-full flex-col gap-4 rounded-lg bg-ink p-5 text-fg">
    <p className="font-display text-xs tracking-[0.3em] text-accent uppercase">{region.subtitle}</p>
    <p className="font-display text-3xl tracking-[0.12em] uppercase">{region.title}</p>
    <p className="text-sm text-muted">{region.tagline}</p>
    <div className="mt-auto flex gap-1.5">
      {REGION_SWATCHES.map((name) => (
        <span key={name} className="h-8 flex-1 rounded-md border border-line-strong" style={{ background: `var(--color-${name})` }} title={name} />
      ))}
    </div>
    <pre className="rounded-md bg-mantle p-3 font-mono text-[11px] leading-relaxed">
      <span className="text-accent">local</span> <span className="text-fg">region</span> <span className="text-muted">=</span>{" "}
      <span className="text-string">"{region.name}"</span>
      {"\n"}
      <span className="text-faint">-- {region.character} watches over this one</span>
    </pre>
  </div>
);

const TextPreview = ({ preview }) => (
  <div className="flex h-full flex-col gap-3 p-5">
    {preview.eyebrow && <p className="font-mono text-[11px] text-accent">{preview.eyebrow}</p>}
    <p className="text-xl font-semibold tracking-tight text-fg">{preview.title}</p>
    <p className="text-sm leading-relaxed text-muted text-pretty">{preview.body}</p>
  </div>
);

const Preview = ({ command }) => {
  if (!command?.preview) return <p className="p-5 font-mono text-xs text-faint">-- no preview --</p>;
  if (command.preview.kind === "region") return <RegionPreview region={command.preview.region} />;
  return <TextPreview preview={command.preview} />;
};

// nvim's region picker repaints the editor while you scroll through regions, so you see one before committing.
// the page does the same and puts the region back if you leave without picking
const useLiveRegionPreview = (activeCommand, isOpen) => {
  const original = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    original.current = document.documentElement.dataset.theme;
    return () => {
      document.documentElement.dataset.theme = original.current;
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !original.current) return;
    document.documentElement.dataset.theme = activeCommand?.region ?? original.current;
  }, [activeCommand, isOpen]);
  return original;
};

const ResultRow = ({ command, isActive, isFirstInGroup, onRun, onHover }) => {
  const Icon = command.icon;
  return (
    <li>
      {isFirstInGroup && <p className="px-3 pt-3 pb-1 font-mono text-[10px] tracking-[0.2em] text-faint uppercase">{command.group}</p>}
      <button
        type="button"
        onClick={onRun}
        onMouseEnter={onHover}
        className={`relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${isActive ? "bg-raised text-fg" : "text-muted"}`}
      >
        {isActive && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-accent" aria-hidden="true" />}
        <Icon size={14} className={isActive ? "text-accent" : "text-faint"} />
        <span className="flex-1 truncate">{command.label}</span>
        {command.isCurrent && <Check size={13} className="text-string" aria-label="current" />}
        <span className="hidden font-mono text-[11px] text-faint sm:inline">:{command.alias}</span>
        {isActive && <CornerDownLeft size={13} className="text-faint" />}
      </button>
    </li>
  );
};

const moveSelection = (event, setActiveIndex, count) => {
  const isDown = event.key === "ArrowDown" || (event.ctrlKey && event.key === "n");
  const isUp = event.key === "ArrowUp" || (event.ctrlKey && event.key === "p");
  if (!isDown && !isUp) return false;
  event.preventDefault();
  setActiveIndex((index) => Math.max(0, Math.min(count - 1, index + (isDown ? 1 : -1))));
  return true;
};

const Picker = ({ onClose, initialQuery, onOpenQuestLog, onOpenSearch, onOpenWhichKey }) => {
  const { data: links = NO_ITEMS } = useGetNavBarQuery();
  const { data: contact } = useGetContactQuery();
  const { data: caseStudies = NO_ITEMS } = useGetCaseStudiesQuery();
  const { region, isPinned } = useRegion();
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = useMemo(
    () => buildCommands({ links, caseStudies, contact, region: region.name, isRegionPinned: isPinned, onOpenQuestLog, onOpenSearch, onOpenWhichKey }),
    [links, caseStudies, contact, region.name, isPinned, onOpenQuestLog, onOpenSearch, onOpenWhichKey]
  );
  const results = filterCommands(commands, query);
  const activeCommand = results[activeIndex];
  const original = useLiveRegionPreview(activeCommand, true);

  const runCommand = (command) => {
    // a picked region is the new original, so closing doesn't paint the old one back over it
    if (command.region) original.current = command.region;
    onClose();
    // lenis drops scrollTo calls while stopped, and the close effect only resumes it after the next render
    resumeSmoothScroll();
    command.run();
  };

  const submit = () => {
    const chosen = findCommandByAlias(commands, query) ?? activeCommand;
    if (chosen) return runCommand(chosen);
    onClose();
    echo(`E492: Not an editor command: ${query.replace(/^:/, "")}`, "error");
  };

  const handleKeyDown = (event) => {
    if (moveSelection(event, setActiveIndex, results.length)) return;
    if (event.key === "Enter") submit();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Telescope"
      initial={{ opacity: 0, scale: 0.96, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      onClick={(event) => event.stopPropagation()}
      className="mx-auto grid h-[min(70vh,34rem)] w-full max-w-4xl grid-rows-[auto_1fr] overflow-hidden rounded-xl border border-accent/60 bg-mantle/95 shadow-[0_40px_120px_-20px_color-mix(in_oklab,var(--color-shadow)_90%,transparent)] backdrop-blur-xl md:grid-cols-[1.1fr_1fr]"
    >
      <div className="relative border-b border-line-strong md:col-span-2">
        <span className="absolute -top-px left-4 bg-mantle px-2 font-mono text-[10px] text-accent">Telescope</span>
        <div className="flex items-center gap-2 px-4 py-3.5 font-mono text-sm">
          <span className="text-accent">❯</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="resume, work, region, yank, keys..."
            aria-label="Command"
            spellCheck={false}
            className="flex-1 bg-transparent text-fg placeholder:text-faint focus:outline-none"
          />
          <span className="font-mono text-[11px] text-faint tabular-nums">
            {results.length}/{commands.filter((command) => !command.hidden).length}
          </span>
        </div>
      </div>

      <ul className="no-scrollbar min-h-0 overflow-y-auto p-2" data-lenis-prevent>
        {results.length === 0 && <li className="px-3 py-6 text-center font-mono text-xs text-faint">E492: Not an editor command: {query.replace(/^:/, "")}</li>}
        {results.map((command, index) => (
          <ResultRow
            key={command.id}
            command={command}
            isActive={index === activeIndex}
            isFirstInGroup={index === 0 || results[index - 1].group !== command.group}
            onRun={() => runCommand(command)}
            onHover={() => setActiveIndex(index)}
          />
        ))}
      </ul>

      <div className="relative hidden min-h-0 border-l border-line-strong p-2 md:block">
        <span className="absolute -top-px right-4 bg-mantle px-2 font-mono text-[10px] text-signal">Preview</span>
        <Preview command={activeCommand} />
      </div>
    </motion.div>
  );
};

/**
 * Telescope: the command line, the buffer list, the region picker and every shortcut in one fuzzy finder.
 */
const Telescope = ({ isOpen, initialQuery = "", onClose, onOpenQuestLog, onOpenSearch, onOpenWhichKey }) => {
  useEffect(() => {
    if (!isOpen) return;
    pauseSmoothScroll();
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      resumeSmoothScroll();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-ink/60 px-3 pt-[12vh] backdrop-blur-sm"
        >
          <Picker onClose={onClose} initialQuery={initialQuery} onOpenQuestLog={onOpenQuestLog} onOpenSearch={onOpenSearch} onOpenWhichKey={onOpenWhichKey} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Telescope;
