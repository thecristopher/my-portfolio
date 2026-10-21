import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Compass, Send, User } from "lucide-react";
import { SHOWS_SPLASH, SPLASH_HOLD_S, markBooted } from "../../lib/intro";
import { scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";

// "CC" in figlet's ANSI Shadow, the font half the nvim dashboards out there open with. it's drawn as pixels rather
// than printed, since not every monospace font has the box drawing characters and the ones that do disagree on them:
// the solid blocks are lit with the colorscheme's gradient over a drop shadow, standing in for the outline strokes
const HEADER = [
  " ██████╗ ██████╗",
  "██╔════╝██╔════╝",
  "██║     ██║     ",
  "██║     ██║     ",
  "╚██████╗╚██████╗",
  " ╚═════╝ ╚═════╝",
];

const HEADER_WIDTH = Math.max(...HEADER.map((row) => [...row].length));
const HEADER_CELLS = HEADER.flatMap((row, y) =>
  [...row].flatMap((glyph, x) => (glyph === "█" ? [{ x, y }] : []))
);

const ENTRIES = [
  { key: "a", icon: User, label: "About me", target: "about" },
  { key: "w", icon: Briefcase, label: "Recent work", target: "work" },
  { key: "s", icon: Compass, label: "Side quests", target: "github" },
  { key: "c", icon: Send, label: "Say hello", target: "contact" },
];

// the first thing a visit sees: an alpha-nvim style dashboard that boots, holds for a beat, then the camera
// pushes through it into the page. any key or click skips it, and a dashboard key jumps straight to that section
const Splash = () => {
  const [isShown, setIsShown] = useState(SHOWS_SPLASH);

  useEffect(() => {
    if (!isShown) return undefined;
    markBooted();
    const timer = setTimeout(() => setIsShown(false), SPLASH_HOLD_S * 1000);
    const skip = (event) => {
      const entry = ENTRIES.find((item) => item.key === event.key);
      setIsShown(false);
      if (entry) setTimeout(() => scrollToSection(entry.target), 500);
    };
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [isShown]);

  return (
    <AnimatePresence>
      {isShown && (
        <motion.div
          key="splash"
          exit={{ opacity: 0, scale: 1.12, filter: "blur(14px)" }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-10 bg-ink px-6 font-mono"
          aria-hidden="true"
          data-search-skip
        >
          <motion.svg
            viewBox={`0 0 ${HEADER_WIDTH} ${HEADER.length * 2}`}
            className="w-[min(70vw,17rem)] overflow-visible"
            shapeRendering="crispEdges"
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: easeOutExpo }}
          >
            <defs>
              <linearGradient id="splash-ink" gradientUnits="userSpaceOnUse" x1="0" x2={HEADER_WIDTH} y1="0" y2={HEADER.length * 2}>
                <stop offset="0%" stopColor="var(--color-accent)" />
                <stop offset="55%" stopColor="var(--color-error)" />
                <stop offset="100%" stopColor="var(--color-signal)" />
              </linearGradient>
            </defs>
            {/* the shadow first, a half cell down and to the right, then the lit blocks over it */}
            {HEADER_CELLS.map(({ x, y }) => (
              <rect key={`shadow-${x}-${y}`} x={x + 0.5} y={y * 2 + 1} width="1" height="2" fill="var(--color-line-strong)" />
            ))}
            {HEADER_CELLS.map(({ x, y }) => (
              <motion.rect
                key={`${x}-${y}`}
                x={x}
                y={y * 2}
                width="1.02"
                height="2.02"
                fill="url(#splash-ink)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 + x * 0.018 + y * 0.025 }}
              />
            ))}
          </motion.svg>

          <ul className="flex w-full max-w-xs flex-col gap-3 text-sm">
            {ENTRIES.map((entry, index) => (
              <motion.li
                key={entry.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.08, ease: easeOutExpo }}
                className="flex items-center gap-4 text-muted"
              >
                <entry.icon size={14} className="text-signal" aria-hidden="true" />
                <span className="flex-1 text-fg">{entry.label}</span>
                <span className="text-accent">{entry.key}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75 }}
            className="flex w-full max-w-xs flex-col gap-2 text-[11px] text-faint"
          >
            <span className="relative h-px w-full overflow-hidden bg-line">
              <motion.span
                className="absolute inset-0 origin-left bg-accent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SPLASH_HOLD_S - 0.6, delay: 0.4, ease: "easeInOut" }}
              />
            </span>
            <span>
              <span className="text-string">⚡</span> lazy.nvim loaded 11 secrets · 8 buffers in 23ms
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Splash;
