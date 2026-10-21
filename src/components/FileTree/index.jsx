import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ChevronRight, FileClock, FileCode, FileCog, FileJson, FileTerminal, FileText, Folder, FolderOpen, FolderTree, GitBranch, X } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetReposQuery } from "../../api/githubApi";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetCaseStudiesQuery } from "../../api/caseStudiesApi";
import { useActiveSection } from "../../hooks/useActiveSection";
import { buildFileTree, sectionIdFromUrl } from "../../actions";
import { scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { closeFileTree, toggleFileTree, useFileTreeOpen } from "../../lib/fileTree";

// every filetype in the color it's known by, the way nvim-web-devicons paints them
const FILE_ICONS = {
  tsx: [FileCode, "text-ft-react"],
  md: [FileText, "text-ft-markdown"],
  json: [FileJson, "text-ft-json"],
  toml: [FileCog, "text-ft-toml"],
  yml: [FileCog, "text-ft-yaml"],
  lua: [FileCode, "text-ft-lua"],
  sh: [FileTerminal, "text-ft-shell"],
  log: [FileClock, "text-ft-log"],
  git: [GitBranch, "text-ft-git"],
};

const iconFor = (name) => FILE_ICONS[name.split(".").pop()] ?? [FileText, "text-faint"];

const Row = ({ depth, isCurrent, onClick, children, label, data = {} }) => (
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
      {...data}
      style={{ paddingLeft: `${0.5 + depth * 1.1}rem` }}
      className={`relative flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/70 ${
        isCurrent ? "text-fg" : "text-muted hover:text-fg"
      }`}
    >
      {children}
    </button>
  </li>
);

const FileRow = ({ name, depth, isCurrent, onOpen, parentId }) => {
  const [Icon, tone] = iconFor(name);
  return (
    <Row depth={depth} isCurrent={isCurrent} onClick={onOpen} data={parentId ? { "data-parent": parentId } : {}}>
      <span className="w-3" aria-hidden="true" />
      <Icon size={13} className={`shrink-0 ${tone}`} aria-hidden="true" />
      <span className="truncate">{name}</span>
    </Row>
  );
};

const DirectoryRow = ({ node, isOpen, isActive, activeChildId, onToggle, onOpenFile }) => {
  const FolderIcon = isOpen ? FolderOpen : Folder;
  return (
    <>
      <Row
        depth={1}
        isCurrent={isActive && !activeChildId}
        onClick={onToggle}
        label={`${isOpen ? "Collapse" : "Expand"} ${node.name}`}
        data={{ "data-dir": node.sectionId, "aria-expanded": isOpen }}
      >
        <ChevronRight size={12} className={`shrink-0 text-faint transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} aria-hidden="true" />
        <FolderIcon size={13} className="shrink-0 text-signal" aria-hidden="true" />
        <span className={`truncate ${isActive ? "text-fg" : ""}`}>{node.name}</span>
        <span className="ml-auto pl-2 text-[10px] tabular-nums text-faint">{node.children.length}</span>
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
            {/* the indent guide neo-tree draws down an open folder */}
            <span className="absolute top-0 bottom-1 left-[2.4rem] w-px bg-line" aria-hidden="true" />
            <ul>
              {node.children.map((child) => (
                <FileRow
                  key={child.targetId}
                  name={child.name}
                  depth={2}
                  isCurrent={activeChildId === child.targetId}
                  onOpen={() => onOpenFile(child.targetId)}
                  parentId={node.sectionId}
                />
              ))}
            </ul>
          </motion.li>
        )}
      </AnimatePresence>
    </>
  );
};

// neo-tree's own keys while a row has focus: j/k walk the rows, l opens, h closes or climbs to the parent folder,
// q closes the tree and esc hands focus back to the page
const walkTree = (event, { toggleDirectory }) => {
  const rows = [...event.currentTarget.querySelectorAll("button")];
  const row = event.target.closest("button");
  const at = rows.indexOf(row);
  if (at === -1) return;
  const focusRow = (index) => rows[Math.max(0, Math.min(rows.length - 1, index))]?.focus();
  const directory = row.dataset.dir;
  const isOpen = row.getAttribute("aria-expanded") === "true";

  const keys = {
    j: () => focusRow(at + 1),
    ArrowDown: () => focusRow(at + 1),
    k: () => focusRow(at - 1),
    ArrowUp: () => focusRow(at - 1),
    G: () => focusRow(rows.length - 1),
    l: () => (directory && !isOpen ? toggleDirectory(directory, true) : row.click()),
    ArrowRight: () => (directory && !isOpen ? toggleDirectory(directory, true) : row.click()),
    h: () => (directory ? isOpen && toggleDirectory(directory, false) : rows.find((each) => each.dataset.dir === row.dataset.parent)?.focus()),
    ArrowLeft: () => (directory ? isOpen && toggleDirectory(directory, false) : rows.find((each) => each.dataset.dir === row.dataset.parent)?.focus()),
    Escape: () => row.blur(),
    // neo-tree's own key for closing the tree
    q: () => closeFileTree(),
  };

  const action = keys[event.key];
  if (!action) return;
  event.preventDefault();
  event.stopPropagation();
  action();
};

// the tree itself. every folder starts open, so the whole site reads at a glance, and the cursorline tracks the
// file you're reading the way follow_current_file does
const TreeList = ({ group, onNavigate, scrollsOnOpen = true, ...props }) => {
  const { data: links = [] } = useGetNavBarQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: repos = [] } = useGetReposQuery();
  const { data: about } = useGetAboutQuery();
  const { data: caseStudies = [] } = useGetCaseStudiesQuery();
  // what the visitor opened or closed by hand wins over following the scroll
  const [toggled, setToggled] = useState({});

  const tree = buildFileTree(
    links.map((link) => sectionIdFromUrl(link.url)),
    { projects, caseStudies, repos, hasCertifications: (about?.certifications ?? []).length > 0 }
  );
  const activeSectionId = useActiveSection(tree.map((node) => node.sectionId));
  const activeNode = tree.find((node) => node.sectionId === activeSectionId);
  const childId = useActiveSection(tree.flatMap((node) => node.children.map((child) => child.targetId)));
  const activeChildId = activeNode?.children.some((child) => child.targetId === childId) ? childId : null;

  const isOpen = (node) => toggled[node.sectionId] ?? true;
  const setDirectory = (sectionId, open) => setToggled((current) => ({ ...current, [sectionId]: open }));
  const toggle = (node) => {
    const willOpen = !isOpen(node);
    setDirectory(node.sectionId, willOpen);
    if (willOpen && scrollsOnOpen) scrollToSection(node.sectionId);
  };
  const openFile = (targetId) => {
    scrollToSection(targetId);
    onNavigate?.();
  };

  return (
    <LayoutGroup id={group}>
      <ul className="flex flex-col gap-px" onKeyDown={(event) => walkTree(event, { toggleDirectory: setDirectory })} {...props}>
        {tree.map((node) =>
          node.isDirectory ? (
            <DirectoryRow
              key={node.sectionId}
              node={node}
              isOpen={isOpen(node)}
              isActive={node.sectionId === activeSectionId}
              activeChildId={node.sectionId === activeSectionId ? activeChildId : null}
              onToggle={() => toggle(node)}
              onOpenFile={openFile}
            />
          ) : (
            <FileRow
              key={node.sectionId}
              name={node.name}
              depth={1}
              isCurrent={node.sectionId === activeSectionId}
              onOpen={() => openFile(node.sectionId)}
            />
          )
        )}
      </ul>
    </LayoutGroup>
  );
};

// the tree folded down to a rail while it's closed, drawn like the statusline but standing on its edge. one icon per
// section, lit for the one you're reading, so it reads as the tree and says there's more behind it
const TreeRail = () => {
  const { data: links = [] } = useGetNavBarQuery();
  const tree = buildFileTree(links.map((link) => sectionIdFromUrl(link.url)));
  const activeSectionId = useActiveSection(tree.map((node) => node.sectionId));

  return (
    <motion.nav
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 38 }}
      aria-label="Sections"
      data-search-skip
      className="fixed top-12 bottom-7 left-0 z-30 flex w-10 flex-col items-center border-r border-line bg-panel/95 py-2 font-mono text-[11px] backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => toggleFileTree({ focus: true })}
        aria-label="Open the file tree"
        title="Open the file tree (\e)"
        className="grid size-8 place-items-center rounded-md text-accent transition-colors hover:bg-raised"
      >
        <FolderTree size={15} aria-hidden="true" />
      </button>
      <span className="my-2 h-px w-5 bg-line" aria-hidden="true" />

      <ul className="flex flex-col items-center gap-0.5">
        {tree.map((node) => {
          const isActive = node.sectionId === activeSectionId;
          const [Icon, tone] = node.isDirectory ? [isActive ? FolderOpen : Folder, "text-signal"] : iconFor(node.name);
          return (
            <li key={node.sectionId} className="relative">
              {isActive && (
                <motion.span
                  layoutId="rail-cursorline"
                  className="absolute inset-0 rounded-md bg-raised"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <button
                type="button"
                onClick={() => scrollToSection(node.sectionId)}
                aria-label={node.name}
                aria-current={isActive ? "true" : undefined}
                title={node.name}
                className={`relative grid size-8 place-items-center rounded-md transition-opacity hover:opacity-100 ${isActive ? "opacity-100" : "opacity-55"}`}
              >
                <Icon size={14} className={tone} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* the key that opens it, written down the rail the way a vertical tab label reads */}
      <button
        type="button"
        onClick={() => toggleFileTree({ focus: true })}
        className="mt-auto py-2 text-faint transition-colors [writing-mode:vertical-rl] hover:text-fg"
        tabIndex={-1}
        aria-hidden="true"
      >
        <span className="rotate-180 inline-block">
          <span className="text-muted">\e</span> Neo-tree
        </span>
      </button>
    </motion.nav>
  );
};

// neo-tree as a split down the left edge, toggled by \e, :tree, the statusline or the phone menu. on wide screens the
// page moves over to make room, the way a split does. on smaller ones it slides over the page and a pick closes it
const FileTree = () => {
  const isOpen = useFileTreeOpen();
  const isWide = useMediaQuery("(min-width: 80rem)");
  const prefersReducedMotion = useReducedMotion();
  const slide = prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38 };

  return (
    <AnimatePresence>
      {!isOpen && isWide && <TreeRail key="rail" />}
      {isOpen && (
        <>
          {!isWide && (
            <motion.button
              key="scrim"
              type="button"
              aria-label="Close the file tree"
              onClick={closeFileTree}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm"
            />
          )}
          <motion.aside
            key="tree"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={slide}
            aria-label="Sections"
            data-search-skip
            className="fixed top-12 bottom-7 left-0 z-50 flex w-[min(20rem,85vw)] flex-col border-r border-line bg-panel/95 font-mono text-sm backdrop-blur-xl xl:z-40 xl:w-64 xl:bg-panel/80 xl:text-xs"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line py-2 pr-2 pl-4">
              <a href="#home" onClick={() => !isWide && closeFileTree()} className="flex items-center gap-2 py-1.5 text-muted transition-colors hover:text-fg">
                <FolderOpen size={14} className="text-accent" aria-hidden="true" />
                <span>
                  <span className="text-accent">~/</span>cristopher
                </span>
              </a>
              <button
                type="button"
                onClick={closeFileTree}
                aria-label="Close the file tree"
                className="grid size-8 place-items-center rounded-md text-faint transition-colors hover:bg-raised hover:text-fg"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>

            {/* roomier rows for thumbs below xl */}
            <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-2 max-xl:[&_button]:py-2" data-lenis-prevent data-file-tree>
              <TreeList group="tree" onNavigate={isWide ? undefined : closeFileTree} scrollsOnOpen={isWide} />
            </nav>

            <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-[11px] text-faint">
              <span className="hidden xl:inline">
                <kbd className="text-muted">{"\\e"}</kbd> toggle · <kbd className="text-muted">q</kbd> close
              </span>
              <span className="xl:hidden">tap a file to jump</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default FileTree;
