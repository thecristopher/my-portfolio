import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSecret } from "../../lib/secrets";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../lib/magic";
import { playSound } from "../../lib/sound";
import { easeOutExpo } from "../../lib/motion";
import darkMagicianGirl from "../../assets/images/dark-magician-girl.png";

const GOLD = "#e8c35a";
const UMBRELLA_RED = "#d62828";
const POKEBALL_RED = "#e3350d";

const VIEWPORT_GUTTER = 16;

// how long each full screen effect stays up, the secret count pops in once it clears
const ITEM_GET_MS = 3600;
const SAVE_ROOM_MS = 3800;
const TRANSMUTATION_MS = 2600;
const GUSTS_MS = 2200;
const WATER_SLASH_MS = 900;
const GOTCHA_MS = 3000;
const GRACE_BANNER_MS = 3000;

// the effect does the storytelling, so the pill next to the icon only keeps score.
// once it mounts it nudges itself sideways if it would spill past either edge of the screen
const SecretButton = ({ label, onClick, caption, captionClassName = "left-0", className = "", children }) => {
  const captionRef = useRef(null);
  const [nudge, setNudge] = useState(0);

  useLayoutEffect(() => {
    const element = captionRef.current;
    if (!element) {
      setNudge(0);
      return;
    }
    const rect = element.getBoundingClientRect();
    const left = rect.left - nudge;
    const right = rect.right - nudge;
    const viewportWidth = document.documentElement.clientWidth;
    if (right > viewportWidth - VIEWPORT_GUTTER) setNudge(Math.max(VIEWPORT_GUTTER - left, viewportWidth - VIEWPORT_GUTTER - right));
    else if (left < VIEWPORT_GUTTER) setNudge(VIEWPORT_GUTTER - left);
    else setNudge(0);
    // only re-measure when a new caption shows up, nudge is read just to undo the previous one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caption]);

  return (
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
            ref={captionRef}
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            style={{ marginLeft: nudge }}
            className={`absolute bottom-full z-30 mb-2 w-max rounded-full border border-line-strong bg-panel px-2.5 py-1 font-mono text-[11px] whitespace-nowrap text-muted shadow-lg ${captionClassName}`}
          >
            <span className="text-accent">✦</span> {caption}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};

// keeps a full screen flourish on screen for a moment, then lets it fade out
const useFlourish = (lastsMs) => {
  const [isShown, setIsShown] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const show = () => {
    setIsShown(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setIsShown(false), lastsMs);
  };

  return [isShown, show];
};

// full screen effects mount at the body so a parent's transform or overflow can't clip them
const Flourish = ({ isShown, children }) =>
  createPortal(<AnimatePresence>{isShown && children}</AnimatePresence>, document.body);

// letters land one at a time, the way old game text boxes print
const TypedText = ({ text, startAt = 0, perLetter = 0.04 }) =>
  [...text].map((letter, index) => (
    <motion.span key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.01, delay: startAt + index * perLetter }}>
      {letter}
    </motion.span>
  ));

// three triangles that drop into place once found
const TRIFORCE_PIECES = ["M8 1 L12 8 L4 8 Z", "M4 8 L8 15 L0 15 Z", "M12 8 L16 15 L8 15 Z"];

// where each piece flies in from before snapping together, the way the Triforce assembles in the games
const TRIFORCE_ENTRANCES = [
  { x: 0, y: -260 },
  { x: -320, y: 220 },
  { x: 320, y: 220 },
];

// the pieces fly in and join, then the classic text box tells you what you got
const ItemGet = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-black/60 px-4"
    aria-hidden="true"
  >
    <div className="relative grid size-[min(60vw,16rem)] place-items-center">
      <svg viewBox="0 0 16 16" className="relative size-full overflow-visible" style={{ filter: `drop-shadow(0 0 18px ${GOLD})` }}>
        {TRIFORCE_PIECES.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            fill={GOLD}
            initial={{ x: TRIFORCE_ENTRANCES[index].x / 16, y: TRIFORCE_ENTRANCES[index].y / 16, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 + index * 0.12, ease: easeOutExpo }}
          />
        ))}
      </svg>
    </div>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 1 }}
      className="w-full max-w-md rounded-md border-4 border-double border-white bg-black px-5 py-4 font-mono text-base text-white"
    >
      <TypedText text="You got the " startAt={1.2} />
      <span className="text-[#e04a3a]">
        <TypedText text="Triforce" startAt={1.68} />
      </span>
      <TypedText text="!" startAt={2} />
    </motion.p>
  </motion.div>
);

