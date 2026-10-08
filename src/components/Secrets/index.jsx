import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSecret } from "../../lib/secrets";
import { easeOutExpo } from "../../lib/motion";

const GOLD = "#e8c35a";
const UMBRELLA_RED = "#d62828";

// the caption pops up right next to the icon, so phones see it without the statusline
const SecretButton = ({ label, onClick, caption, captionClassName = "left-0", className = "", children }) => (
  <span className={`relative inline-block ${className}`}>
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-md text-faint/60 transition-colors hover:text-faint"
    >
      {children}
    </button>
    <AnimatePresence>
      {caption && (
        <motion.span
          role="status"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.35, ease: easeOutExpo }}
          className={`absolute bottom-full z-30 mb-2 w-max max-w-[16rem] rounded-lg border border-line-strong bg-panel px-3 py-2 text-left font-mono text-[11px] leading-relaxed text-muted shadow-lg ${captionClassName}`}
        >
          {caption}
        </motion.span>
      )}
    </AnimatePresence>
  </span>
);

// three triangles that drop into place once found
const TRIFORCE_PIECES = ["M8 1 L12 8 L4 8 Z", "M4 8 L8 15 L0 15 Z", "M12 8 L16 15 L8 15 Z"];

export const Triforce = ({ className }) => {
  const [isFound, find, caption] = useSecret("triforce");

  return (
    <SecretButton
      label="A small golden relic"
      caption={caption}
      captionClassName="right-0"
      className={className}
      onClick={() => find("♪ Da na na naaa! Courage to lead, wisdom to plan, power to ship.")}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
        {TRIFORCE_PIECES.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill={isFound ? GOLD : "currentColor"}
            initial={false}
            animate={isFound ? { scale: [0.4, 1.15, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: index * 0.12, ease: easeOutExpo }}
            style={{ transformOrigin: "8px 8px" }}
          />
        ))}
      </svg>
    </SecretButton>
  );
};

// the octagon of alternating wedges, grey until someone pokes it
const UMBRELLA_WEDGES = Array.from({ length: 8 }, (_, index) => {
  const angle = (index * Math.PI) / 4;
  const next = ((index + 1) * Math.PI) / 4;
  const point = (a) => `${(8 + 7.5 * Math.sin(a)).toFixed(2)} ${(8 - 7.5 * Math.cos(a)).toFixed(2)}`;
  return { path: `M8 8 L${point(angle)} L${point(next)} Z`, isRed: index % 2 === 0 };
});

export const Umbrella = ({ className }) => {
  const [isFound, find, caption] = useSecret("umbrella");

  return (
    <SecretButton
      label="A corporate logo"
      caption={caption}
      captionClassName="left-1/2 -translate-x-1/2 md:right-0 md:left-auto md:translate-x-0"
      className={className}
      onClick={() => find("Umbrella Corporation. Our business is life itself.")}
    >
      <motion.svg
        viewBox="0 0 16 16"
        className="size-3.5"
        aria-hidden="true"
        initial={false}
        animate={{ rotate: isFound ? 360 : 0 }}
        transition={{ duration: 1, ease: easeOutExpo }}
      >
        {UMBRELLA_WEDGES.map(({ path, isRed }) => (
          <path
            key={path}
            d={path}
            fill={isFound ? (isRed ? UMBRELLA_RED : "#f4f1ea") : isRed ? "currentColor" : "transparent"}
            stroke="currentColor"
            strokeWidth="0.4"
          />
        ))}
      </motion.svg>
    </SecretButton>
  );
};

const BonfireLit = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2 }}
    className="pointer-events-none fixed inset-x-0 top-1/2 z-50 -translate-y-1/2"
    aria-hidden="true"
  >
    <div className="bg-gradient-to-r from-transparent via-black/80 to-transparent py-8 text-center">
      <p
        className="font-serif text-[clamp(2rem,7vw,4.5rem)] tracking-[0.2em] uppercase"
        style={{ color: GOLD, textShadow: `0 0 30px ${GOLD}66` }}
      >
        Bonfire Lit
      </p>
    </div>
  </motion.div>
);

// a coiled sword in the ashes at the end of the page. light it and the banner rolls in
export const Bonfire = ({ className }) => {
  const [isLit, find, caption] = useSecret("bonfire");
  const [isBannerShown, setIsBannerShown] = useState(false);
  const bannerTimer = useRef(null);

  const light = () => {
    find(isLit ? "You rest at the bonfire. Your progress is safe here." : "Bonfire lit. Your progress is safe here.");
    setIsBannerShown(true);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setIsBannerShown(false), 2600);
  };

  return (
    <>
      <SecretButton label="A sword resting in ashes" caption={caption} className={className} onClick={light}>
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <AnimatePresence>
            {isLit && (
              <motion.path
                d="M8 3 C10.5 6 11.5 8.5 10.5 11 C10 12 9 12.5 8 12.5 C7 12.5 6 12 5.5 11 C4.5 8.5 5.5 6 8 3 Z"
                fill="#f08a24"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: [1, 0.9, 1.05, 1], opacity: 0.9 }}
                transition={{ scaleY: { duration: 1.4, repeat: Infinity }, opacity: { duration: 0.4 } }}
                style={{ transformOrigin: "8px 12.5px" }}
              />
            )}
          </AnimatePresence>
          <path d="M8 1 V12" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M6 3.5 H10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M3 14.5 C5 12.5 11 12.5 13 14.5 Z" fill="currentColor" />
        </svg>
      </SecretButton>
      <AnimatePresence>{isBannerShown && <BonfireLit />}</AnimatePresence>
    </>
  );
};
