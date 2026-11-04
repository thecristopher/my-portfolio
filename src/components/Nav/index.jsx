import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Download, Menu, Moon, Sun, X } from "lucide-react";
import { easeOutExpo } from "../../lib/motion";
import { exportResume } from "../../lib/resume/exportResume";
import { otherTheme, setTheme, useTheme } from "../../lib/theme";
import { RELIC_IDS, useFoundRelics } from "../../lib/relics";

const SectionLink = ({ section, isActive }) => (
  <li className="relative">
    {isActive && (
      <motion.span layoutId="active-section" className="absolute inset-0 rounded-full bg-raised" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
    )}
    <a
      href={`#${section.id}`}
      aria-current={isActive ? "true" : undefined}
      className={`relative block rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap transition-colors ${isActive ? "text-fg" : "text-muted hover:text-fg"}`}
    >
      {section.title}
    </a>
  </li>
);

// phones and small laptops get the same sections as a sheet under the bar
const SectionMenu = ({ sections, activeId, onClose }) => {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <motion.ul
      id="section-menu"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
      className="glass absolute inset-x-0 top-full flex flex-col border-b border-line px-4 pt-2 pb-6 lg:hidden"
    >
      {sections.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            onClick={onClose}
            aria-current={activeId === section.id ? "true" : undefined}
            className={`block border-b border-line py-4 text-2xl font-semibold tracking-tight transition-colors ${activeId === section.id ? "text-fg" : "text-muted"}`}
          >
            {section.title}
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={() => {
            onClose();
            exportResume();
          }}
          className="flex w-full items-center justify-between py-4 text-2xl font-semibold tracking-tight text-accent"
        >
          Résumé
          <Download size={20} aria-hidden="true" />
        </button>
      </li>
    </motion.ul>
  );
};

const ThemeToggle = () => {
  const theme = useTheme();
  const next = otherTheme(theme);
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.3, ease: easeOutExpo }}
        >
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

// nothing says relics exist until the first one is found, then this pill keeps the count and opens the log
const RelicCount = ({ onOpen }) => {
  const found = useFoundRelics();
  if (found.length === 0) return null;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted tabular-nums transition-colors hover:text-fg"
      aria-label={`Relics found: ${found.length} of ${RELIC_IDS.length}. Open the relic log`}
    >
      <span className="bg-sunset size-1.5 rotate-45" aria-hidden="true" />
      {found.length}/{RELIC_IDS.length}
    </motion.button>
  );
};

// a hairline of sunset under the bar that fills as the page is read
const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  return <motion.span style={{ scaleX }} className="bg-sunset absolute inset-x-0 bottom-0 h-px origin-left" aria-hidden="true" />;
};

/**
 * The bar across the top in frosted glass: my name, one link per section on wide screens and a sheet with the same
 * list on small ones, the relic count once there is one, the theme toggle and the résumé.
 * @param {{ sections: { id: string, title: string }[], activeId: string, onOpenRelicLog: () => void }} props
 */
const Nav = ({ sections, activeId, onOpenRelicLog }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 24));
  const closeMenu = () => setIsMenuOpen(false);
  const isFrosted = isScrolled || isMenuOpen;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: easeOutExpo }}
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-500 ${isFrosted ? "glass border-line" : "border-transparent"}`}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:px-6" aria-label="Sections">
        <a href="#home" onClick={closeMenu} className="text-[15px] font-semibold tracking-tight whitespace-nowrap">
          Cristopher Cervantes
        </a>

        <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
          {sections.map((section) => (
            <SectionLink key={section.id} section={section} isActive={activeId === section.id} />
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <RelicCount onOpen={onOpenRelicLog} />
          <ThemeToggle />
          <button
            type="button"
            onClick={exportResume}
            className="group ml-1 hidden items-center gap-1.5 rounded-full bg-fg px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] sm:inline-flex"
          >
            Résumé
            <Download size={13} className="transition-transform duration-300 group-hover:translate-y-px" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-controls="section-menu"
            aria-label={isMenuOpen ? "Close the menu" : "Open the menu"}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      {isScrolled && <ReadingProgress />}
      <AnimatePresence>
        {isMenuOpen && (
<SectionMenu sections={sections} activeId={activeId} onClose={closeMenu} />
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Nav;
