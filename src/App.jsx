import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import Bufferline from "./components/Bufferline";
import FileTree from "./components/FileTree";
import Statusline from "./components/Statusline";
import Telescope from "./components/Telescope";
import WhichKey from "./components/WhichKey";
import QuestLog from "./components/QuestLog";
import SearchLine from "./components/SearchLine";
import HintMode from "./components/HintMode";
import Banner from "./components/Banner";
import Rest from "./components/Rest";
import Hub from "./components/Hub";
import Pointer from "./components/Pointer";
import Footer from "./components/Footer";
import Resume from "./components/Resume";
import RelicStage from "./components/Relics/Stage";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Work from "./sections/Work";
import Skills from "./sections/Skills";
import GitHub from "./sections/GitHub";
import Contact from "./sections/Contact";
import { startSmoothScroll } from "./lib/smoothScroll";
import { earnRunes } from "./lib/runes";
import { useVimKeys } from "./hooks/useVimKeys";
import { useActiveSection } from "./hooks/useActiveSection";
import { usePageLinks } from "./api/navBarApi";
import { sectionIdFromUrl } from "./actions";
import { buildLeaderBindings } from "./lib/leader";

const SECTIONS = { home: Hero, about: About, work: Work, skills: Skills, github: GitHub, contact: Contact };

// which dialogs are open, and the mode the statusline shows for them
const useDialogs = () => {
  const [open, setOpen] = useState({ telescope: false, telescopeQuery: "", quests: false, search: false, hints: false, whichKey: false });
  const set = useCallback((patch) => setOpen((current) => ({ ...current, ...patch })), []);
  const handlers = useMemo(
    () => ({
      openTelescope: (query = "") => set({ telescope: true, telescopeQuery: typeof query === "string" ? query : "" }),
      closeTelescope: () => set({ telescope: false }),
      openRegions: () => set({ telescope: true, telescopeQuery: "region " }),
      openQuests: () => set({ quests: true }),
      closeQuests: () => set({ quests: false }),
      openSearch: () => set({ search: true }),
      closeSearch: () => set({ search: false }),
      openHints: () => set({ hints: true }),
      closeHints: () => set({ hints: false }),
      openWhichKey: () => set({ whichKey: true }),
      closeWhichKey: () => set({ whichKey: false }),
    }),
    [set]
  );
  const isAnyOpen = open.telescope || open.quests || open.search || open.hints || open.whichKey;
  const mode = open.telescope ? "COMMAND" : open.search ? "SEARCH" : open.hints ? "HINT" : "NORMAL";
  return { open, handlers, isAnyOpen, mode };
};

/** The page as an nvim session: bufferline on top, lualine at the bottom, one buffer per section in between. */
const App = () => {
  const links = usePageLinks();
  const sectionIds = useMemo(() => links.map((link) => sectionIdFromUrl(link.url)).filter((id) => SECTIONS[id]), [links]);
  const activeSectionId = useActiveSection(sectionIds);
  const { open, handlers, isAnyOpen, mode } = useDialogs();
  const leaderBindings = useMemo(() => buildLeaderBindings(handlers), [handlers]);

  useEffect(() => startSmoothScroll(), []);

  // every buffer you open pays a few runes, once, like the first visit to an area
  useEffect(() => {
    if (activeSectionId) earnRunes("section", `section:${activeSectionId}`);
  }, [activeSectionId]);

  useVimKeys({
    onOpenCmdline: handlers.openTelescope,
    onOpenSearch: handlers.openSearch,
    onOpenHints: handlers.openHints,
    onOpenWhichKey: handlers.openWhichKey,
    sectionIds,
    bufferIds: sectionIds,
    isPaused: isAnyOpen,
  });

  useEffect(() => {
    const toggleOnShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handlers.openTelescope();
      }
    };
    window.addEventListener("keydown", toggleOnShortcut);
    return () => window.removeEventListener("keydown", toggleOnShortcut);
  }, [handlers]);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Bufferline sectionIds={sectionIds} activeId={activeSectionId} onOpenRegions={handlers.openRegions} />
      <FileTree />
      {/* on wide screens an open file tree takes the left edge. the sections still run edge to edge underneath it,
          only their content moves over to make room (see .clears-tree) */}
      <div className="clears-tree">
        <main>
          {sectionIds.map((id, index) => {
            const Section = SECTIONS[id];
            return <Section key={id} number={index + 1} />;
          })}
        </main>
        <Footer />
      </div>
      <Statusline mode={mode} activeId={activeSectionId} onOpenQuestLog={handlers.openQuests} onOpenRegions={handlers.openRegions} />
      <Telescope
        isOpen={open.telescope}
        initialQuery={open.telescopeQuery}
        onClose={handlers.closeTelescope}
        onOpenQuestLog={handlers.openQuests}
        onOpenSearch={handlers.openSearch}
        onOpenWhichKey={handlers.openWhichKey}
      />
      <WhichKey isOpen={open.whichKey} bindings={leaderBindings} onClose={handlers.closeWhichKey} />
      <AnimatePresence>{open.search && <SearchLine onClose={handlers.closeSearch} />}</AnimatePresence>
      <QuestLog isOpen={open.quests} onClose={handlers.closeQuests} />
      <Resume />
      {open.hints && <HintMode onClose={handlers.closeHints} />}
      <RelicStage />
      <Banner />
      <Rest isBusy={() => isAnyOpen} />
      <Hub />
      <Pointer />
    </MotionConfig>
  );
};

export default App;
