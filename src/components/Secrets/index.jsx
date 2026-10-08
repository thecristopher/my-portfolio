import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSecret } from "../../lib/secrets";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../lib/magic";
import { playSound } from "../../lib/sound";
import { easeOutExpo } from "../../lib/motion";
import darkMagicianGirl from "../../assets/images/dark-magician-girl.png";

const GOLD = "#e8c35a";
const UMBRELLA_RED = "#d62828";
const POKEBALL_RED = "#e3350d";

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

// a coiled sword in the ashes after the contact terminal logs out. light it and the banner rolls in
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

const FLIGHT_S = 4.4;
// arrives a quarter of the way in, hovers over the skills, then shoots off the top of the screen
const FLIGHT_TIMES = [0, 0.25, 0.8, 1];
const CAST_AT_MS = 1200;
const SPARKLES = [
  { x: -18, y: 30, delay: 0, color: MAGIC_PINK },
  { x: 120, y: 10, delay: 0.3, color: GOLD },
  { x: 140, y: 120, delay: 0.6, color: MAGIC_PINK },
  { x: -10, y: 160, delay: 0.15, color: GOLD },
  { x: 60, y: -14, delay: 0.45, color: MAGIC_PINK },
  { x: 100, y: 210, delay: 0.75, color: GOLD },
];

const Sparkle = ({ x, y, delay, color }) => (
  <motion.svg
    viewBox="0 0 8 8"
    className="absolute size-3"
    style={{ left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
    transition={{ duration: 0.9, delay: 1.1 + delay, repeat: 2 }}
  >
    <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={color} />
  </motion.svg>
);

const MagicianFlyby = () => {
  const prefersReducedMotion = useReducedMotion();
  const flight = prefersReducedMotion
    ? { initial: { opacity: 0, x: "55vw", y: "-30vh" }, animate: { opacity: [0, 1, 1, 0] } }
    : {
        initial: { x: "-30vw", y: "20vh", rotate: -14, opacity: 0 },
        animate: {
          x: ["-30vw", "55vw", "55vw", "110vw"],
          y: ["20vh", "-30vh", "-30vh", "-90vh"],
          rotate: [-14, 0, 0, 12],
          opacity: [0, 1, 1, 1],
        },
      };

  return (
    <motion.div
      {...flight}
      transition={{ duration: FLIGHT_S, times: FLIGHT_TIMES, ease: "easeInOut" }}
      className="pointer-events-none fixed bottom-0 left-0 z-50"
      aria-hidden="true"
    >
      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <img src={darkMagicianGirl} alt="" className="h-48 w-auto drop-shadow-[0_0_24px_rgba(255,145,190,0.55)] sm:h-64" />
        {SPARKLES.map((sparkle) => (
          <Sparkle key={`${sparkle.x}-${sparkle.y}`} {...sparkle} />
        ))}
      </motion.div>
    </motion.div>
  );
};

// a little wizard hat under the skills. tap it and a magician flies in and buffs every stat on the page
export const Magician = ({ className }) => {
  const [isFound, find, caption] = useSecret("magician");
  const [isFlying, setIsFlying] = useState(false);
  const flightTimer = useRef(null);
  const castTimer = useRef(null);

  useEffect(
    () => () => {
      clearTimeout(flightTimer.current);
      clearTimeout(castTimer.current);
    },
    []
  );

  const summon = () => {
    find("Dark Magician Girl cast a buff on your skills! Pixel art by TeykioArts.");
    setIsFlying(true);
    clearTimeout(flightTimer.current);
    clearTimeout(castTimer.current);
    castTimer.current = setTimeout(() => castMagic(), CAST_AT_MS);
    flightTimer.current = setTimeout(() => setIsFlying(false), FLIGHT_S * 1000 + 100);
  };

  return (
    <>
      <SecretButton label="A pointy wizard hat" caption={caption} captionClassName="right-0" className={className} onClick={summon}>
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <path d="M9 1 L4 13 H13 Z" fill={isFound ? MAGIC_BLUE : "currentColor"} />
          <path d="M2 13 H14 V14.5 H2 Z" fill={isFound ? MAGIC_PINK : "currentColor"} />
          {isFound && <path d="M6.5 8 H11" stroke={MAGIC_PINK} strokeWidth="1.2" />}
        </svg>
      </SecretButton>
      <AnimatePresence>{isFlying && <MagicianFlyby />}</AnimatePresence>
    </>
  );
};

// grey until caught. it wobbles three times, then clicks shut like it should
export const Pokeball = ({ className }) => {
  const [isFound, find, caption] = useSecret("pokeball");
  const wobbleControls = useAnimationControls();

  const isWobbling = useRef(false);

  // the sound starts on the click so it never feels laggy, the caption waits for the click shut
  const throwBall = async () => {
    if (isWobbling.current) return;
    isWobbling.current = true;
    playSound("pokeball");
    await wobbleControls.start({
      rotate: [0, -22, 18, 0, -22, 18, 0, -22, 18, 0],
      transition: { duration: 0.9, times: [0, 0.06, 0.18, 0.3, 0.4, 0.52, 0.64, 0.74, 0.86, 1] },
    });
    find("Gotcha! Cristopher was caught. His nature is Hardy.", { withSound: false });
    isWobbling.current = false;
  };

  return (
    <SecretButton label="A red and white ball" caption={caption} className={className} onClick={throwBall}>
      <motion.svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" animate={wobbleControls} style={{ originY: 1 }}>
        <path d="M1 8 A7 7 0 0 1 15 8 Z" fill={isFound ? POKEBALL_RED : "currentColor"} />
        <path d="M1 8 A7 7 0 0 0 15 8 Z" fill={isFound ? "#f4f1ea" : "transparent"} />
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M1 8 H15" stroke="currentColor" strokeWidth="1" />
        <circle cx="8" cy="8" r="2" fill={isFound ? "#f4f1ea" : "var(--color-ink)"} stroke="currentColor" strokeWidth="1" />
      </motion.svg>
    </SecretButton>
  );
};
