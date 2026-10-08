import { Pokeball } from "../Secrets";

const Footer = ({ onOpenCmdline }) => (
  <footer className="border-t border-line">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="flex items-center gap-1">
        © {new Date().getFullYear()} Cristopher Cervantes
        <Pokeball className="-my-2" />
      </p>
      <button type="button" onClick={onOpenCmdline} className="w-fit transition-colors hover:text-fg">
        press <kbd className="rounded border border-line px-1.5 py-0.5 text-muted">:</kbd> for commands
      </button>
    </div>
  </footer>
);

export default Footer;
