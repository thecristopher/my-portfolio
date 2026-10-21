import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Download, FolderGit2, Send, User } from "lucide-react";
import { SHOWS_SPLASH, SPLASH_HOLD_S, markBooted } from "../../lib/intro";
import { scrollToSection } from "../../lib/smoothScroll";
import { easeOutExpo } from "../../lib/motion";
import { exportResume } from "../../lib/resume/exportResume";
import { currentRegionName, resolveRegion } from "../../lib/regions";
import { showBanner } from "../../lib/banner";
import { PLAYER_MESSAGES } from "../Telescope/commands";

const ENTRIES = [
  { key: "a", icon: User, label: "About me", run: () => scrollToSection("about") },
  { key: "w", icon: Briefcase, label: "Experience", run: () => scrollToSection("work") },
  { key: "p", icon: FolderGit2, label: "Projects", run: () => scrollToSection("projects") },
  { key: "r", icon: Download, label: "Download résumé", run: exportResume },
  { key: "c", icon: Send, label: "Say hello", run: () => scrollToSection("contact") },
];

// specks of the region's gold rising through the empty space, the way the hub's embers do
const EMBERS = Array.from({ length: 16 }, (_, index) => ({
  left: 6 + ((index * 53) % 88),
  delay: (index % 8) * 0.18,
  size: 2 + (index % 3),
}));

// "Cristopher" becomes "C R I S T O P H E R", the same carved look the hub title has
const spaced = (name) => [...name.toUpperCase()].join(" ");

const Header = ({ region }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <motion.p
      initial={{ opacity: 0, letterSpacing: "0.6em" }}
      animate={{ opacity: 1, letterSpacing: "0.32em" }}
      transition={{ duration: 1.4, ease: easeOutExpo }}
      className="shimmer font-display text-[clamp(1.4rem,6vw,3.25rem)] font-semibold whitespace-nowrap"
    >
      {spaced("Cristopher")}
    </motion.p>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="font-display text-[11px] tracking-[0.4em] text-muted uppercase"
    >
      {region.title} · {region.tagline}
    </motion.p>
  </div>
);

// a player message writes itself in letter by letter, then the quill blinks
const PlayerMessage = ({ text }) => (
  <p className="font-display text-sm text-rose italic">
    {[...`"${text}"`].map((letter, index) => (
      <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: 0.7 + index * 0.035 }}>
        {letter}
      </motion.span>
    ))}
    <span className="caret ml-0.5 inline-block h-3.5 w-px translate-y-0.5 bg-accent" aria-hidden="true" />
  </p>
);

const Entries = () => (
  <ul className="flex w-full max-w-xs flex-col gap-2.5 font-mono text-sm">
    {ENTRIES.map((entry, index) => (
      <motion.li
        key={entry.key}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.35 + index * 0.07, ease: easeOutExpo }}
        className="flex items-center gap-4 text-muted"
      >
        <entry.icon size={14} className="text-accent" aria-hidden="true" />
        <span className="flex-1 text-fg">{entry.label}</span>
        <span className="text-rose">{entry.key}</span>
      </motion.li>
    ))}
  </ul>
);

/**
 * The first thing a visit sees: Eldentree's hub. The name shimmers in the region's gold, embers rise, a player
 * message writes itself, then the camera pushes through into the page. Any key or click skips it, and a hub key
 * runs its entry. After it, the region's name rolls across the screen like entering an area in the game.
 */
const Hub = () => {
  const [isShown, setIsShown] = useState(SHOWS_SPLASH);
  const [region] = useState(() => resolveRegion(currentRegionName()));
  const [message] = useState(() => PLAYER_MESSAGES[Math.floor(Math.random() * PLAYER_MESSAGES.length)]);

  useEffect(() => {
    if (!isShown) return undefined;
    markBooted();
    const close = (entry) => {
      setIsShown(false);
      if (entry) setTimeout(entry.run, 500);
      else setTimeout(() => showBanner("region", { text: region.title, subtitle: region.subtitle }), 700);
    };
    const timer = setTimeout(() => close(null), SPLASH_HOLD_S * 1000);
    const skip = (event) => close(ENTRIES.find((item) => item.key === event.key) ?? null);
    window.addEventListener("keydown", skip);
    window.addEventListener("pointerdown", skip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [isShown, region]);

  return (
    <AnimatePresence>
      {isShown && (
        <motion.div
          key="hub"
          exit={{ opacity: 0, scale: 1.12, filter: "blur(14px)" }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center gap-10 overflow-hidden bg-ink px-6"
          aria-hidden="true"
          data-search-skip
        >
          {EMBERS.map(({ left, delay, size }) => (
            <motion.span
              key={left}
              className="absolute bottom-0 rounded-full bg-accent"
              style={{ left: `${left}%`, width: size, height: size, boxShadow: "0 0 8px var(--color-accent)" }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: "-70vh", opacity: [0, 1, 0] }}
              transition={{ duration: 2.6, delay, ease: "easeOut" }}
            />
          ))}
          <Header region={region} />
          <Entries />
          <PlayerMessage text={message} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="font-mono text-[11px] text-faint"
          >
            <span className="text-string">⚡</span> eldentree loaded 12 relics · 8 buffers in 23ms
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Hub;
