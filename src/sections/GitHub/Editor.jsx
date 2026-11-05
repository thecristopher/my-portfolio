import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";
import { MAIN_PROJECT, typeBuffer, whichKeys } from "./actions";
import { BUFFER, BUFFER_TOTAL } from "./useTypist";

const KEYS = whichKeys(MAIN_PROJECT.features);
const WHICH_KEY_AFTER_MS = 700;

// the editor always sits on the dark screen, so the syntax colors are fixed instead of following the page theme
const TONES = {
  plain: "text-stage-fg/85",
  comment: "text-stage-fg/40 italic",
  keyword: "text-[#c792ea]",
  key: "text-[#82aaff]",
  string: "text-[#c3e88d]",
};

// which-key waits a beat after the last keystroke, the way it does when the leader key is held
const useWhichKey = (isDone) => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (!isDone) return undefined;
    const timer = setTimeout(() => setIsOpen(true), WHICH_KEY_AFTER_MS);
    return () => clearTimeout(timer);
  }, [isDone]);
  return isOpen;
};

const Cursor = () => <span className="caret ml-px inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] bg-glow" />;

const Buffer = ({ lines }) => (
  <ol className="flex flex-col">
    {lines.map((line, row) => (
      <li key={row} className="flex gap-3">
        <span className="w-4 shrink-0 text-right text-stage-fg/25 tabular-nums select-none">{row + 1}</span>
        <span className="min-w-0 break-words whitespace-pre-wrap">
          {line.map((token, at) => (
            <span key={at} className={TONES[token.tone]}>
              {token.text}
            </span>
          ))}
          {row === lines.length - 1 && <Cursor />}
        </span>
      </li>
    ))}
  </ol>
);

const Lualine = ({ isTyping, line, column }) => (
  <div className="flex items-center gap-2 bg-black/30 text-[10px] sm:text-[11px]">
    <span className={`px-2 py-0.5 font-semibold text-stage ${isTyping ? "bg-[#c3e88d]" : "bg-[#82aaff]"}`}>{isTyping ? "INSERT" : "NORMAL"}</span>
    <span className="text-stage-fg/70"> main</span>
    <span className="text-stage-fg/50">init.lua</span>
    <span className="ml-auto text-stage-fg/50">lua</span>
    <span className="bg-glow/90 px-2 py-0.5 font-semibold text-stage tabular-nums">
      {line}:{column}
    </span>
  </div>
);

// it opens in its own rows above the statusline instead of floating over the buffer, so no feature gets covered
const WhichKey = () => (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.5, ease: easeOutExpo }}
    className="overflow-hidden"
  >
    <div className="mx-3 mb-3 rounded-lg bg-[#0b100d]/95 p-3 ring-1 ring-white/10">
      <p className="mb-2 text-[10px] text-stage-fg/40">&lt;leader&gt;</p>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
        {KEYS.map(({ key, label }) => (
          <li key={label} className="flex gap-2">
            <span className="text-glow">{key}</span>
            <span className="text-stage-fg/40">→</span>
            <span className="truncate text-stage-fg/80">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

/**
 * The editor on the laptop screen: it shows the config's features typed out as a Lua table up to the latest
 * keystroke, the statusline flips from insert to normal, and which-key opens above it with a key for each feature.
 * @param {{ typed: number }} props keystrokes typed so far, shared with the keyboard
 */
const Editor = ({ typed }) => {
  const isDone = typed >= BUFFER_TOTAL;
  const isWhichKeyOpen = useWhichKey(isDone);
  const lines = typeBuffer(BUFFER, typed);
  const cursorLine = lines.at(-1) ?? [];

  return (
    <div className="flex min-h-[17rem] flex-col overflow-hidden rounded-xl bg-black/25 font-mono text-[11px] leading-relaxed ring-1 ring-white/10 sm:text-xs" aria-hidden="true">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="ml-2 text-[10px] text-stage-fg/40">~/.config/nvim</span>
      </div>
      <div className="flex-1 p-3">
        <Buffer lines={lines} />
      </div>
      <AnimatePresence>{isWhichKeyOpen && <WhichKey />}</AnimatePresence>
      <Lualine isTyping={!isDone} line={lines.length} column={cursorLine.reduce((length, token) => length + token.text.length, 0) + 1} />
    </div>
  );
};

export default Editor;
