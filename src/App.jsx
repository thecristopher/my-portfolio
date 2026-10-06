import { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CommandMenu from "./components/CommandMenu";
import Statusline from "./components/Statusline";
import LineGutter from "./components/LineGutter";
import Hero from "./sections/Hero";
import Manifesto from "./sections/Manifesto";
import About from "./sections/About";
import Work from "./sections/Work";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";
import { startSmoothScroll } from "./lib/smoothScroll";
import { useVimKeys } from "./hooks/useVimKeys";
import { useColorscheme } from "./hooks/useColorscheme";
import { useActiveSection } from "./hooks/useActiveSection";
import { useGetNavBarQuery } from "./api/navBarApi";
import { sectionIdFromUrl } from "./actions";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-accent" />;
};

const App = () => {
  const [isCmdlineOpen, setIsCmdlineOpen] = useState(false);
  const { colorscheme, applyColorscheme } = useColorscheme();
  const { data: links = [] } = useGetNavBarQuery();
  const activeSectionId = useActiveSection(links.map((link) => sectionIdFromUrl(link.url)));

  const openCmdline = useCallback(() => setIsCmdlineOpen(true), []);
  const closeCmdline = useCallback(() => setIsCmdlineOpen(false), []);

  useEffect(() => startSmoothScroll(), []);
  useVimKeys({ onOpenCmdline: openCmdline, isPaused: isCmdlineOpen });

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
      <LineGutter />
      <Navbar onOpenCmdline={openCmdline} />
      <main>
        <Hero />
        <Manifesto />
        <About />
        <Work />
        <Skills />
        <Contact />
      </main>
      <Footer onOpenCmdline={openCmdline} />
      <Statusline
        mode={isCmdlineOpen ? "COMMAND" : "NORMAL"}
        colorscheme={colorscheme}
        activeId={activeSectionId}
      />
      <CommandMenu
        isOpen={isCmdlineOpen}
        onClose={closeCmdline}
        colorscheme={colorscheme}
        onSetColorscheme={applyColorscheme}
      />
    </MotionConfig>
  );
};

export default App;
