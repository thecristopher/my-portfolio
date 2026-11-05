import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import PixelAvatar from "../PixelAvatar";
import { markPageReady } from "../../lib/pageReady";
import { easeOutExpo, pixelSteps } from "../../lib/motion";
import { coinCount, irisMask, irisReach, loadingLine, percentDone, trackAll } from "./actions";
import { preloadTasks } from "./preload";

// long enough to read the screen on a fast connection, so a cached visit gets the show instead of a flash
const MIN_SHOW_MS = 1100;
// the finishing move's three hits, a beat apart so each one reads
const HIT_GAP_MS = 60;
// the curtain opens while he's still up in the air from the shoryuken, so the hit and the reveal read as one beat
const LANDING_MS = 450;
// if a combo never reports its last hit, the curtain still opens
const FINISH_FALLBACK_MS = 2000;
const IRIS_SECONDS = 0.85;
const CROSSFADE_MS = 350;
const PIXEL = { fontFamily: '"Pixelify Sans", ui-monospace, monospace' };

// downloads everything, counting each file as it lands, and waits out the minimum so the bar always gets to run
const useLoading = () => {
  const [percent, setPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isLive = true;
    const minimum = new Promise((resolve) => setTimeout(resolve, MIN_SHOW_MS));
    const downloads = trackAll(preloadTasks(), (done, total) => isLive && setPercent(percentDone(done, total)));
    Promise.all([minimum, downloads]).then(() => isLive && setIsLoaded(true));
    return () => {
      isLive = false;
    };
  }, []);

  return { percent, isLoaded };
};

// the page underneath stays put while the loader is up, and opens at the top, where the Hero is
const useHeldPage = (isHeld) => {
  useEffect(() => {
    if (!isHeld) return undefined;
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [isHeld]);
};

// a gold coin a few pixels wide, spinning on its edge like the ones a block spits out
const Coin = () => (
  <motion.svg
    viewBox="0 0 8 10"
    shapeRendering="crispEdges"
    className="h-5 w-4"
    animate={{ scaleX: [1, 0.25, 1] }}
    transition={{ duration: 0.9, repeat: Infinity, ease: pixelSteps(4) }}
    aria-hidden="true"
  >
    <rect x="2" y="0" width="4" height="10" fill="#c98a12" />
    <rect x="0" y="2" width="8" height="6" fill="#c98a12" />
    <rect x="1" y="1" width="6" height="8" fill="#ffd34d" />
    <rect x="2" y="2" width="1" height="5" fill="#fff4c2" />
    <rect x="4" y="3" width="1" height="4" fill="#c98a12" />
  </motion.svg>
);

// the counter under the bar: the coin, then the percent as an arcade score
const CoinCounter = ({ shown }) => {
  const [count, setCount] = useState("000");
  useEffect(() => shown.on("change", (value) => setCount(coinCount(value))), [shown]);
  return (
    <p className="flex items-center gap-2 text-lg font-semibold tabular-nums" style={PIXEL}>
      <Coin />
      <span className="text-muted">×</span>
      {count}
    </p>
  );
};

// the bar, drawn in chunky blocks that fill with the sunset, with the avatar running along its top edge. he leans back
// by his own width as he goes, so at 100% he and his speech bubble still stand inside the screen
const Track = ({ shown, avatarRef, onHit }) => {
  const fill = useTransform(shown, (value) => `${value}%`);
  const lean = useTransform(shown, (value) => `-${value}%`);
  return (
    <div className="relative w-full">
      <div className="relative mx-6 h-24 sm:h-28">
        <motion.div ref={avatarRef} style={{ left: fill, x: lean }} className="absolute bottom-0">
          <PixelAvatar className="h-20 sm:h-24" entersAfterMs={150} firstWaveAfterMs={600} onPoke={onHit} />
        </motion.div>
      </div>
      <div className="h-5 border-2 border-fg p-[3px]">
        <motion.div
          style={{ width: fill }}
          className="bg-sunset h-full [mask-image:repeating-linear-gradient(90deg,black_0_10px,transparent_10px_13px)]"
        />
      </div>
    </div>
  );
};

// the heading over the bar: loading while it fills, and the arcade blink once it's full
const Heading = ({ isLoaded }) => (
  <p className="text-2xl font-bold tracking-[0.2em] sm:text-3xl" style={PIXEL}>
    {isLoaded ? (
      <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity, ease: pixelSteps(2) }} className="text-sunset">
        PRESS START
      </motion.span>
    ) : (
      "NOW LOADING"
    )}
  </p>
);

