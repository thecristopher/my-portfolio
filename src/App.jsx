import { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CommandMenu from "./components/CommandMenu";
import Resume from "./components/Resume";
import Statusline from "./components/Statusline";
import FileTree from "./components/FileTree";
import QuestLog from "./components/QuestLog";
import Hero from "./sections/Hero";
import Manifesto from "./sections/Manifesto";
import About from "./sections/About";
import Work from "./sections/Work";
import Education from "./sections/Education";
import GitHub from "./sections/GitHub";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import { startSmoothScroll } from "./lib/smoothScroll";
import { useVimKeys } from "./hooks/useVimKeys";
import { useColorscheme } from "./hooks/useColorscheme";
import { useActiveSection } from "./hooks/useActiveSection";
import { useGetNavBarQuery } from "./api/navBarApi";
import { sectionIdFromUrl, withManifesto } from "./actions";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-accent" />;
};

const App = () => {
  const [isCmdlineOpen, setIsCmdlineOpen] = useState(false);
  const [isQuestLogOpen, setIsQuestLogOpen] = useState(false);
  const { colorscheme, applyColorscheme } = useColorscheme();
  const { data: links = [] } = useGetNavBarQuery();
  const activeSectionId = useActiveSection(withManifesto(links.map((link) => sectionIdFromUrl(link.url))));

  const openCmdline = useCallback(() => setIsCmdlineOpen(true), []);
  const closeCmdline = useCallback(() => setIsCmdlineOpen(false), []);
  const openQuestLog = useCallback(() => setIsQuestLogOpen(true), []);
  const closeQuestLog = useCallback(() => setIsQuestLogOpen(false), []);

  useEffect(() => startSmoothScroll(), []);
  useVimKeys({ onOpenCmdline: openCmdline, isPaused: isCmdlineOpen || isQuestLogOpen });

  useEffect(() => {
    const toggleOnShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCmdlineOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", toggleOnShortcut);
    return () => window.removeEventListener("keydown", toggleOnShortcut);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-fg focus:px-4 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <FileTree onOpenCmdline={openCmdline} />
      <Navbar onOpenCmdline={openCmdline} />
      {/* on wide screens the file tree takes the left edge, so everything else moves over to make room */}
      <div className="xl:pl-64">
        <main>
          <Hero />
          <Manifesto />
          <About />
          <Work />
          <Education />
          <GitHub />
          <Skills />
          <Contact />
        </main>
        <Footer onOpenCmdline={openCmdline} />
      </div>
      <Statusline
        mode={isCmdlineOpen ? "COMMAND" : "NORMAL"}
        colorscheme={colorscheme}
        activeId={activeSectionId}
        onOpenCmdline={openCmdline}
        onOpenQuestLog={openQuestLog}
      />
      <CommandMenu
        isOpen={isCmdlineOpen}
        onClose={closeCmdline}
        colorscheme={colorscheme}
        onSetColorscheme={applyColorscheme}
        onOpenQuestLog={openQuestLog}
      />
      <QuestLog isOpen={isQuestLogOpen} onClose={closeQuestLog} />
      <Resume />
    </MotionConfig>
  );
};

export default App;
