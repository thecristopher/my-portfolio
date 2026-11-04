import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionConfig } from "framer-motion";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import RelicLog from "./components/RelicLog";
import Resume from "./components/Resume";
import RelicStage from "./components/Relics/Stage";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Work from "./sections/Work";
import Skills from "./sections/Skills";
import GitHub from "./sections/GitHub";
import Contact from "./sections/Contact";
import { startSmoothScroll } from "./lib/smoothScroll";
import { followSystemTheme } from "./lib/theme";
import { useActiveSection } from "./hooks/useActiveSection";
import { usePageLinks } from "./api/navBarApi";
import { sectionIdFromUrl } from "./actions";

const SECTIONS = { home: Hero, about: About, work: Work, skills: Skills, github: GitHub, contact: Contact };

/** The page: a glass bar on top, one scene per section in between, the relic moments over everything. */
const App = () => {
  const links = usePageLinks();
  const sections = useMemo(
    () => links.map((link) => ({ id: sectionIdFromUrl(link.url), title: link.title })).filter((section) => SECTIONS[section.id]),
    [links]
  );
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeSectionId = useActiveSection(sectionIds);
  const [isRelicLogOpen, setIsRelicLogOpen] = useState(false);
  const openRelicLog = useCallback(() => setIsRelicLogOpen(true), []);
  const closeRelicLog = useCallback(() => setIsRelicLogOpen(false), []);

  useEffect(() => startSmoothScroll(), []);
  useEffect(() => followSystemTheme(), []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav sections={sections} activeId={activeSectionId} onOpenRelicLog={openRelicLog} />
      <main>
        {sectionIds.map((id) => {
          const Section = SECTIONS[id];
          return <Section key={id} />;
        })}
      </main>
      <Footer />
      <RelicLog isOpen={isRelicLogOpen} sections={sections} onClose={closeRelicLog} />
      <Toast />
      <Resume />
      <RelicStage />
    </MotionConfig>
  );
};

export default App;
