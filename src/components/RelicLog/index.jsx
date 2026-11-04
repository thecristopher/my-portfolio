import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { COMPLETION_QUIP, RELICS, RELIC_IDS, isComplete, useFoundRelics } from "../../lib/relics";
import { pauseSmoothScroll, resumeSmoothScroll, scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";
import { relicLogOrder, sectionTitleFor } from "./actions";

const FoundRelic = ({ id }) => (
  <>
    <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: RELICS[id].color, boxShadow: `0 0 10px ${RELICS[id].color}` }} />
    <span className="flex min-w-0 flex-col gap-1">
      <span className="font-medium">
        {RELICS[id].franchise} <span className="font-normal text-faint">· {RELICS[id].name}</span>
      </span>
      <span className="leading-relaxed text-pretty text-muted">{RELICS[id].quip}</span>
    </span>
  </>
);

// an open relic names the section and gives a riddle, never the spot, so the hunt stays a hunt
const OpenRelic = ({ id, sections, onGo }) => (
  <>
    <span className="mt-1.5 size-2.5 shrink-0 rounded-full border border-line-strong" />
    <span className="flex min-w-0 flex-col gap-1">
      <span className="text-faint">Not found yet</span>
      <span className="leading-relaxed text-pretty text-muted">{RELICS[id].riddle}</span>
      <button type="button" onClick={() => onGo(RELICS[id].section)} className="group flex w-fit items-center gap-1 text-accent">
        {sectionTitleFor(sections, RELICS[id].section)}
        <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </span>
  </>
);

const Log = ({ sections, onClose }) => {
  const found = useFoundRelics();

  const goTo = (sectionId) => {
    onClose();
    // lenis drops scrollTo calls while stopped
    resumeSmoothScroll();
    scrollToSection(sectionId);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Relic log"
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 8 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
      onClick={(event) => event.stopPropagation()}
      className="card mx-auto flex max-h-[76vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl text-sm"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-6 pb-5">
        <div className="flex flex-col gap-2">
          <p className="text-2xl font-semibold tracking-tight">Relics</p>
          <p className="text-muted">
            {found.length} of {RELIC_IDS.length} found. Each one is hidden somewhere on the page.
          </p>
          <span className="flex gap-1.5" aria-hidden="true">
            {RELIC_IDS.map((id) => (
              <span key={id} className="h-1 w-5 rounded-full bg-line" style={found.includes(id) ? { background: RELICS[id].color } : undefined} />
            ))}
          </span>
        </div>
        <button type="button" onClick={onClose} className="grid size-8 place-items-center rounded-full bg-raised text-muted transition-colors hover:text-fg" aria-label="Close">
          <X size={15} />
        </button>
      </div>

      {isComplete(found) && <p className="text-sunset border-b border-line px-6 py-3 font-medium">{COMPLETION_QUIP}</p>}

      <ul className="flex flex-col divide-y divide-line overflow-y-auto px-6" data-lenis-prevent>
        {relicLogOrder(RELIC_IDS, found).map((id) => (
          <li key={id} className="flex gap-3 py-4">
            {found.includes(id) ? <FoundRelic id={id} /> : <OpenRelic id={id} sections={sections} onGo={goTo} />}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

/**
 * Every relic on the page: what each found one said, and a riddle for each of the rest.
 * @param {{ isOpen: boolean, sections: { id: string, title: string }[], onClose: () => void }} props
 */
const RelicLog = ({ isOpen, sections, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    pauseSmoothScroll();
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      resumeSmoothScroll();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 backdrop-blur-sm"
        >
          <Log sections={sections} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RelicLog;
