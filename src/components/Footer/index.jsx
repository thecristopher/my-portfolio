import { useEffect, useState } from "react";
import { Pokeball } from "../Secrets";
import { homeTime } from "../../actions";

// the time back home. a clock without seconds only needs a glance every few seconds to stay right
const HomeClock = () => {
  const [time, setTime] = useState(() => homeTime());

  useEffect(() => {
    const timer = setInterval(() => setTime(homeTime()), 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="flex items-center gap-2">
      <span className="relative flex size-1.5" aria-hidden="true">
        <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-string/70" />
        <span className="relative size-1.5 rounded-full bg-string" />
      </span>
      Rosarito, MX <span className="tabular-nums text-muted">{time}</span>
    </p>
  );
};

const Footer = ({ onOpenCmdline }) => (
  <footer className="border-t border-line">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="flex items-center gap-1">
        © {new Date().getFullYear()} Cristopher Cervantes
        <Pokeball className="-my-2" />
      </p>
      <HomeClock />
      <button type="button" onClick={onOpenCmdline} className="w-fit transition-colors hover:text-fg">
        press <kbd className="rounded border border-line px-1.5 py-0.5 text-muted">:</kbd> for commands
      </button>
    </div>
  </footer>
);

export default Footer;