export const Triforce = ({ className }) => {
  const [isFound, find, caption] = useSecret("triforce");
  const [isHeldUp, holdUp] = useFlourish(ITEM_GET_MS);

  const open = () => {
    find({ countAfterMs: ITEM_GET_MS });
    holdUp();
  };

  return (
    <>
      <SecretButton
        label="A small golden relic"
        caption={caption}
        captionClassName="right-0"
        className={className}
        onClick={open}
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
      <Flourish isShown={isHeldUp}>
        <ItemGet />
      </Flourish>
    </>
  );
};

// the octagon of alternating wedges, grey until someone pokes it. turned an eighth of a wedge
// so a red one points straight up and the top edge sits flat, like the logo on every RE box
const WEDGE_TURN = -Math.PI / 8;
const UMBRELLA_WEDGES = Array.from({ length: 8 }, (_, index) => {
  const angle = WEDGE_TURN + (index * Math.PI) / 4;
  const next = WEDGE_TURN + ((index + 1) * Math.PI) / 4;
  const point = (a) => `${(8 + 7.5 * Math.sin(a)).toFixed(2)} ${(8 - 7.5 * Math.cos(a)).toFixed(2)}`;
  return { path: `M8 8 L${point(angle)} L${point(next)} Z`, isRed: index % 2 === 0 };
});

// the save room: the logo unfolds out of the dark, then the typewriter clacks out the confirmation
const SaveRoom = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-black/90 px-4"
    aria-hidden="true"
  >
    <svg viewBox="0 0 16 16" className="size-[min(50vw,13rem)] overflow-visible">
      {UMBRELLA_WEDGES.map(({ path, isRed }, index) => (
        <motion.path
          key={path}
          d={path}
          fill={isRed ? UMBRELLA_RED : "#f4f1ea"}
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: index * 0.07, ease: easeOutExpo }}
          style={{ transformOrigin: "8px 8px" }}
        />
      ))}
    </svg>
    <p className="text-center font-serif text-[clamp(1.1rem,4vw,2rem)] tracking-[0.25em] text-[#e9e2d0] uppercase">
      <TypedText text="Your game has been saved." startAt={0.9} perLetter={0.06} />
    </p>
  </motion.div>
);

export const Umbrella = ({ className }) => {
  const [isFound, find, caption] = useSecret("umbrella");
  const [isSaving, save] = useFlourish(SAVE_ROOM_MS);

  const saveGame = () => {
    find({ countAfterMs: SAVE_ROOM_MS });
    save();
  };

  return (
    <>
      <SecretButton
        label="A corporate logo"
        caption={caption}
        captionClassName="left-1/2 -translate-x-1/2 md:right-0 md:left-auto md:translate-x-0"
        className={className}
        onClick={saveGame}
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
      <Flourish isShown={isSaving}>
        <SaveRoom />
      </Flourish>
    </>
  );
};

const ALCHEMY_BLUE = "#6ec3ff";

// the circle draws itself line by line, then blue sparks crackle around it like the anime's transmutation light
const TransmutationFlash = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
    className="pointer-events-none fixed inset-0 z-50 grid place-items-center bg-black/40"
    aria-hidden="true"
  >
    <motion.svg
      viewBox="0 0 100 100"
      className="size-[min(80vw,28rem)]"
      initial={{ rotate: -30 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 2.4, ease: easeOutExpo }}
      style={{ filter: `drop-shadow(0 0 8px ${ALCHEMY_BLUE})` }}
    >
      {[
        "M50 4 A46 46 0 1 1 49.9 4",
        "M50 14 A36 36 0 1 1 49.9 14",
        "M50 14 L81 68 L19 68 Z",
        "M50 86 L19 32 L81 32 Z",
        "M50 38 A12 12 0 1 1 49.9 38",
      ].map((path, index) => (
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke={ALCHEMY_BLUE}
          strokeWidth="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: index * 0.15, ease: "easeInOut" }}
        />
      ))}
      {["M8 30 L14 34 L11 38 L18 42", "M92 62 L85 60 L88 55 L80 52", "M40 96 L44 90 L48 93 L52 86"].map((bolt, index) => (
        <motion.path
          key={bolt}
          d={bolt}
          fill="none"
          stroke="#e6f6ff"
          strokeWidth="0.9"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 0.5, delay: 0.9 + index * 0.2, repeat: 1 }}
        />
      ))}
    </motion.svg>
  </motion.div>
);

