import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, AtSign, Check, Copy, CornerDownLeft, FileText, HelpCircle, Palette } from "lucide-react";
import { useGetNavBarQuery } from "../../api/navBarApi";
import { useGetContactQuery } from "../../api/contactApi";
import { THEMES, bufferNameFor, filterCommands, findCommandByAlias, sectionIdFromUrl } from "../../actions";
import { pauseSmoothScroll, resumeSmoothScroll, scrollToSection } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";
import { easeOutExpo } from "../../lib/motion";

const HELP_TEXT = "j/k scroll · d/u half page · gg/G top/bottom · : commands · try :colorscheme or :q";

// only typed exactly, never listed. a few nods to raccoon city
const SECRET_COMMANDS = [
  { alias: "w", label: "Write", run: () => echo("Progress saved at the typewriter. Ink ribbons left: ∞", "success") },
  { alias: "q", label: "Quit", run: () => echo("E37: You can't quit. Stay a while and read, stranger.", "error") },
  { alias: "q!", label: "Force quit", run: () => echo("E37: No escape. Raccoon City is under quarantine.", "error") },
  { alias: "wq", label: "Write and quit", run: () => echo("Progress saved. Quitting is still not an option, stranger.", "error") },
  { alias: "jill", label: "Jill", run: () => echo("You were almost a Jill sandwich!", "success") },
  { alias: "herb", label: "Herb", run: () => echo("Mixed a green and a red herb. Condition: Fine.", "success") },
  { alias: "stars", label: "S.T.A.R.S.", run: () => echo("S.T.A.R.S. clearance confirmed. The mansion is that way, the portfolio is this way.", "success") },
  { alias: "merchant", label: "Merchant", run: () => echo("What're ya buyin'? Scroll down, stranger, the good stuff is in contact.sh", "success") },
].map((command) => ({ ...command, id: `secret-${command.alias}`, group: "Secrets", icon: HelpCircle, hidden: true }));

const buildCommands = ({ links, contact, colorscheme, onSetColorscheme }) => {
  const buffers = links.map((link) => {
    const sectionId = sectionIdFromUrl(link.url);
    return {
      id: `buffer-${sectionId}`,
      group: "Buffers",
      label: `:e ${bufferNameFor(sectionId)}`,
      alias: sectionId,
      keywords: link.title,
      icon: FileText,
      run: () => scrollToSection(sectionId),
    };
  });

  const reachOut = contact
    ? [
        {
          id: "yank-email",
          group: "Contact",
          label: "Yank email to clipboard",
          alias: "yank",
          keywords: "copy mail",
          icon: Copy,
          run: async () => {
            await navigator.clipboard?.writeText(contact.email);
            echo(`yanked "${contact.email}" to the + register. stored in the item box.`, "success");
          },
        },
        {
          id: "send-email",
          group: "Contact",
          label: "Send an email",
          alias: "mail",
          keywords: "write hire",
          icon: AtSign,
          run: () => window.location.assign(contact.mailto),
        },
        ...contact.socials.map((social) => ({
          id: `social-${social.id}`,
          group: "Contact",
          label: `Open ${social.name}`,
          alias: social.name.toLowerCase(),
          icon: ArrowRight,
          run: () => window.open(social.url, "_blank", "noopener"),
        })),
      ]
    : [];

  const extras = [
    { id: "help", group: "Extras", label: "Show keybindings", alias: "help", icon: HelpCircle, run: () => echo(HELP_TEXT) },
  ];

  const colorschemes = THEMES.map((theme) => ({
    id: `colorscheme-${theme}`,
    group: "Colorscheme",
    label: theme,
    alias: `colorscheme ${theme}`,
    keywords: "theme colo",
    icon: theme === colorscheme ? Check : Palette,
    run: () => onSetColorscheme(theme),
  }));

  return [...buffers, ...reachOut, ...colorschemes, ...extras, ...SECRET_COMMANDS];
};

const Cmdline = ({ onClose, colorscheme, onSetColorscheme }) => {
  const { data: links = [] } = useGetNavBarQuery();
  const { data: contact } = useGetContactQuery();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const commands = buildCommands({ links, contact, colorscheme, onSetColorscheme });
  const results = filterCommands(commands, query);

  const runCommand = (command) => {
    onClose();
    // lenis drops scrollTo calls while stopped, and the close effect only resumes it after the next render
    resumeSmoothScroll();
    command.run();
  };

  const submit = () => {
    const exactMatch = findCommandByAlias(commands, query);
    const chosen = exactMatch ?? results[activeIndex];
    if (chosen) return runCommand(chosen);
    onClose();
    echo(`E492: Not an editor command: ${query.replace(/^:/, "")}`, "error");
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" || (event.ctrlKey && event.key === "n")) {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }
    if (event.key === "ArrowUp" || (event.ctrlKey && event.key === "p")) {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter") submit();
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Command line"
      initial={{ opacity: 0, scale: 0.96, y: -12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      onClick={(event) => event.stopPropagation()}
      className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-panel/95 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 border-b border-line px-5 py-4 font-mono text-sm">
        <span className="text-signal">:</span>
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="about, work, yank, colorscheme, help..."
          aria-label="Command"
          spellCheck={false}
          className="flex-1 bg-transparent text-fg placeholder:text-faint focus:outline-none"
        />
        <kbd className="rounded border border-line px-1.5 py-0.5 text-[10px] text-faint">esc</kbd>
      </div>

      <ul className="max-h-[50vh] overflow-y-auto p-2" data-lenis-prevent>
        {results.length === 0 && (
          <li className="px-3 py-6 text-center font-mono text-xs text-faint">E492: Not an editor command: {query.replace(/^:/, "")}</li>
        )}
        {results.map((command, index) => {
          const isFirstInGroup = index === 0 || results[index - 1].group !== command.group;
          const isActive = index === activeIndex;
          const Icon = command.icon;
          return (
            <li key={command.id}>
              {isFirstInGroup && (
                <p className="px-3 pt-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">{command.group}</p>
              )}
              <button
                type="button"
                onClick={() => runCommand(command)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive ? "bg-raised text-fg" : "text-muted"
                }`}
              >
                <Icon size={14} className={isActive ? "text-accent" : "text-faint"} />
                <span className="flex-1">{command.label}</span>
                <span className="font-mono text-[11px] text-faint">:{command.alias}</span>
                {isActive && <CornerDownLeft size={13} className="text-faint" />}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex gap-4 border-t border-line px-5 py-3 font-mono text-[10px] text-faint">
        <span>↑↓ or ^n ^p</span>
        <span>↵ run</span>
        <span className="ml-auto">some commands are not listed. try :w</span>
      </div>
    </motion.div>
  );
};

const CommandMenu = ({ isOpen, onClose, colorscheme, onSetColorscheme }) => {
  useEffect(() => {
    if (!isOpen) return;
    pauseSmoothScroll();
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      resumeSmoothScroll();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-ink/60 px-4 pt-[16vh] backdrop-blur-sm"
        >
          <Cmdline onClose={onClose} colorscheme={colorscheme} onSetColorscheme={onSetColorscheme} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandMenu;
