import { useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Download, Menu, X } from "lucide-react";
import { bufferNameFor } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { INTRO_S } from "../../lib/intro";
import { toggleFileTree, useFileTreeOpen } from "../../lib/fileTree";
import { exportResume } from "../../lib/resume/exportResume";
import { useRegion } from "../../hooks/useRegion";
import FileIcon from "../FileIcon";

const BufferTab = ({ sectionId, number, isActive }) => (
  <li className="relative">
    {isActive && (
      <motion.span
        layoutId="active-buffer"
        className="absolute inset-0 rounded-md bg-raised"
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        {/* bufferline's indicator: a short bar of the region's gold under the buffer you're in */}
        <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
      </motion.span>
    )}
    <a
      href={`#${sectionId}`}
      aria-current={isActive ? "true" : undefined}
      className={`relative flex items-center gap-1.5 px-2 py-1.5 font-mono text-[11px] whitespace-nowrap transition-colors 2xl:px-3 ${
        isActive ? "text-fg" : "text-faint hover:text-muted"
      }`}
    >
      <span className={isActive ? "text-accent" : ""}>{number}</span>
      <FileIcon name={bufferNameFor(sectionId)} size={12} />
      {bufferNameFor(sectionId)}
    </a>
  </li>
);

/**
 * The bar across the top: nvim's bufferline drawn in Apple's frosted glass. One buffer per section, the region
 * you woke up in, and the resume one click away on every screen, the way Apple keeps "Buy" in its product bar.
 */
const Bufferline = ({ sectionIds, activeId, onOpenRegions }) => {
  const isTreeOpen = useFileTreeOpen();
  const { region } = useRegion();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 24));

  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: INTRO_S + 0.1, ease: easeOutExpo }}
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-500 ${isScrolled ? "glass hairline" : "border-transparent"}`}
    >
      <nav className="mx-auto flex h-12 items-center gap-3 px-3 sm:px-4" aria-label="Sections">
        {/* phones have no \e to press, so the menu is their way into the file tree */}
        <button
          type="button"
          className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-raised hover:text-fg"
          onClick={() => toggleFileTree({ focus: true })}
          aria-expanded={isTreeOpen}
          aria-label={isTreeOpen ? "Close the file tree" : "Open the file tree"}
        >
          {isTreeOpen ? <X size={17} /> : <Menu size={17} />}
        </button>
        <a href="#home" className="font-mono text-xs whitespace-nowrap text-muted transition-colors hover:text-fg">
          <span className="text-accent">~/</span>cristopher
        </a>

        {/* the tabs need about 1400px, below that the neo-tree rail and the keys do the navigating */}
        <ul className="mx-auto hidden items-center gap-0.5 min-[1400px]:flex">
          {sectionIds.map((sectionId, index) => (
            <BufferTab key={sectionId} sectionId={sectionId} number={index + 1} isActive={activeId === sectionId} />
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 min-[1400px]:ml-0">
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
    </motion.header>
  );
};

export default Bufferline;
