import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { clearStage, useStagedRelic } from "../../lib/relicStage";
import { COMPLETION_QUIP, RELICS, RELIC_IDS, isComplete, foundRelics, useFoundRelics } from "../../lib/relics";
import { echo } from "../../lib/echo";
import { pauseSmoothScroll, resumeSmoothScroll } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";
import { RELIC_EFFECTS } from "./registry";

// the continue button shows up once the moment has played, or after this long if a moment never says so
const SETTLE_FALLBACK_MS = 7000;

const pad = (count) => String(count).padStart(2, "0");

// what is said once a moment is closed: the relic's line, or the completion line when it was the last one
const announce = ({ id, isFirstFind }) => {
  if (!isFirstFind) return;
  echo(isComplete(foundRelics.get()) ? COMPLETION_QUIP : RELICS[id].quip, "success");
};

/**
 * The counter in the top right corner while a moment plays: how many relics so far, ticking up by one on a new
 * find, and the name of the one just touched.
 */
const RelicHud = ({ staged }) => {
  const found = useFoundRelics();
  const total = found.length;
  const before = staged.isFirstFind ? total - 1 : total;
  const [shown, setShown] = useState(before);
  const relic = RELICS[staged.id];

  useEffect(() => {
    if (shown === total) return;
    const tick = setTimeout(() => setShown(total), 900);
    return () => clearTimeout(tick);
  }, [shown, total]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
      className="pointer-events-none fixed top-4 right-4 z-[72] flex items-center gap-3 rounded-full bg-black/55 py-2 pr-4 pl-2 text-white ring-1 ring-white/15 backdrop-blur-xl"
      role="status"
    >
      <span className="size-7 rounded-full" style={{ background: relic.color, boxShadow: `0 0 16px ${relic.color}` }} aria-hidden="true" />
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-white/60">
          {staged.isFirstFind && shown === total && <span className="mr-1.5 font-semibold text-white">New relic</span>}
          {relic.franchise}
        </span>
        <motion.span
          key={shown}
          initial={{ scale: shown === before ? 1 : 1.4, opacity: shown === before ? 1 : 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: easeOutExpo }}
          className="origin-left text-sm font-semibold tabular-nums"
        >
          {pad(shown)} of {pad(RELIC_IDS.length)} found
        </motion.span>
      </span>
    </motion.div>
  );
};

/** The one way out of a moment, so its last frame stays up for as long as it takes to read. */
const ContinueButton = ({ onClose }) => (
  <motion.button
    type="button"
    autoFocus
    onClick={onClose}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5, ease: easeOutExpo }}
    className="fixed bottom-10 left-1/2 z-[72] -translate-x-1/2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-2xl outline-none transition-transform hover:scale-[1.04] focus-visible:ring-4 focus-visible:ring-white/40 active:scale-[0.97]"
  >
    Continue
  </motion.button>
);

/** Plays whichever relic moment is on stage, over everything, until the visitor presses continue. */
const Stage = () => {
  const staged = useStagedRelic();
  const [settledKey, setSettledKey] = useState(null);
  const Effect = staged ? RELIC_EFFECTS[staged.id] : null;
  const isSettled = staged && settledKey === staged.key;

  // the page holds still under a moment, so the wheel never scrolls it away behind the art
  useEffect(() => {
    if (!staged) return;
    pauseSmoothScroll();
    const fallback = setTimeout(() => setSettledKey(staged.key), SETTLE_FALLBACK_MS);
    return () => {
      clearTimeout(fallback);
      resumeSmoothScroll();
    };
  }, [staged]);

  const close = () => {
    if (!staged) return;
    clearStage();
    announce(staged);
  };

  return createPortal(
    <AnimatePresence>
      {Effect && (
        <Suspense key={staged.key} fallback={null}>
          <Effect onDone={() => setSettledKey(staged.key)} isFirstFind={staged.isFirstFind} />
          <RelicHud staged={staged} />
          {isSettled && <ContinueButton onClose={close} />}
        </Suspense>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Stage;
