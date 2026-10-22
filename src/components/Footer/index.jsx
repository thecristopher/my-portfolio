import { Trigger as OneWishWillow } from "../Relics/Obsession";

// past the last line of the buffer vim draws a column of tildes. the page ends the same way
const EMPTY_LINES = 4;

const Footer = () => (
  <footer className="relative pb-8">
    <div className="mx-auto flex max-w-6xl flex-col px-4 font-mono text-xs sm:px-6" aria-hidden="true">
      {Array.from({ length: EMPTY_LINES }, (_, line) => (
        <span key={line} className="leading-7 text-accent/40" style={{ opacity: 1 - line * 0.2 }}>
          ~
        </span>
      ))}
    </div>
    <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-line px-4 py-6 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="flex items-center gap-1">
        © {new Date().getFullYear()} Cristopher Cervantes · written in Neovim, themed by <span className="text-accent">Eldentree</span>
        {/* a twig left behind on the way out, for anyone who still has a wish to make */}
        <OneWishWillow zoom={0.2} />
      </p>
      <p className="w-fit">
        press <kbd className="rounded border border-line px-1.5 py-0.5 text-muted">space</kbd> for keymaps,{" "}
        <kbd className="rounded border border-line px-1.5 py-0.5 text-muted">:</kbd> for telescope
      </p>
    </div>
  </footer>
);

export default Footer;