// a tiny transmutation circle tucked into the philosophy line. equivalent exchange: one click, one secret
export const Alchemy = ({ className }) => {
  const [isFound, find, caption] = useSecret("alchemy");
  const [isFlashing, flash] = useFlourish(TRANSMUTATION_MS);

  const transmute = () => {
    find({ countAfterMs: TRANSMUTATION_MS });
    flash();
  };

  const ink = isFound ? ALCHEMY_BLUE : "currentColor";

  return (
    <>
      <SecretButton label="A chalk circle" caption={caption} className={className} onClick={transmute}>
        <svg
          viewBox="0 0 16 16"
          className="size-4"
          aria-hidden="true"
          style={isFound ? { filter: `drop-shadow(0 0 3px ${ALCHEMY_BLUE})` } : undefined}
        >
          <circle cx="8" cy="8" r="7" fill="none" stroke={ink} strokeWidth="0.9" />
          <path d="M8 2.5 L12.8 10.8 L3.2 10.8 Z" fill="none" stroke={ink} strokeWidth="0.9" />
          <circle cx="8" cy="8.2" r="1.6" fill="none" stroke={ink} strokeWidth="0.9" />
        </svg>
      </SecretButton>
      <Flourish isShown={isFlashing}>
        <TransmutationFlash />
      </Flourish>
    </>
  );
};

const AIR_ORANGE = "#f5a524";
// one gust per element, top to bottom: water, earth, fire, air
const GUSTS = [
  { top: "18%", color: "#4aa8ff", delay: 0 },
  { top: "38%", color: "#5fbf5a", delay: 0.12 },
  { top: "58%", color: "#ff5a3c", delay: 0.24 },
  { top: "78%", color: AIR_ORANGE, delay: 0.36 },
];

const Gust = ({ top, color, delay }) => (
  <motion.svg
    viewBox="0 0 120 20"
    className="absolute left-0 h-10 w-[60vw]"
    style={{ top }}
    initial={{ x: "-60vw", opacity: 0 }}
    animate={{ x: "110vw", opacity: [0, 1, 1, 0] }}
    transition={{ duration: 1.6, delay, ease: "easeInOut" }}
  >
    <path d="M0 12 C30 12 50 4 80 8 C95 10 100 16 92 17 C86 18 84 12 90 11" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <path d="M10 17 C40 17 60 14 100 15" fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
  </motion.svg>
);

// the four nations sweep across the screen as wind, one gust each
const ElementGusts = () => (
  <motion.div exit={{ opacity: 0 }} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
    {GUSTS.map((gust) => (
      <Gust key={gust.top} {...gust} />
    ))}
  </motion.div>
);

// the air nomad swirl, hiding next to the pixel me. he's not the Avatar, but he can bend a little
export const Airbender = ({ className }) => {
  const [isFound, find, caption] = useSecret("airbender");
  const [isBlowing, blow] = useFlourish(GUSTS_MS);

  const bend = () => {
    find({ countAfterMs: GUSTS_MS });
    blow();
  };

  return (
    <>
      <SecretButton label="A spiral of wind" caption={caption} captionClassName="left-1/2 -translate-x-1/2" className={className} onClick={bend}>
        <motion.svg
          viewBox="0 0 16 16"
          className="size-4"
          aria-hidden="true"
          initial={false}
          animate={{ rotate: isFound ? 360 : 0 }}
          transition={{ duration: 1.2, ease: easeOutExpo }}
        >
          {[0, 120, 240].map((turn) => (
            <path
              key={turn}
              d="M8 8 C8 5 11 3.5 13 5 C14.5 6.2 13.5 8.5 11.5 8"
              fill="none"
              stroke={isFound ? AIR_ORANGE : "currentColor"}
              strokeWidth="1.1"
              strokeLinecap="round"
              transform={`rotate(${turn} 8 8)`}
            />
          ))}
        </motion.svg>
      </SecretButton>
      <Flourish isShown={isBlowing}>
        <ElementGusts />
      </Flourish>
    </>
  );
};

const HANAFUDA_RED = "#d8342c";
const WATER_BLUE = "#3fa9f5";

// one long curved slash of water across the screen, with a white edge where the blade cut
const WaterSlash = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.6 }}
    className="pointer-events-none fixed inset-0 z-50"
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="size-full overflow-visible">
      {[
        { color: WATER_BLUE, width: 3.2, opacity: 0.7 },
        { color: "#bfe6ff", width: 1.4, opacity: 0.9 },
        { color: "#ffffff", width: 0.4, opacity: 1 },
      ].map(({ color, width, opacity }) => (
        <motion.path
          key={color}
          d="M-5 48 C20 20 55 10 105 18"
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          opacity={opacity}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      ))}
    </svg>
  </motion.div>
);

