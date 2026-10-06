import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { GitBranch } from "lucide-react";
import { useEchoMessage } from "../../lib/echo";
import { bufferNameFor, fileTypeFor, scrollPosition } from "../../actions";
import { cursorLineAt } from "../../lib/editor";

const MODE_STYLES = {
  NORMAL: "bg-accent text-ink",
  COMMAND: "bg-signal text-ink",
};

const ECHO_TONES = {
  info: "text-muted",
  success: "text-string",
  error: "text-error",
};

const Statusline = ({ mode, colorscheme, activeId }) => {
  const message = useEchoMessage();
  const bufferName = bufferNameFor(activeId);
  const { scrollY } = useScroll();
  const [position, setPosition] = useState("Top");
  const [line, setLine] = useState(() => cursorLineAt(0));

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
      <span className={`flex items-center px-3 font-medium tracking-wider transition-colors duration-300 ${MODE_STYLES[mode]}`}>{mode}</span>
      <span className="hidden items-center gap-1.5 bg-raised px-3 text-muted sm:flex">
        <GitBranch size={11} aria-hidden="true" /> main
      </span>
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

      <span className="hidden items-center px-3 text-faint lg:flex">press ? for help</span>
      <span className="hidden items-center px-3 text-faint xl:flex">{colorscheme}</span>
      <span className="hidden items-center px-3 text-faint md:flex">utf-8</span>
      <span className="hidden items-center px-3 text-faint md:flex">{fileTypeFor(bufferName)}</span>
      <span className="flex items-center bg-raised px-3 text-muted">{position}</span>
      <span className={`flex items-center px-3 tabular-nums ${MODE_STYLES[mode]}`}>{line}:1</span>
    </div>
  );
};

export default Statusline;
