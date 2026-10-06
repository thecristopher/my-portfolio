const EndOfBuffer = () => (
  <div aria-hidden="true" className="mx-auto max-w-6xl px-4 pb-6 font-mono text-sm leading-7 text-signal/40 sm:px-6">
    <p>~</p>
    <p>~</p>
    <p>~</p>
  </div>
);

const Footer = ({ onOpenCmdline }) => (
  <footer>
    <EndOfBuffer />
    <div className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Cristopher Cervantes</p>
        <button type="button" onClick={onOpenCmdline} className="w-fit transition-colors hover:text-fg">
          press <kbd className="rounded border border-line px-1.5 py-0.5 text-muted">:</kbd> for commands
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