// Tanjiro's sun earring, a little hanafuda card. flip it and he answers with Water Breathing
export const Hanafuda = ({ className }) => {
  const [isFound, find, caption] = useSecret("hanafuda");
  const [isSlashing, slash] = useFlourish(WATER_SLASH_MS);

  const breathe = () => {
    find({ countAfterMs: WATER_SLASH_MS });
    slash();
  };

  return (
    <>
      <SecretButton
        label="A small card earring"
        caption={caption}
        captionClassName="left-1/2 -translate-x-1/2 md:right-0 md:left-auto md:translate-x-0"
        className={className}
        onClick={breathe}
      >
        <motion.svg
          viewBox="0 0 16 16"
          className="size-4"
          aria-hidden="true"
          initial={false}
          animate={{ rotateY: isFound ? 360 : 0 }}
          transition={{ duration: 0.8, ease: easeOutExpo }}
        >
          <rect x="4" y="1" width="8" height="14" rx="1" fill={isFound ? "#f4f1ea" : "transparent"} stroke="currentColor" strokeWidth="0.9" />
          <circle cx="8" cy="6" r="2.3" fill={isFound ? HANAFUDA_RED : "currentColor"} />
          <path d="M4.5 10 H11.5 M4.5 12 H11.5" stroke={isFound ? "#2b2b2b" : "currentColor"} strokeWidth="0.9" />
        </motion.svg>
      </SecretButton>
      <Flourish isShown={isSlashing}>
        <WaterSlash />
      </Flourish>
    </>
  );
};

const GRACE_GOLD = "#f5d77a";

// the gold banner Elden Ring rolls across the screen the first time you touch a grace
const GraceDiscovered = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2 }}
    className="pointer-events-none fixed inset-x-0 top-1/2 z-50 -translate-y-1/2"
    aria-hidden="true"
  >
    <div className="bg-gradient-to-r from-transparent via-black/85 to-transparent px-4 py-8 text-center">
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: easeOutExpo }}
        className="mx-auto mb-4 block h-px max-w-xl bg-gradient-to-r from-transparent via-[#f5d77a]/70 to-transparent"
      />
      <motion.p
        initial={{ letterSpacing: "0.45em", opacity: 0 }}
        animate={{ letterSpacing: "0.2em", opacity: 1 }}
        transition={{ duration: 1.8, ease: easeOutExpo }}
        className="font-serif text-[clamp(1.25rem,5.5vw,3.75rem)] uppercase"
        style={{ color: GRACE_GOLD, textShadow: `0 0 28px ${GRACE_GOLD}88` }}
      >
        Lost Grace Discovered
      </motion.p>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, ease: easeOutExpo }}
        className="mx-auto mt-4 block h-px max-w-xl bg-gradient-to-r from-transparent via-[#f5d77a]/70 to-transparent"
      />
    </div>
  </motion.div>
);

// specks of gold that drift up off a lit grace
const GRACE_MOTES = [
  { x: 5, delay: 0 },
  { x: 11, delay: 0.7 },
  { x: 8, delay: 1.3 },
];