// the finishing move: the loader pokes the avatar three times, the same way a visitor would, so he throws his combo
const throwFinisher = (avatarRef) => {
  const avatar = avatarRef.current?.querySelector("button");
  [0, 1, 2].forEach((hit) => setTimeout(() => avatar?.click(), hit * HIT_GAP_MS));
};

// where the iris opens from: the avatar's middle, or the screen's when he can't be found
const irisCenter = (avatarRef) => {
  const box = avatarRef.current?.getBoundingClientRect();
  if (!box) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

// walks the loader from loaded to gone: the combo, the iris opening out of the avatar, then off the page for good
const useCurtain = ({ isLoaded, prefersReducedMotion, avatarRef }) => {
  const [phase, setPhase] = useState("loading");
  const radius = useMotionValue(0);
  const center = useRef({ x: 0, y: 0 });
  const opened = useRef(false);

  const open = useCallback(() => {
    if (opened.current) return;
    opened.current = true;
    center.current = irisCenter(avatarRef);
    markPageReady();
    setPhase("opening");
    if (prefersReducedMotion) {
      setTimeout(() => setPhase("gone"), CROSSFADE_MS);
      return;
    }
    const reach = irisReach(center.current, { width: window.innerWidth, height: window.innerHeight });
    animate(radius, reach, { duration: IRIS_SECONDS, ease: easeOutExpo }).then(() => setPhase("gone"));
  }, [avatarRef, prefersReducedMotion, radius]);

  useEffect(() => {
    if (!isLoaded || opened.current) return undefined;
    if (prefersReducedMotion) {
      open();
      return undefined;
    }
    setPhase("finishing");
    throwFinisher(avatarRef);
    const fallback = setTimeout(open, FINISH_FALLBACK_MS);
    return () => clearTimeout(fallback);
  }, [isLoaded, prefersReducedMotion, avatarRef, open]);

  // the third hit is the shoryuken; the curtain waits for him to land it
  const onHit = useCallback((hit) => hit >= 3 && setTimeout(open, LANDING_MS), [open]);

  return { phase, radius, center, open, onHit };
};

/**
 * The "Press Start" screen: it downloads everything the page shows, the pixel me runs the bar while a coin counter
 * ticks the percent, and at 100% he throws his combo and the screen opens in an iris onto the Hero.
 */
const Loader = () => {
  const prefersReducedMotion = useReducedMotion();
  const avatarRef = useRef(null);
  const { percent, isLoaded } = useLoading();
  const shown = useSpring(0, { stiffness: 140, damping: 24 });
  const { phase, radius, center, open, onHit } = useCurtain({ isLoaded, prefersReducedMotion, avatarRef });
  // a closed iris draws nothing, so the screen stays solid until the opening starts to grow
  const mask = useTransform(radius, (value) => (value <= 0 ? "none" : irisMask(value, center.current)));
  const [line, setLine] = useState(loadingLine(0));

  useEffect(() => shown.set(percent), [shown, percent]);
  useEffect(() => shown.on("change", (value) => setLine(loadingLine(value))), [shown]);
  useHeldPage(phase !== "gone");

  if (phase === "gone") return null;

  const isLeaving = phase === "opening";
  return (
    <motion.div
      data-lenis-prevent
      role="status"
      aria-busy={!isLoaded}
      aria-label="Loading the page"
      animate={{ opacity: isLeaving && prefersReducedMotion ? 0 : 1 }}
      transition={{ duration: CROSSFADE_MS / 1000 }}
      style={{ maskImage: prefersReducedMotion ? undefined : mask, WebkitMaskImage: prefersReducedMotion ? undefined : mask }}
      className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-ink px-6 text-fg ${isLeaving ? "pointer-events-none" : ""}`}
    >
      <span className="bg-sunset pointer-events-none absolute top-1/2 left-1/2 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]" aria-hidden="true" />
      <span className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:14px_14px]" aria-hidden="true" />
      <div className="relative flex w-full max-w-xl flex-col items-center gap-8">
        <Heading isLoaded={isLoaded} />
        <Track shown={shown} avatarRef={avatarRef} onHit={onHit} />
        <div className="flex w-full items-center justify-between gap-4">
          <p className="truncate font-mono text-xs text-muted sm:text-sm">{line}…</p>
          <CoinCounter shown={shown} />
        </div>
      </div>
      <motion.button
        type="button"
        onClick={open}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: easeOutExpo }}
        className="absolute right-6 bottom-6 text-xs tracking-widest text-muted transition-colors hover:text-fg"
        style={PIXEL}
      >
        SKIP ▸
      </motion.button>
    </motion.div>
  );
};

export default Loader;
