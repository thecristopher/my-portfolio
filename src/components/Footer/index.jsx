import { D20 } from "../Secrets";

// past the last line of the buffer vim draws a column of tildes. the page ends the same way
const EMPTY_LINES = 4;

const Footer = ({ onOpenCmdline }) => (
  <footer className="pb-8">
    <div className="mx-auto flex max-w-6xl flex-col px-4 font-mono text-xs sm:px-6" aria-hidden="true">
      {Array.from({ length: EMPTY_LINES }, (_, line) => (
        <span key={line} className="leading-7 text-signal/40" style={{ opacity: 1 - line * 0.2 }}>
          ~
        </span>
      ))}
    </div>
    <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line px-4 py-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="flex items-center gap-1">
        <span>© {new Date().getFullYear()} Cristopher Cervantes · written in neovim</span>
        <D20 className="-my-2" />
      </p>
      <button type="button" onClick={onOpenCmdline} className="w-fit transition-colors hover:text-fg">
        press <kbd className="rounded border border-line px-1.5 py-0.5 text-muted">:</kbd> for commands
      </button>
    </div>
  </footer>
);

export default Footer;
