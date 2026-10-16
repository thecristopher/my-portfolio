import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, MapPin } from "lucide-react";
import { COMPLETION_QUIP, SECRETS, SECRET_IDS, hintFor, isComplete, secretCount, useFoundSecrets } from "../../lib/secrets";
import { sectionIdForBuffer } from "../../actions";
import { pauseSmoothScroll, resumeSmoothScroll, scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";

// the riddles count from the moment the page opened, not from when the log did
const OPENED_AT = Date.now();

const formatCountdown = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

const useElapsed = () => {
  const [elapsed, setElapsed] = useState(() => Date.now() - OPENED_AT);
  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - OPENED_AT), 1000);
    return () => clearInterval(timer);
  }, []);
  return elapsed;
};

const FoundQuest = ({ id }) => (
  <>
    <span className="mt-1 size-2 shrink-0 rounded-full" style={{ background: SECRETS[id].color, boxShadow: `0 0 8px ${SECRETS[id].color}` }} />
    <span className="flex min-w-0 flex-col gap-1">
      <span className="text-fg">{SECRETS[id].name}</span>
      <span className="leading-relaxed text-pretty text-muted">{SECRETS[id].quip}</span>
    </span>
  </>
);

const OpenQuest = ({ id, elapsed, onGo }) => {
  const hint = hintFor(id, elapsed);
  return (
    <>
      <span className="mt-1 size-2 shrink-0 rounded-full bg-line-strong" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-faint">???</span>
        {!hint.isLocked && (
          <>
            <span className="leading-relaxed text-pretty text-muted">{hint.riddle}</span>
            <button
              type="button"
              onClick={() => onGo(hint.where)}
              className="flex w-fit items-center gap-1.5 text-signal transition-colors hover:text-accent"
            >
              <MapPin size={11} aria-hidden="true" /> :e {hint.where}
            </button>
          </>
        )}
      </span>
    </>
  );
};

const Log = ({ onClose }) => {
  const found = useFoundSecrets();
  const elapsed = useElapsed();
  // found ones float to the top, in the order the secrets are listed
  const ordered = [...SECRET_IDS.filter((id) => found.includes(id)), ...SECRET_IDS.filter((id) => !found.includes(id))];
  const lock = hintFor(SECRET_IDS[0], elapsed);

  const goTo = (bufferName) => {
    onClose();
    // lenis drops scrollTo calls while stopped, same as the command line
    resumeSmoothScroll();
    scrollToSection(sectionIdForBuffer(bufferName));
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
          <span className="text-signal">:</span>quests
        </p>
        <span className="flex items-center gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {SECRET_IDS.map((id) => (
              <span
                key={id}
                className="size-1.5 rounded-full bg-line-strong"
                style={found.includes(id) ? { background: SECRETS[id].color } : undefined}
              />
            ))}
          </span>
          <span className="text-faint tabular-nums">{secretCount(found)}</span>
          <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-faint">esc</kbd>
        </span>
      </div>

      {isComplete(found) && <p className="border-b border-line px-5 py-3 text-string">✦ {COMPLETION_QUIP}</p>}
      {/* every riddle unlocks at the same moment, so the countdown is said once instead of on every row */}
      {lock?.isLocked && !isComplete(found) && (
        <p className="flex items-center gap-1.5 border-b border-line px-5 py-3 text-faint">
          <Lock size={11} aria-hidden="true" /> riddles unlock in {formatCountdown(lock.secondsLeft)}. keep poking around
        </p>
      )}

      <ul className="flex flex-col divide-y divide-line overflow-y-auto px-5" data-lenis-prevent>
        {ordered.map((id) => (
          <li key={id} className="flex gap-3 py-3.5">
            {found.includes(id) ? <FoundQuest id={id} /> : <OpenQuest id={id} elapsed={elapsed} onGo={goTo} />}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

// every secret on the page: what each found one said, and for the rest a riddle that unlocks after a while
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
