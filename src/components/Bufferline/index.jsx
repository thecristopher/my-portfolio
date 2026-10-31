import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import { easeOutExpo } from "../../lib/motion";
import { INTRO_S } from "../../lib/intro";
import { exportResume } from "../../lib/resume/exportResume";
import { useRegion } from "../../hooks/useRegion";

const SectionTab = ({ section, number, isActive }) => (
  <li className="relative">
    {isActive && (
      <motion.span
        layoutId="active-buffer"
        className="absolute inset-0 rounded-md bg-raised"
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        {/* bufferline's indicator: a short bar of the region's gold under the section you're in */}
        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
      </motion.span>
    )}
    <a
      href={`#${section.id}`}
      aria-current={isActive ? "true" : undefined}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${isActive ? "text-fg" : "text-muted hover:text-fg"}`}
    >
      <span className={`font-mono text-[11px] ${isActive ? "text-accent" : "text-faint"}`}>{number}</span>
      {section.title}
    </a>
  </li>
);

// phones and small laptops get the same sections as a plain list under the bar
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
      transition={{ duration: 0.25, ease: easeOutExpo }}
      className="hairline absolute inset-x-0 top-12 flex flex-col border-b bg-mantle px-3 py-2 shadow-2xl lg:hidden"
    >
      {sections.map((section, index) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            onClick={onClose}
            aria-current={activeId === section.id ? "true" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors hover:bg-raised ${activeId === section.id ? "text-fg" : "text-muted"}`}
          >
            <span className={`font-mono text-xs ${activeId === section.id ? "text-accent" : "text-faint"}`}>{index + 1}</span>
            {section.title}
          </a>
        </li>
      ))}
    </motion.ul>
  );
};

/**
 * The bar across the top in Apple's frosted glass: one tab per section on wide screens, a menu with the same list on
 * small ones, the region you woke up in, and the résumé one click away on every screen.
 * @param {{ sections: { id: string, title: string }[], activeId: string, onOpenRegions: () => void }} props
 */
const Bufferline = ({ sections, activeId, onOpenRegions }) => {
  const { region } = useRegion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 24));
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: INTRO_S + 0.1, ease: easeOutExpo }}
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-500 ${isScrolled || isMenuOpen ? "glass hairline" : "border-transparent"}`}
    >
      <nav className="mx-auto flex h-12 max-w-6xl items-center gap-3 px-3 sm:px-6" aria-label="Sections">
        <button
          type="button"
          className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-fg lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="section-menu"
          aria-label={isMenuOpen ? "Close the menu" : "Open the menu"}
        >
          {isMenuOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
        <a href="#home" onClick={closeMenu} className="font-mono text-xs whitespace-nowrap text-muted transition-colors hover:text-fg">
          <span className="text-accent">~/</span>cristopher
        </a>

        <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
          {sections.map((section, index) => (
            <SectionTab key={section.id} section={section} number={index + 1} isActive={activeId === section.id} />
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
          <button
            type="button"
            onClick={onOpenRegions}
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[11px] tracking-[0.18em] text-muted uppercase transition-colors hover:bg-raised hover:text-fg sm:flex"
            aria-label={`Region: ${region.title}. Travel to another region`}
          >
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden="true" />
            {region.title}
          </button>
          <button
            type="button"
            onClick={exportResume}
            className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97]"
          >
            Résumé
            <Download size={13} className="transition-transform duration-300 group-hover:translate-y-px" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <AnimatePresence>{isMenuOpen && <SectionMenu sections={sections} activeId={activeId} onClose={closeMenu} />}</AnimatePresence>
    </motion.header>
  );
};

export default Bufferline;
