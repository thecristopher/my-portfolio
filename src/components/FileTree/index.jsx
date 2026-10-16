import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FileClock, FileCode, FileCog, FileJson, FileTerminal, FileText, Folder, FolderOpen, GitBranch } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetReposQuery } from "../../api/githubApi";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useActiveSection } from "../../hooks/useActiveSection";
import { buildFileTree, sectionIdFromUrl } from "../../actions";
import { scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";

// the colors nvim-web-devicons gives each filetype, mapped onto the colorscheme
const FILE_ICONS = {
  tsx: [FileCode, "text-signal"],
  md: [FileText, "text-muted"],
  json: [FileJson, "text-accent"],
  toml: [FileCog, "text-string"],
  yml: [FileCog, "text-string"],
  lua: [FileCode, "text-signal"],
  sh: [FileTerminal, "text-string"],
  log: [FileClock, "text-muted"],
  git: [GitBranch, "text-error"],
};

const iconFor = (name) => FILE_ICONS[name.split(".").pop()] ?? [FileText, "text-faint"];

const Row = ({ depth, isCurrent, onClick, children, label }) => (
  <li className="relative">
    {isCurrent && (
      <motion.span
        layoutId="tree-cursorline"
        className="absolute inset-0 rounded-md bg-raised"
        transition={{ type: "spring", stiffness: 420, damping: 36 }}
      />
    )}
    <button
      type="button"
      onClick={onClick}
      aria-current={isCurrent ? "true" : undefined}
      aria-label={label}
      style={{ paddingLeft: `${0.5 + depth * 1.1}rem` }}
      className={`relative flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left transition-colors ${
        isCurrent ? "text-fg" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  </li>
);

const FileRow = ({ name, depth, isCurrent, onOpen }) => {
  const [Icon, tone] = iconFor(name);
  return (
    <Row depth={depth} isCurrent={isCurrent} onClick={onOpen}>
      <span className="w-3" aria-hidden="true" />
      <Icon size={13} className={`shrink-0 ${tone}`} aria-hidden="true" />
      <span className="truncate">{name}</span>
    </Row>
  );
};

const DirectoryRow = ({ node, isOpen, isActive, activeChildId, onToggle }) => {
  const FolderIcon = isOpen ? FolderOpen : Folder;
  return (
    <>
      <Row depth={1} isCurrent={isActive && !activeChildId} onClick={onToggle} label={`${isOpen ? "Collapse" : "Expand"} ${node.name}`}>
        <ChevronRight size={12} className={`shrink-0 text-faint transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} aria-hidden="true" />
        <FolderIcon size={13} className="shrink-0 text-signal" aria-hidden="true" />
        <span className={`truncate ${isActive ? "text-fg" : ""}`}>{node.name}</span>
      </Row>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.li
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="relative overflow-hidden"
          >
            {/* the indent guide nvim-tree draws down an open folder */}
            <span className="absolute top-0 bottom-1 left-[2.4rem] w-px bg-line" aria-hidden="true" />
            <ul>
              {node.children.map((child) => (
                <FileRow
                  key={child.targetId}
                  name={child.name}
                  depth={2}
                  isCurrent={activeChildId === child.targetId}
                  onOpen={() => scrollToSection(child.targetId)}
                />
              ))}
            </ul>
          </motion.li>
        )}
      </AnimatePresence>
    </>
  );
};

// the section nav on wide screens, drawn as nvim-tree down the left edge. the folder for the section on screen
// opens by itself, the way follow_current_file does, and the cursorline tracks the file you're reading
const FileTree = ({ onOpenCmdline }) => {
  const { data: links = [] } = useGetNavBarQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: repos = [] } = useGetReposQuery();
  const { data: about } = useGetAboutQuery();
  // what the visitor opened or closed by hand wins over following the scroll
  const [toggled, setToggled] = useState({});

  const tree = buildFileTree(
    links.map((link) => sectionIdFromUrl(link.url)),
    { projects, repos, hasCertifications: (about?.certifications ?? []).length > 0 }
  );
  const activeSectionId = useActiveSection(tree.map((node) => node.sectionId));
  const activeNode = tree.find((node) => node.sectionId === activeSectionId);
  const childId = useActiveSection(tree.flatMap((node) => node.children.map((child) => child.targetId)));
  const activeChildId = activeNode?.children.some((child) => child.targetId === childId) ? childId : null;

  const isOpen = (node) => toggled[node.sectionId] ?? node.sectionId === activeSectionId;
  const toggle = (node) => {
    const willOpen = !isOpen(node);
    setToggled((current) => ({ ...current, [node.sectionId]: willOpen }));
    if (willOpen) scrollToSection(node.sectionId);
  };

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: easeOutExpo }}
      aria-label="Sections"
      className="fixed top-0 bottom-7 left-0 z-40 hidden w-64 flex-col border-r border-line bg-panel/60 font-mono text-xs backdrop-blur-xl xl:flex"
    >
      <a href="#home" className="flex items-center gap-2 border-b border-line px-4 py-4 text-muted transition-colors hover:text-fg">
        <FolderOpen size={14} className="text-accent" aria-hidden="true" />
        <span>
          <span className="text-accent">~/</span>cristopher
        </span>
      </a>

      <nav className="flex-1 overflow-y-auto px-2 py-3" data-lenis-prevent>
        <ul className="flex flex-col gap-px">
          {tree.map((node) =>
            node.isDirectory ? (
              <DirectoryRow
                key={node.sectionId}
                node={node}
                isOpen={isOpen(node)}
                isActive={node.sectionId === activeSectionId}
                activeChildId={node.sectionId === activeSectionId ? activeChildId : null}
                onToggle={() => toggle(node)}
              />
            ) : (
              <FileRow
                key={node.sectionId}
                name={node.name}
                depth={1}
                isCurrent={node.sectionId === activeSectionId}
                onOpen={() => scrollToSection(node.sectionId)}
              />
            )
          )}
        </ul>
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 text-[11px] text-faint">
        <span>
          <kbd className="text-muted">?</kbd> help
        </span>
        <button
          type="button"
          onClick={onOpenCmdline}
          className="rounded-full border border-line-strong bg-ink/50 px-3 py-1 text-muted transition-colors hover:text-fg"
          aria-label="Open command line"
        >
          <span className="text-signal">:</span>cmd
        </button>
      </div>
    </motion.aside>
  );
};

export default FileTree;