// the Elden Ring sigil sits quiet after the contact terminal logs out. touch it and it lights up like a site of grace
export const Grace = ({ className }) => {
  const [isLit, find, caption] = useSecret("grace");
  const [isBannerShown, setIsBannerShown] = useState(false);
  const bannerTimer = useRef(null);

  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  const touch = () => {
    find({ countAfterMs: GRACE_BANNER_MS });
    setIsBannerShown(true);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setIsBannerShown(false), GRACE_BANNER_MS);
  };

  const ink = isLit ? GRACE_GOLD : "currentColor";

  return (
    <>
      <SecretButton label="A faded golden sigil" caption={caption} className={className} onClick={touch}>
        <svg
          viewBox="0 0 16 16"
          className="size-4 overflow-visible"
          aria-hidden="true"
          style={isLit ? { filter: `drop-shadow(0 0 3px ${GRACE_GOLD})` } : undefined}
        >
          <path d="M8 1 V15" stroke={ink} strokeWidth="1" strokeLinecap="round" />
          <circle cx="8" cy="5" r="2.6" fill="none" stroke={ink} strokeWidth="0.9" />
          <path d="M3.2 6.5 A4.8 4.8 0 0 0 12.8 6.5" fill="none" stroke={ink} strokeWidth="0.9" />
          <path d="M5 11.5 A3 3 0 0 1 11 11.5" fill="none" stroke={ink} strokeWidth="0.9" />
          {isLit &&
            GRACE_MOTES.map(({ x, delay }) => (
              <motion.circle
                key={x}
                cx={x}
                cy="14"
                r="0.7"
                fill={GRACE_GOLD}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: [0, -12], opacity: [0, 1, 0] }}
                transition={{ duration: 2, delay, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
        </svg>
      </SecretButton>
      {/* the sigil lives inside a line of terminal text, so the full screen banner renders up at the body instead */}
      {createPortal(<AnimatePresence>{isBannerShown && <GraceDiscovered />}</AnimatePresence>, document.body)}
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

// a little wizard hat on top of the skills. tap it and a magician flies in and buffs every stat on the page
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
    find();
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
      <Flourish isShown={isFlying}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed right-4 bottom-12 z-50 font-mono text-[11px] text-muted"
          aria-hidden="true"
        >
          pixel art by TeykioArts
        </motion.p>
      </Flourish>
    </>
  );
};

const STAR_BURST = [-50, 0, 50];

// the ball clicks shut in the middle of the screen, three stars pop out, and the dialogue box confirms the catch
const Gotcha = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 bg-black/50 px-4"
    aria-hidden="true"
  >
    <div className="relative">
      <motion.svg
        viewBox="0 0 16 16"
        className="size-[min(40vw,9rem)]"
        initial={{ scale: 0.4 }}
        animate={{ scale: [0.4, 1.15, 1] }}
        transition={{ duration: 0.45, ease: easeOutExpo }}
      >
        <path d="M1 8 A7 7 0 0 1 15 8 Z" fill={POKEBALL_RED} />
        <path d="M1 8 A7 7 0 0 0 15 8 Z" fill="#f4f1ea" />
        <circle cx="8" cy="8" r="7" fill="none" stroke="#1b1b1b" strokeWidth="0.8" />
        <path d="M1 8 H15" stroke="#1b1b1b" strokeWidth="0.8" />
        <circle cx="8" cy="8" r="2" fill="#f4f1ea" stroke="#1b1b1b" strokeWidth="0.8" />
      </motion.svg>
      {STAR_BURST.map((drift, index) => (
        <motion.svg
          key={drift}
          viewBox="0 0 8 8"
          className="absolute top-0 left-1/2 size-6 -translate-x-1/2"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{ x: drift, y: [0, -70, -50], opacity: [0, 1, 0], scale: [0, 1.2, 0.8] }}
          transition={{ duration: 0.9, delay: 0.3 + index * 0.05, ease: "easeOut" }}
        >
          <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#ffd84a" />
        </motion.svg>
      ))}
    </div>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.5 }}
      className="w-full max-w-md rounded-xl border-4 border-[#3b5ba7] bg-[#f8f8f0] px-5 py-4 font-mono text-base text-[#202020] shadow-[inset_0_0_0_3px_#c8d8f0]"
    >
      <TypedText text="Gotcha! Cristopher was caught!" startAt={0.7} />
    </motion.p>
  </motion.div>
);

// grey until caught. it wobbles three times, then clicks shut like it should
export const Pokeball = ({ className }) => {
  const [isFound, find, caption] = useSecret("pokeball");
  const wobbleControls = useAnimationControls();
  const [isCelebrating, celebrate] = useFlourish(GOTCHA_MS);

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
    find({ withSound: false, countAfterMs: GOTCHA_MS });
    celebrate();
    isWobbling.current = false;
  };

  return (
    <>
      <SecretButton label="A red and white ball" caption={caption} className={className} onClick={throwBall}>
        <motion.svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" animate={wobbleControls} style={{ originY: 1 }}>
          <path d="M1 8 A7 7 0 0 1 15 8 Z" fill={isFound ? POKEBALL_RED : "currentColor"} />
          <path d="M1 8 A7 7 0 0 0 15 8 Z" fill={isFound ? "#f4f1ea" : "transparent"} />
          <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M1 8 H15" stroke="currentColor" strokeWidth="1" />
          <circle cx="8" cy="8" r="2" fill={isFound ? "#f4f1ea" : "var(--color-ink)"} stroke="currentColor" strokeWidth="1" />
        </motion.svg>
      </SecretButton>
      <Flourish isShown={isCelebrating}>
        <Gotcha />
      </Flourish>
    </>
  );
};
