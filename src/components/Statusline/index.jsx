import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { useEchoMessage } from "../../lib/echo";
import { bufferNameFor, fileTypeFor, localClock, nowStatus, scrollPosition } from "../../actions";
import { cursorLineAt } from "../../lib/editor";
import { HOME_TIMEZONE } from "../../lib/profile";
import { SECRET_IDS, useFoundSecrets } from "../../lib/secrets";
import { setMuted, useMuted } from "../../lib/sound";

const MODE_STYLES = {
  NORMAL: "bg-accent text-ink",
  COMMAND: "bg-signal text-ink",
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

const Statusline = ({ mode, colorscheme, activeId, onOpenCmdline, onOpenQuestLog }) => {
  const message = useEchoMessage();
  const bufferName = bufferNameFor(activeId);
  const { scrollY } = useScroll();
  const [position, setPosition] = useState("Top");
  const [line, setLine] = useState(() => cursorLineAt(0));
  const { time, status } = useHomeClock();
  const isMuted = useMuted();
  const found = useFoundSecrets();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    setPosition(scrollPosition(latest, maxScroll));
    setLine(cursorLineAt(latest));
  });

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-40 flex h-7 items-stretch border-t border-line bg-panel/95 font-mono text-[11px] backdrop-blur-xl"
    >
      {/* tapping the mode is the way into the command line on a phone, where there is no ":" key to press */}
      <button
        type="button"
        onClick={onOpenCmdline}
        aria-label="Open command line"
        className={`flex items-center px-3 font-medium tracking-wider transition-colors duration-300 ${MODE_STYLES[mode]}`}
      >
        {mode}
      </button>
      <span className="flex items-center px-3 text-fg">{bufferName}</span>

      <span className="flex min-w-0 flex-1 items-center px-2">
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

      {/* the score only shows up after the first find, so nobody knows there is a hunt until they stumble into it */}
      {found.length > 0 && (
        <button
          type="button"
          onClick={onOpenQuestLog}
          aria-label={`Quest log, ${found.length} of ${SECRET_IDS.length} secrets found`}
          className="flex items-center gap-1 px-3 text-accent tabular-nums transition-colors hover:bg-raised"
        >
          ✦ {found.length}/{SECRET_IDS.length}
        </button>
      )}
      <span className="hidden items-center gap-1.5 px-3 text-faint lg:flex" title="My local time in Rosarito, Mexico">
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
      <span className="hidden items-center px-3 text-faint xl:flex">{colorscheme}</span>
      <span className="hidden items-center px-3 text-faint md:flex">{fileTypeFor(bufferName)}</span>
      <span className="flex items-center bg-raised px-3 text-muted">{position}</span>
      <span className={`hidden items-center px-3 tabular-nums sm:flex ${MODE_STYLES[mode]}`}>{line}:1</span>
    </div>
  );
};

export default Statusline;
