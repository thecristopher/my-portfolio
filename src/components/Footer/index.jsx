import { ArrowUp, Volume2, VolumeX } from "lucide-react";
import { setMuted, useMuted } from "../../lib/sound";
import { scrollToEdge } from "../../lib/smoothScroll";

// the relic moments play a jingle, and some people browse with the sound on
const SoundToggle = () => {
  const isMuted = useMuted();
  const Icon = isMuted ? VolumeX : Volume2;
  return (
    <button type="button" onClick={() => setMuted(!isMuted)} className="flex items-center gap-1.5 transition-colors hover:text-fg" aria-pressed={!isMuted}>
      <Icon size={13} aria-hidden="true" />
      {isMuted ? "Sound off" : "Sound on"}
    </button>
  );
};

/** The last line of the page: who made it, the sound switch and the way back up. */
const Footer = () => (
  <footer className="border-t border-line">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p>© {new Date().getFullYear()} Cristopher Cervantes. Designed and built in Rosarito, written in Neovim.</p>
      <div className="flex items-center gap-6">
        <SoundToggle />
        <button type="button" onClick={() => scrollToEdge("top")} className="flex items-center gap-1.5 transition-colors hover:text-fg">
          Back to top
          <ArrowUp size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
