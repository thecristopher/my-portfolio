import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useActiveSection } from "../../hooks/useActiveSection";
import { bufferNameFor, sectionIdFromUrl } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

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
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.2, ease: easeOutExpo }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3"
    >
      <nav
        className={`mx-auto flex h-14 items-center justify-between gap-4 rounded-full border px-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isScrolled
            ? "max-w-3xl border-line-strong bg-panel/70 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            : "max-w-6xl border-transparent bg-transparent"
        }`}
      >
        <a
          href="#home"
          onClick={closeMenu}
          className={`overflow-hidden pl-3 font-mono text-xs whitespace-nowrap text-muted transition-all duration-500 hover:text-fg ${
            isScrolled ? "md:w-0 md:pl-0 md:opacity-0" : "md:opacity-100"
          }`}
        >
          <span className="text-accent">~/</span>cristopher
        </a>

        <ul className="hidden items-center md:flex">
          {sectionIds.map((sectionId, index) => (
            <BufferTab key={sectionId} sectionId={sectionId} number={index + 1} isActive={activeId === sectionId} />
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenCmdline}
            className="hidden items-center rounded-full border border-line-strong bg-ink/50 px-3.5 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg md:flex"
            aria-label="Open command line"
          >
            <span className="text-signal">:</span>cmd
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-muted hover:text-fg md:hidden"
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
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="mt-2 rounded-3xl border border-line-strong bg-panel/95 px-5 py-2 font-mono backdrop-blur-xl md:hidden"
          >
            {sectionIds.map((sectionId, index) => (
              <li key={sectionId} className="border-b border-line last:border-0">
                <a href={`#${sectionId}`} onClick={closeMenu} className="flex items-baseline gap-3 py-4 text-base">
                  <span className="text-xs text-accent">{index + 1}</span>
                  {bufferNameFor(sectionId)}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
