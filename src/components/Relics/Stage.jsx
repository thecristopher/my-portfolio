import { Suspense, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { clearStage, useStagedRelic } from "../../lib/relicStage";
import { COMPLETION_QUIP, RELICS, isComplete, foundRelics } from "../../lib/relics";
import { showBanner } from "../../lib/banner";
import { echo } from "../../lib/echo";
import { RELIC_EFFECTS } from "./registry";

// no moment may hold the page hostage, whatever happens inside it
const LONGEST_MOMENT_MS = 9000;

// what's said once a moment ends: the relic's line, and the big banner when it was the last one
const announce = ({ id, isFirstFind }) => {
  if (!isFirstFind) return;
  if (isComplete(foundRelics.get())) {
    showBanner("great", { subtitle: COMPLETION_QUIP });
    return;
  }
  echo(RELICS[id].quip, "success");
};

/** Plays whichever relic moment is on stage, over everything, and skips it on Escape. */
const Stage = () => {
  const staged = useStagedRelic();
  const Effect = staged ? RELIC_EFFECTS[staged.id] : null;

  useEffect(() => {
    if (!staged) return;
    const finish = () => {
      clearStage();
      announce(staged);
    };
    const skipOnEscape = (event) => event.key === "Escape" && finish();
    const failsafe = setTimeout(finish, LONGEST_MOMENT_MS);
    window.addEventListener("keydown", skipOnEscape);
    return () => {
      clearTimeout(failsafe);
      window.removeEventListener("keydown", skipOnEscape);
    };
  }, [staged]);

  const done = () => {
    if (!staged) return;
    clearStage();
    announce(staged);
  };

  return createPortal(
    <AnimatePresence>
      {Effect && (
        <Suspense key={staged.key} fallback={null}>
          <Effect onDone={done} isFirstFind={staged.isFirstFind} />
        </Suspense>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Stage;
