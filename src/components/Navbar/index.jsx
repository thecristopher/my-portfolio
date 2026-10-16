import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useActiveSection } from "../../hooks/useActiveSection";
import { bufferNameFor, sectionIdFromUrl } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { TreeList } from "../FileTree";

const BufferTab = ({ sectionId, number, isActive }) => (
  <li className="relative">
    {isActive && (
      <motion.span
        layoutId="active-buffer"
        className="absolute inset-0 rounded-full bg-raised"
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      />
    )}
    <a
      href={`#${sectionId}`}
      aria-current={isActive ? "true" : undefined}
      className={`relative flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs transition-colors ${
        isActive ? "text-fg" : "text-muted hover:text-fg"
      }`}
    >
      <span className={isActive ? "text-accent" : "text-faint"}>{number}</span>
      {bufferNameFor(sectionId)}
    </a>
  </li>
);

const Navbar = ({ onOpenCmdline }) => {
  const { data: links = [] } = useGetNavBarQuery();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionIds = links.map((link) => sectionIdFromUrl(link.url));
  const activeId = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 40));

  const closeMenu = () => setIsMenuOpen(false);

  return (
    // only below xl. wide screens get the file tree down the left edge instead
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: easeOutExpo }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 xl:hidden"
    >
      <nav
        className={`mx-auto flex h-14 items-center justify-between gap-4 rounded-full border px-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? "max-w-4xl border-line-strong bg-panel/70 shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--color-shadow)_60%,transparent)] backdrop-blur-xl"
            : "max-w-6xl border-transparent bg-transparent"
        }`}
      >
        <a
          href="#home"
          onClick={closeMenu}
          className={`overflow-hidden pl-3 font-mono text-xs whitespace-nowrap text-muted transition-all duration-500 hover:text-fg ${
            isScrolled ? "lg:w-0 lg:pl-0 lg:opacity-0" : "lg:opacity-100"
          }`}
        >
          <span className="text-accent">~/</span>cristopher
        </a>

        <ul className="hidden items-center lg:flex">
          {sectionIds.map((sectionId, index) => (
            <BufferTab key={sectionId} sectionId={sectionId} number={index + 1} isActive={activeId === sectionId} />
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenCmdline}
            className="flex items-center rounded-full border border-line-strong bg-ink/50 px-3.5 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
            aria-label="Open command line"
          >
            <span className="text-signal">:</span>cmd
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-muted hover:text-fg lg:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          // on small screens the menu opens the same file tree the sidebar shows on wide ones, with roomier rows for thumbs
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            data-lenis-prevent
            data-search-skip
            className="mt-2 max-h-[70svh] origin-top overflow-y-auto rounded-3xl border border-line-strong bg-panel/95 p-3 font-mono text-sm backdrop-blur-xl lg:hidden [&_button]:py-2.5"
          >
            <p className="flex items-center gap-2 px-2 pb-2 text-xs text-muted">
              <span className="text-accent">~/</span>cristopher
            </p>
            <TreeList group="menu" onNavigate={closeMenu} scrollsOnOpen={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
