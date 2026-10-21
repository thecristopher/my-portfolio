import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { endRest, shouldRest, startRest, useResting } from "../../lib/rest";
import { isStageBusy } from "../../lib/relicStage";
import { easedGlow } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { PLAYER_MESSAGES } from "../Telescope/commands";

const GRACE_GOLD = "#f5d77a";
const WAKE_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart"];

// embers drifting up off the grace while you rest, each on its own lane and pace
const EMBERS = Array.from({ length: 22 }, (_, index) => ({
  left: 30 + ((index * 41) % 40),
  delay: (index % 7) * 0.6,
  duration: 4 + (index % 5) * 0.8,
  size: 2 + (index % 3),
}));

// counts quiet time and sits the page down at a grace once it's been long enough
const useIdleRest = (isBusy) => {
  const lastInput = useRef(0);
  useEffect(() => {
    lastInput.current = Date.now();
    const touch = () => {
      lastInput.current = Date.now();
    };
    WAKE_EVENTS.forEach((name) => window.addEventListener(name, touch, { passive: true }));
    window.addEventListener("scroll", touch, { passive: true });
    const check = setInterval(() => {
      const idleMs = Date.now() - lastInput.current;
      if (shouldRest({ idleMs, isBusy: isBusy() || isStageBusy(), isHidden: document.hidden })) startRest();
    }, 5000);
    return () => {
      WAKE_EVENTS.forEach((name) => window.removeEventListener(name, touch));
      window.removeEventListener("scroll", touch);
      clearInterval(check);
    };
  }, [isBusy]);
};

// any input gets you back up, the way any key wakes Eldentree
const useWakeOnInput = (isResting) => {
  useEffect(() => {
    if (!isResting) return;
    const wake = () => endRest();
    const arm = setTimeout(() => WAKE_EVENTS.forEach((name) => window.addEventListener(name, wake, { once: true })), 400);
    return () => {
      clearTimeout(arm);
      WAKE_EVENTS.forEach((name) => window.removeEventListener(name, wake));
    };
  }, [isResting]);
};

/**
 * Eldentree's rest: after a while with nobody at the keyboard the page sits down at a site of grace, the world
 * dims, embers rise and a player message is left on the ground. Any input wakes it.
 * @param {{ isBusy: () => boolean }} props tells it when a dialog is open and resting would get in the way
 */
const Rest = ({ isBusy }) => {
  const isResting = useResting();
  useIdleRest(isBusy);
  useWakeOnInput(isResting);
  const message = useRef(PLAYER_MESSAGES[0]);
  if (!isResting) message.current = PLAYER_MESSAGES[new Date().getMinutes() % PLAYER_MESSAGES.length];

  return createPortal(
    <AnimatePresence>
      {isResting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6 }}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-end overflow-hidden pb-[14vh]"
          style={{ background: `${easedGlow(GRACE_GOLD, { strength: 0.22, shape: "ellipse", at: "50% 80%", reach: 70 })}, rgb(4 3 2 / 0.9)` }}
          aria-label="Resting at a site of grace. Press any key to wake."
          role="dialog"
        >
          {EMBERS.map(({ left, delay, duration, size }) => (
            <motion.span
              key={left + delay}
              className="absolute bottom-[16vh] rounded-full"
              style={{ left: `${left}%`, width: size, height: size, background: GRACE_GOLD, boxShadow: `0 0 8px ${GRACE_GOLD}` }}
              animate={{ y: [0, -window.innerHeight * 0.6], x: [0, (left % 2 ? 1 : -1) * 20], opacity: [0, 1, 0] }}
              transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
          <motion.span
            className="mb-10 size-4 rounded-full"
            style={{ background: "#fffbe8", boxShadow: `0 0 40px 18px ${GRACE_GOLD}88` }}
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 2, ease: easeOutExpo }}
            className="font-display text-sm text-[#e9dcb0] uppercase sm:text-base"
          >
            Resting at grace
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1.2 }}
            className="mt-6 max-w-sm px-6 text-center font-display text-lg text-[#f3e6c0] italic"
          >
            "{message.current}"
          </motion.p>
          <p className="mt-8 font-mono text-[11px] text-white/40">press any key to rise</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Rest;
