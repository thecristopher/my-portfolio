import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { GitBranch, Volume2, VolumeX } from "lucide-react";
import { useEchoMessage } from "../../lib/echo";
import { bufferNameFor, fileTypeFor, localClock, nowStatus, scrollPosition } from "../../actions";
import { cursorLineAt } from "../../lib/editor";
import { HOME_TIMEZONE } from "../../lib/profile";
import { RELIC_IDS, useFoundRelics } from "../../lib/relics";
import { formatRunes, onRunesEarned, useRunes } from "../../lib/runes";
import { setMuted, useMuted } from "../../lib/sound";
import { searchCount, useSearchState } from "../../lib/search";
import { useRegion } from "../../hooks/useRegion";
import FileIcon from "../FileIcon";

const MODE_STYLES = {
  NORMAL: "bg-accent text-ink",
  COMMAND: "bg-peach text-ink",
  SEARCH: "bg-signal text-ink",
  HINT: "bg-mauve text-ink",
};

const ECHO_TONES = {
  info: "text-muted",
  success: "text-string",
  error: "text-error",
};

// the time in Rosarito and a guess at what I'm doing, refreshed every half minute
const useHomeClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const clock = localClock(now, HOME_TIMEZONE);
  return { time: clock.time, status: nowStatus(clock) };
};

// the last payout floats up off the counter for a moment, the way the game adds runes after a kill
const useLastPayout = () => {
  const [payout, setPayout] = useState(null);
  useEffect(() => onRunesEarned((earned) => setPayout({ earned, id: Date.now() })), []);
  useEffect(() => {
    if (!payout) return;
    const timer = setTimeout(() => setPayout(null), 1800);
    return () => clearTimeout(timer);
  }, [payout]);
  return payout;
};

const Runes = () => {
  const total = useRunes();
  const payout = useLastPayout();
  return (
    <span className="relative flex items-center gap-1.5 px-3 text-rose tabular-nums" title="Runes, earned by exploring">
      {/* the rune glyph from the game's hud, a little gold sigil */}
      <svg viewBox="0 0 10 12" className="h-3 w-2.5 text-accent" aria-hidden="true">
        <path d="M5 0.5 L5 11.5 M5 3 L8.5 1 M5 6 L1.5 4 M5 8 L8.5 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {formatRunes(total)}
      <AnimatePresence>
        {payout && (
          <motion.span
            key={payout.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 1, 0], y: -22 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="pointer-events-none absolute right-2 bottom-full text-accent"
          >
            +{formatRunes(payout.earned)}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

const EchoLine = () => {
  const message = useEchoMessage();
  // only the :echo line is a live region. the clock ticking and the scroll readout would be noise read aloud
  return (
    <span role="status" className="flex min-w-0 flex-1 items-center px-2">
      <AnimatePresence mode="wait">
        {message && (
          <motion.span
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`truncate ${ECHO_TONES[message.tone]}`}
          >
            {message.text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

// where the page is, the way nvim's ruler reads it
const useRuler = () => {
  const { scrollY } = useScroll();
  const [ruler, setRuler] = useState({ position: "Top", line: cursorLineAt(0) });
  useMotionValueEvent(scrollY, "change", (latest) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setRuler({ position: scrollPosition(latest, maxScroll), line: cursorLineAt(latest) });
  });
  return ruler;
};

/**
 * Eldentree's lualine: the mode in the region's gold, the branch and buffer, :echo messages, the relic score,
 * the rune tally, my local time, the region and where in the page you are.
 */
const Statusline = ({ mode, activeId, onOpenQuestLog, onOpenRegions }) => {
  const bufferName = bufferNameFor(activeId);
  const { position, line } = useRuler();
  const { time, status } = useHomeClock();
  const isMuted = useMuted();
  const found = useFoundRelics();
  const searchState = useSearchState();
  const { region } = useRegion();

  return (
    <div className="glass-strong hairline fixed inset-x-0 bottom-0 z-40 flex h-7 items-stretch border-t font-mono text-[11px]">
      <span className={`flex items-center px-3 font-semibold tracking-wider transition-colors duration-300 ${MODE_STYLES[mode] ?? MODE_STYLES.NORMAL}`}>{mode}</span>
      <span className="hidden items-center gap-1.5 bg-raised px-3 text-string sm:flex">
        <GitBranch size={11} aria-hidden="true" />
        main
      </span>
      <span className="flex items-center gap-1.5 px-3 text-fg">
        <FileIcon name={bufferName} size={11} />
        <span className="truncate">{bufferName}</span>
      </span>

      <EchoLine />

      {searchState.total > 0 && (
        <span className="hidden items-center px-3 text-accent tabular-nums sm:flex">
          /{searchState.query} {searchCount(searchState)}
        </span>
      )}
      {/* the score only shows up after the first find, so nobody knows there's a hunt until they stumble into it */}
      {found.length > 0 && (
        <button
          type="button"
          onClick={onOpenQuestLog}
          aria-label={`Quest log, ${found.length} of ${RELIC_IDS.length} relics found`}
          className="flex items-center gap-1.5 bg-[#1d2a8a] px-3 font-pixel text-[12px] tracking-wider text-white uppercase tabular-nums transition-colors [text-shadow:1px_1px_0_#0b0f3a] hover:bg-[#3b4fc4]"
        >
          {/* the same 16 bit voice as the counter that shows up during a relic's moment */}
          <span className="text-[#ffe066]">▶</span>
          {String(found.length).padStart(2, "0")}/{RELIC_IDS.length}
        </button>
      )}
      <span className="hidden md:flex">
        <Runes />
      </span>
      <span className="hidden items-center gap-1.5 px-3 text-faint xl:flex" title="My local time in Rosarito, Mexico">
        <span className="text-muted tabular-nums">{time}</span> {status}
      </span>
      <button
        type="button"
        onClick={() => setMuted(!isMuted)}
        aria-label={isMuted ? "Turn sound on" : "Mute sound"}
        aria-pressed={!isMuted}
        className="flex items-center px-2.5 text-faint transition-colors hover:bg-raised hover:text-fg"
      >
        {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
      </button>
      <button
        type="button"
        onClick={onOpenRegions}
        className="hidden items-center px-3 text-faint transition-colors hover:bg-raised hover:text-fg lg:flex"
        aria-label={`Region ${region.title}, travel`}
      >
        {region.name}
      </button>
      <span className="hidden items-center px-3 text-faint md:flex">{fileTypeFor(bufferName)}</span>
      <span className="flex items-center bg-raised px-3 text-muted">{position}</span>
      <span className={`hidden items-center px-3 tabular-nums sm:flex ${MODE_STYLES[mode] ?? MODE_STYLES.NORMAL}`}>{line}:1</span>
    </div>
  );
};

export default Statusline;
