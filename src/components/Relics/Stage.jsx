import { Suspense, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { clearStage, useStagedRelic } from "../../lib/relicStage";
import { COMPLETION_QUIP, RELICS, RELIC_IDS, isComplete, foundRelics, useFoundRelics } from "../../lib/relics";
import { showBanner } from "../../lib/banner";
import { echo } from "../../lib/echo";
import { pauseSmoothScroll, resumeSmoothScroll } from "../../lib/smoothScroll";
import { RELIC_EFFECTS } from "./registry";

// the continue button shows up once the moment has played, or after this long if a moment never says so
const SETTLE_FALLBACK_MS = 7000;

const pad = (count) => String(count).padStart(2, "0");

// what's said once a moment is closed: the relic's line, and the big banner when it was the last one
const announce = ({ id, isFirstFind }) => {
  if (!isFirstFind) return;
  if (isComplete(foundRelics.get())) {
    showBanner("great", { subtitle: COMPLETION_QUIP });
    return;
  }
  echo(RELICS[id].quip, "success");
};

/**
 * The 16 bit counter in the top right corner while a moment plays: how many relics so far, ticking up by one on a
 * new find, and the name of the one just touched.
 */
const RelicHud = ({ staged }) => {
  const found = useFoundRelics();
  const total = found.length;
  const before = staged.isFirstFind ? total - 1 : total;
  const [shown, setShown] = useState(before);

  useEffect(() => {
    if (shown === total) return;
    const tick = setTimeout(() => setShown(total), 900);
    return () => clearTimeout(tick);
  }, [shown, total]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="snes-window pointer-events-none fixed top-4 right-4 z-[72] flex min-w-44 flex-col gap-1 px-4 py-2.5"
      role="status"
    >
      <p className="flex items-baseline justify-between gap-4 text-sm tracking-wider uppercase">
        <span>Relics</span>
        <motion.span
          key={shown}
          initial={{ scale: shown === before ? 1 : 1.6, color: shown === before ? "#ffffff" : "#ffe066" }}
          animate={{ scale: 1, color: "#ffffff" }}
          transition={{ duration: 0.5 }}
          className="text-xl tabular-nums"
        >
          {pad(shown)}/{pad(RELIC_IDS.length)}
        </motion.span>
      </p>
      <p className="text-xs" style={{ color: RELICS[staged.id].color }}>
        {staged.isFirstFind && shown === total && <span className="mr-1 text-[#ffe066]">NEW!</span>}
        {RELICS[staged.id].franchise}
      </p>
    </motion.div>
  );
};

/** The one way out of a moment, so its last frame stays up for as long as it takes to read. */
const ContinueButton = ({ onClose }) => (
  <motion.button
    type="button"
    autoFocus
    onClick={onClose}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    className="snes-window fixed bottom-10 left-1/2 z-[72] -translate-x-1/2 px-6 py-2.5 text-base tracking-wider uppercase outline-none focus-visible:ring-2 focus-visible:ring-[#ffe066]"
  >
    {/* the menu cursor every 16 bit game blinks next to the option you're on */}
    <span className="caret mr-2 inline-block">▶</span>
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
