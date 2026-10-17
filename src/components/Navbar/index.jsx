import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useActiveSection } from "../../hooks/useActiveSection";
import { bufferNameFor, sectionIdFromUrl } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { INTRO_S } from "../../lib/intro";
import { toggleFileTree, useFileTreeOpen } from "../../lib/fileTree";

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

// the one action every screen of the page leads to, kept in reach the way Apple keeps "Buy" in its product bar.
// it steps aside once you're already on the contact section
const ContactCta = ({ className = "" }) => (
  <a
    href="#contact"
    className={`group inline-flex items-center gap-1 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium whitespace-nowrap text-ink transition-transform duration-300 hover:scale-[1.04] active:scale-[0.97] ${className}`}
  >
    Get in touch
    <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden="true" />
  </a>
);

// wide screens have no top bar, the file tree does the navigating, so the call to action floats on its own once
// the hero is behind you
const FloatingCta = ({ isShown }) => (
  <AnimatePresence>
    {isShown && (
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="fixed top-4 right-6 z-40 hidden items-center gap-3 rounded-full border border-line-strong bg-panel/70 py-1.5 pr-1.5 pl-4 shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--color-shadow)_60%,transparent)] backdrop-blur-xl xl:flex"
      >
        <span className="text-xs font-medium tracking-tight">Cristopher Cervantes</span>
        <ContactCta />
      </motion.div>
    )}
  </AnimatePresence>
);

const Navbar = ({ onOpenCmdline }) => {
  const { data: links = [] } = useGetNavBarQuery();
  const isTreeOpen = useFileTreeOpen();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  const sectionIds = links.map((link) => sectionIdFromUrl(link.url));
  const activeId = useActiveSection(sectionIds);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 40);
    setIsPastHero(latest > window.innerHeight * 0.8);
  });
  const isOnContact = activeId === "contact";

  return (
    <>
      <FloatingCta isShown={isPastHero && !isOnContact} />
      {/* only below xl. wide screens navigate with the file tree, its rail and the keyboard */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: INTRO_S + 0.2, ease: easeOutExpo }}
        className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 xl:hidden"
      >
        {/* the header spans the screen, only the pill takes clicks, so the rail and page under its edges still do */}
        <nav
          className={`pointer-events-auto mx-auto flex h-14 items-center justify-between gap-4 rounded-full border px-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isScrolled
              ? "max-w-4xl border-line-strong bg-panel/70 shadow-[0_10px_40px_-10px_color-mix(in_oklab,var(--color-shadow)_60%,transparent)] backdrop-blur-xl"
              : "max-w-6xl border-transparent bg-transparent"
          }`}
        >
          <a
            href="#home"
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

          <div className="flex items-center gap-1.5">
            {!isOnContact && <ContactCta className="hidden min-[400px]:inline-flex" />}
            <button
              type="button"
              onClick={onOpenCmdline}
              className="flex items-center rounded-full border border-line-strong bg-ink/50 px-3.5 py-1.5 font-mono text-xs text-muted transition-colors hover:text-fg"
              aria-label="Open command line"
            >
              <span className="text-signal">:</span>cmd
            </button>
            {/* phones have no \e to press, so the menu is their way into the file tree */}
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full text-muted hover:text-fg lg:hidden"
              onClick={() => toggleFileTree()}
              aria-expanded={isTreeOpen}
              aria-label={isTreeOpen ? "Close the file tree" : "Open the file tree"}
            >
              {isTreeOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>
    </>
  );
};

export default Navbar;
