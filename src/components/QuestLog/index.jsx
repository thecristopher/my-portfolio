import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { COMPLETION_QUIP, RELICS, RELIC_IDS, isComplete, relicCount, useFoundRelics } from "../../lib/relics";
import { bufferNameFor } from "../../actions";
import { pauseSmoothScroll, resumeSmoothScroll, scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";

const Dot = ({ color }) => <span className="mt-1 size-2 shrink-0 rounded-full" style={color ? { background: color, boxShadow: `0 0 8px ${color}` } : undefined} />;

const FoundQuest = ({ id }) => (
  <>
    <Dot color={RELICS[id].color} />
    <span className="flex min-w-0 flex-col gap-1">
      <span className="text-fg">
        {RELICS[id].franchise} <span className="text-faint">· {RELICS[id].name}</span>
      </span>
      <span className="leading-relaxed text-pretty text-muted">{RELICS[id].quip}</span>
    </span>
  </>
);

// an open quest names the buffer and gives a riddle, never the spot, so the hunt stays a hunt
const OpenQuest = ({ id, onGo }) => (
  <>
    <span className="mt-1 size-2 shrink-0 rounded-full bg-line-strong" />
    <span className="flex min-w-0 flex-col gap-1">
      <span className="text-faint">???</span>
      <span className="leading-relaxed text-pretty text-muted">{RELICS[id].riddle}</span>
      <button type="button" onClick={() => onGo(RELICS[id].section)} className="flex w-fit items-center gap-1.5 text-accent transition-colors hover:text-fg">
        <MapPin size={11} aria-hidden="true" /> :e {bufferNameFor(RELICS[id].section)}
      </button>
    </span>
  </>
);

const Log = ({ onClose }) => {
  const found = useFoundRelics();
  // found ones float to the top, in page order
  const ordered = [...RELIC_IDS.filter((id) => found.includes(id)), ...RELIC_IDS.filter((id) => !found.includes(id))];

  const goTo = (sectionId) => {
    onClose();
    // lenis drops scrollTo calls while stopped, same as telescope
    resumeSmoothScroll();
    scrollToSection(sectionId);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Quest log"
      initial={{ opacity: 0, scale: 0.96, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      onClick={(event) => event.stopPropagation()}
      className="mx-auto flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-panel/95 font-mono text-xs shadow-[0_40px_120px_-20px_color-mix(in_oklab,var(--color-shadow)_90%,transparent)] backdrop-blur-xl"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <p className="text-sm text-fg">
          <span className="text-accent">:</span>quests
        </p>
        <span className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {RELIC_IDS.map((id) => (
              <span
                key={id}
                className="size-1.5 rounded-full bg-line-strong"
                style={found.includes(id) ? { background: RELICS[id].color } : undefined}
              />
            ))}
          </span>
          <span className="text-faint tabular-nums">{relicCount(found)}</span>
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-faint">esc</kbd>
        </span>
      </div>

      {isComplete(found) && <p className="border-b border-line px-5 py-3 text-string">✦ {COMPLETION_QUIP}</p>}

      <ul className="flex flex-col divide-y divide-line overflow-y-auto px-5" data-lenis-prevent>
        {ordered.map((id) => (
          <li key={id} className="flex gap-3 py-3.5">
            {found.includes(id) ? <FoundQuest id={id} /> : <OpenQuest id={id} onGo={goTo} />}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

/** Every relic on the page: what each found one said, and a riddle for each of the rest. */
const QuestLog = ({ isOpen, onClose }) => {
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
          className="fixed inset-0 z-50 bg-ink/60 px-4 pt-[14vh] backdrop-blur-sm"
        >
          <Log onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuestLog;
