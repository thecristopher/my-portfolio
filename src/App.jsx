import { useEffect, useMemo } from "react";
import { MotionConfig } from "framer-motion";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Loader from "./components/Loader";
import Toast from "./components/Toast";
import Resume from "./components/Resume";
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

/** The page: the loader first, then a glass bar on top and one scene per section in between. */
const App = () => {
  const links = usePageLinks();
  const sections = useMemo(
    () => links.map((link) => ({ id: sectionIdFromUrl(link.url), title: link.title })).filter((section) => SECTIONS[section.id]),
    [links]
  );
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeSectionId = useActiveSection(sectionIds);

  useEffect(() => startSmoothScroll(), []);
  useEffect(() => followSystemTheme(), []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav sections={sections} activeId={activeSectionId} />
      <main>
        {sectionIds.map((id) => {
          const Section = SECTIONS[id];
          return <Section key={id} />;
        })}
      </main>
      <Footer />
      <Toast />
      <Resume />
      <Loader />
    </MotionConfig>
  );
};

export default App;
