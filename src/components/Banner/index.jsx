import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { clearBanner, spacedLetters, useBanner } from "../../lib/banner";
import { easeOutExpo } from "../../lib/motion";

const TONES = {
  accent: "var(--color-accent)",
  error: "var(--color-error)",
  fg: "var(--color-fg)",
};

// the soft band of shadow the words sit on: darkest across the middle, melting away to the top, bottom and both edges
const BAND = "radial-gradient(ellipse 70% 50% at 50% 50%, rgb(0 0 0 / 0.92) 0%, rgb(0 0 0 / 0.75) 45%, rgb(0 0 0 / 0.35) 75%, transparent 100%)";
// area names still hang lightly, but dark enough under the words that they read over any section
const LIGHT_BAND = "radial-gradient(ellipse 75% 65% at 50% 50%, rgb(0 0 0 / 0.88) 0%, rgb(0 0 0 / 0.68) 50%, rgb(0 0 0 / 0.3) 80%, transparent 100%)";

// a tight dark edge around every letter plus a wide soft shadow, so the words read over the page and the glow
const LEGIBLE_SHADOW = "0 1px 2px rgb(0 0 0 / 0.95), 0 0 6px rgb(0 0 0 / 0.9), 0 0 18px rgb(0 0 0 / 0.8)";

// a thin rule that glows at the middle and fades to nothing at its tips
const Rule = ({ color }) => (
  <motion.span
    initial={{ scaleX: 0, opacity: 0 }}
    animate={{ scaleX: 1, opacity: 1 }}
    transition={{ duration: 1.4, ease: easeOutExpo }}
    className="mx-auto block h-px w-[min(80vw,36rem)]"
    style={{ background: `linear-gradient(to right, transparent, ${color}, transparent)` }}
  />
);

const Letters = ({ text, staggerMs, color, isDeath }) => (
  <p
    className="font-display text-[clamp(1.6rem,6.4vw,4.5rem)] leading-none font-medium whitespace-pre"
    style={{ color, textShadow: `${LEGIBLE_SHADOW}, 0 0 32px color-mix(in oklab, ${color} 55%, transparent)` }}
    aria-label={text}
  >
    {spacedLetters(text).map((letter, index) => (
      <motion.span
        key={index}
        aria-hidden="true"
        className="inline-block"
        initial={{ opacity: 0, scale: isDeath ? 1.08 : 1.25, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: isDeath ? 1.4 : 0.42, delay: (index * staggerMs) / 1000, ease: easeOutExpo }}
        style={{ letterSpacing: "0.18em" }}
      >
        {letter}
      </motion.span>
    ))}
  </p>
);

/** The Elden Ring banner from Eldentree: letters wake one by one over a band of shadow, then everything leaves together. */
const Banner = () => {
  const banner = useBanner();

  useEffect(() => {
    if (!banner) return;
    const timer = setTimeout(clearBanner, banner.durationMs);
    return () => clearTimeout(timer);
  }, [banner]);

  const color = TONES[banner?.tone] ?? TONES.accent;

  return createPortal(
    <AnimatePresence>
      {banner && (
        <motion.div
          key={banner.id}
          role="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
          transition={{ duration: banner.kind === "died" ? 0.9 : 0.45 }}
          className="pointer-events-none fixed inset-x-0 top-1/2 z-[75] flex -translate-y-1/2 flex-col items-center gap-4 px-4 py-14 text-center"
          style={{ background: banner.isLight ? LIGHT_BAND : BAND }}
        >
          {banner.rule && <Rule color={color} />}
          <Letters text={banner.text} staggerMs={banner.staggerMs} color={color} isDeath={banner.kind === "died"} />
          {banner.rule && <Rule color={color} />}
          {banner.subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="max-w-xl font-display text-[11px] tracking-[0.32em] text-fg/90 uppercase sm:text-xs"
              style={{ textShadow: LEGIBLE_SHADOW }}
            >
              {banner.subtitle}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Banner;
