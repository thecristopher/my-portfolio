import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { SECRETS, SECRET_IDS, readFound, secretTooltip, useSecret } from "../../lib/secrets";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../lib/magic";
import { playSound } from "../../lib/sound";
import { easeOutExpo } from "../../lib/motion";
import { PERCEPTION_DC, localRoll, verdictFor } from "../../lib/dice";
import { useLazyGetRollQuery } from "../../api/rollApi";
import darkMagicianGirl from "../../assets/images/dark-magician-girl.png";

const GOLD = "#e8c35a";
const UMBRELLA_RED = "#d62828";
const POKEBALL_RED = "#e3350d";

const VIEWPORT_GUTTER = 16;

// how long each full screen effect stays up, the secret count pops in once it clears
const ITEM_GET_MS = 3600;
const SAVE_ROOM_MS = 4200;
const TRANSMUTATION_MS = 2600;
const GUSTS_MS = 2800;
const WATER_SLASH_MS = 1200;
const GOTCHA_MS = 3000;
const GRACE_BANNER_MS = 3000;
const WEB_MS = 4300;
const BAT_TRANSITION_MS = 3600;

// one pip per secret on the page, lit in that secret's own color once found, so the score reads at a glance
const SecretPips = ({ found, current }) => (
  <span className="flex items-center gap-1" aria-hidden="true">
    {SECRET_IDS.map((id) => {
      const isLit = found.includes(id);
      return (
        <motion.span
          key={id}
          initial={false}
          animate={id === current ? { scale: [0.4, 1.5, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, delay: 0.25, ease: easeOutExpo }}
          className={`size-1.5 rounded-full ${isLit ? "" : "bg-line-strong"}`}
          style={isLit ? { background: SECRETS[id].color, boxShadow: `0 0 6px ${SECRETS[id].color}` } : undefined}
        />
      );
    })}
  </span>
);

// the effect does the storytelling, the pill next to the icon mixes the franchise with me and keeps score.
// it pops up once the effect clears, and again on hover for anything already found.
// once it mounts it nudges itself sideways if it would spill past either edge of the screen
const SecretButton = ({ id, isFound, label, onClick, caption, captionClassName = "left-0", className = "", children }) => {
  const captionRef = useRef(null);
  const [nudge, setNudge] = useState(0);
  const [isPeeking, setIsPeeking] = useState(false);

  const peek = isFound && isPeeking ? secretTooltip(id, readFound()) : null;
  const tooltip = caption ?? peek;
  const isShown = Boolean(tooltip);

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
    // only re-measure when the pill shows up, nudge is read just to undo the previous one
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShown, caption]);

  return (
    <span
      className={`relative inline-block ${className}`}
      onPointerEnter={() => setIsPeeking(true)}
      onPointerLeave={() => setIsPeeking(false)}
      onFocus={() => setIsPeeking(true)}
      onBlur={() => setIsPeeking(false)}
    >
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="grid size-8 touch-manipulation place-items-center rounded-md text-faint/40 transition-colors hover:text-faint"
      >
        {children}
      </button>
      <AnimatePresence>
        {tooltip && (
          <motion.span
            ref={captionRef}
            role={caption ? "status" : undefined}
            initial={{ opacity: 0, y: 6, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            style={{ marginLeft: nudge, "--secret": SECRETS[id].color }}
            className={`secret-tooltip pointer-events-none absolute bottom-full z-30 mb-2 flex w-max max-w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 rounded-xl border border-line-strong bg-panel/90 px-3 py-2.5 text-left font-mono text-[11px] text-muted shadow-[0_18px_40px_-12px_color-mix(in_oklab,var(--color-shadow)_70%,transparent)] backdrop-blur-xl ${captionClassName}`}
          >
            <span className="leading-snug text-pretty whitespace-normal text-fg">
              <span style={{ color: SECRETS[id].color }}>✦</span> {tooltip.quip}
            </span>
            <span className="flex items-center justify-between gap-4 border-t border-line pt-2 whitespace-nowrap">
              <SecretPips found={tooltip.found} current={caption ? id : null} />
              <span className="tabular-nums text-faint">{tooltip.count}</span>
            </span>
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
        id="triforce" isFound={isFound} label="A small golden relic"
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
        id="umbrella" isFound={isFound} label="A corporate logo"
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
    {/* the glow is a still gradient behind the circle. a glow filter on the turning circle would repaint every
        frame, and phones can't keep up with that */}
    <div
      className="absolute size-[min(95vw,34rem)] rounded-full"
      style={{ background: `radial-gradient(circle, ${ALCHEMY_BLUE}33 0%, ${ALCHEMY_BLUE}1a 45%, transparent 70%)` }}
    />
    <motion.svg
      viewBox="0 0 100 100"
      className="relative size-[min(80vw,28rem)]"
      initial={{ rotate: -30 }}
      animate={{ rotate: 0 }}
      transition={{ duration: 2.4, ease: easeOutExpo }}
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

// a tiny transmutation circle tucked into the philosophy line. equivalent exchange, like the line says: hard problems in, readable code out
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
      <SecretButton id="alchemy" isFound={isFound} label="A chalk circle" caption={caption} className={className} onClick={transmute}>
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
// one gust per element, top to bottom: water, earth, fire, air. they arrive one beat apart, like the intro narration
const GUSTS = [
  { top: "18%", color: "#4aa8ff", delay: 0 },
  { top: "38%", color: "#5fbf5a", delay: 0.35 },
  { top: "58%", color: "#ff5a3c", delay: 0.7 },
  { top: "78%", color: AIR_ORANGE, delay: 1.05 },
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

// the air nomad swirl under profile.json, from the editor to the org chart. every element, every stack
export const Airbender = ({ className }) => {
  const [isFound, find, caption] = useSecret("airbender");
  const [isBlowing, blow] = useFlourish(GUSTS_MS);

  const bend = () => {
    find({ countAfterMs: GUSTS_MS });
    blow();
  };

  return (
    <>
      <SecretButton id="airbender" isFound={isFound} label="A spiral of wind" caption={caption} captionClassName="left-1/2 -translate-x-1/2" className={className} onClick={bend}>
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
        id="hanafuda" isFound={isFound} label="A small card earring"
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
      <SecretButton id="grace" isFound={isLit} label="A faded golden sigil" caption={caption} className={className} onClick={touch}>
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

// a little wizard hat on top of the skills. tap it and a magician flies in and turns every skill into a duel monster for good
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
      <SecretButton id="magician" isFound={isFound} label="A pointy wizard hat" caption={caption} captionClassName="right-0" className={className} onClick={summon}>
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
      <SecretButton id="pokeball" isFound={isFound} label="A red and white ball" caption={caption} className={className} onClick={throwBall}>
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

const SPIDER_RED = "#e23636";
const BAT_YELLOW = "#f5c518";

// the little spider from the chest of the suit: two body segments and four legs a side
const SPIDER_LEGS = [
  "M6.6 6.6 L3.5 3.8 L2.6 1",
  "M9.4 6.6 L12.5 3.8 L13.4 1",
  "M6.3 8.2 L2.6 7.2 L1 9",
  "M9.7 8.2 L13.4 7.2 L15 9",
  "M6.4 9.8 L3.2 11.6 L2.2 15",
  "M9.6 9.8 L12.8 11.6 L13.8 15",
  "M6.9 11.4 L5 13.5 L4.6 15.4",
  "M9.1 11.4 L11 13.5 L11.4 15.4",
];

// eight spokes out of the middle and rings that sag between them, the way a real web hangs
const WEB_SPOKES = Array.from({ length: 8 }, (_, index) => (index * Math.PI) / 4);
const webPoint = (angle, radius) => [50 + radius * Math.cos(angle), 50 + radius * Math.sin(angle)];
const WEB_RINGS = [12, 22, 32, 43].map((radius) =>
  [...WEB_SPOKES, 2 * Math.PI]
    .map((angle, index) => {
      const [x, y] = webPoint(angle, radius).map((value) => value.toFixed(1));
      if (index === 0) return `M${x} ${y}`;
      const [sagX, sagY] = webPoint(angle - Math.PI / 8, radius * 0.82).map((value) => value.toFixed(1));
      return `Q${sagX} ${sagY} ${x} ${y}`;
    })
    .join(" ")
);

const SpiderGlyph = ({ fill }) => (
  <>
    {SPIDER_LEGS.map((leg) => (
      <path key={leg} d={leg} fill="none" stroke={fill} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    ))}
    <ellipse cx="8" cy="6.4" rx="1.5" ry="1.7" fill={fill} />
    <ellipse cx="8" cy="10.2" rx="1.9" ry="2.6" fill={fill} />
  </>
);

// our friendly neighbor's mask: a head that narrows to the chin, webbing that fans out from the nose,
// and the classic lenses, wide and rounded at the temples, tapering to a point by the nose, with a thick black frame
const MASK_HEAD = "M50 8 C73 8 86 26 86 50 C86 72 78 92 66 104 C60 110 55 113 50 113 C45 113 40 110 34 104 C22 92 14 72 14 50 C14 26 27 8 50 8 Z";
const MASK_LEFT_EYE = "M45 65 C42.5 55 37 47 28 44 C22.5 42.2 18.5 44 18.5 49 C18.5 57 24 63.5 31 65.5 C37 67 41.5 67 45 65 Z";
const MASK_CENTER = [50, 70];
const MASK_SPOKES = Array.from({ length: 16 }, (_, index) => (index * Math.PI) / 8);
const maskPoint = (angle, radius) => [MASK_CENTER[0] + radius * Math.cos(angle), MASK_CENTER[1] + radius * Math.sin(angle) * 1.1];
const MASK_RINGS = [13, 25, 38, 52, 68].map((radius) =>
  [...MASK_SPOKES, 2 * Math.PI]
    .map((angle, index) => {
      const [x, y] = maskPoint(angle, radius).map((value) => value.toFixed(1));
      if (index === 0) return `M${x} ${y}`;
      const [sagX, sagY] = maskPoint(angle - Math.PI / 16, radius * 0.9).map((value) => value.toFixed(1));
      return `Q${sagX} ${sagY} ${x} ${y}`;
    })
    .join(" ")
);

const SpiderFace = ({ className, style }) => (
  <svg viewBox="0 0 100 120" className={className} style={style}>
    <defs>
      <clipPath id="spider-mask-head">
        <path d={MASK_HEAD} />
      </clipPath>
      <radialGradient id="spider-mask-shade" cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#ef3b3b" />
        <stop offset="100%" stopColor="#a5161b" />
      </radialGradient>
    </defs>
    <path d={MASK_HEAD} fill="url(#spider-mask-shade)" />
    <g clipPath="url(#spider-mask-head)" fill="none" stroke="#1a0606" strokeWidth="0.9" opacity="0.6">
      {MASK_SPOKES.map((angle) => {
        const [x, y] = maskPoint(angle, 90).map((value) => value.toFixed(1));
        const [startX, startY] = maskPoint(angle, 4).map((value) => value.toFixed(1));
        return <path key={angle} d={`M${startX} ${startY} L${x} ${y}`} />;
      })}
      {MASK_RINGS.map((ring) => (
        <path key={ring} d={ring} />
      ))}
    </g>
    <path d={MASK_HEAD} fill="none" stroke="#111111" strokeWidth="1.6" />
    {[undefined, "translate(100 0) scale(-1 1)"].map((mirror) => (
      <path key={mirror ?? "left"} d={MASK_LEFT_EYE} transform={mirror} fill="#f4f1ea" stroke="#111111" strokeWidth="5.5" strokeLinejoin="round" />
    ))}
  </svg>
);

// a "THWIP!", our friendly neighbor drops in on his thread, the web spins itself and a comic caption box names the hero
const WebSwing = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-black/60 px-4"
    aria-hidden="true"
  >
    <div className="relative size-[min(70vw,20rem)]">
      {/* the thread hangs from above the screen down to the middle of the web, unrolling as the spider drops */}
      <motion.span
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
        className="absolute bottom-1/2 left-1/2 h-screen w-px origin-top bg-white/80"
      />
      <svg viewBox="0 0 100 100" className="size-full overflow-visible">
        {WEB_SPOKES.map((angle, index) => {
          const [x, y] = webPoint(angle, 48);
          return (
            <motion.path
              key={angle}
              d={`M50 50 L${x.toFixed(1)} ${y.toFixed(1)}`}
              stroke="#f4f1ea"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, delay: 0.3 + index * 0.04, ease: "easeOut" }}
            />
          );
        })}
        {WEB_RINGS.map((ring, index) => (
          <motion.path
            key={ring}
            d={ring}
            fill="none"
            stroke="#f4f1ea"
            strokeWidth="0.45"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.6 + index * 0.15, ease: "easeInOut" }}
          />
        ))}
      </svg>
      {/* he drops down his thread into the middle of the web and swings there for a moment */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2"
        initial={{ y: "-50vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
      >
        <div
          className="absolute -inset-1/3 rounded-full"
          style={{ background: `radial-gradient(circle, ${SPIDER_RED}55 0%, transparent 65%)` }}
        />
        <motion.div
          animate={{ rotate: [0, 7, -5, 3, 0] }}
          transition={{ duration: 1.6, delay: 0.6, ease: "easeInOut" }}
          style={{ originY: 0 }}
          className="relative"
        >
          <SpiderFace className="w-full" />
        </motion.div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, scale: 0.4, rotate: -18 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 1], rotate: -12 }}
        transition={{ duration: 1.2, times: [0, 0.15, 0.7, 1] }}
        className="absolute -top-4 -left-2 font-sans text-[clamp(1.5rem,6vw,2.5rem)] font-black tracking-tight text-white italic"
        style={{ WebkitTextStroke: `1.5px ${SPIDER_RED}` }}
      >
        THWIP!
      </motion.p>
    </div>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 1.5 }}
      className="w-full max-w-md -rotate-1 border-2 border-black bg-[#ffe14d] px-5 py-3 text-center font-sans text-sm font-bold tracking-wide text-black uppercase shadow-[4px_4px_0_#000]"
    >
      <TypedText text="Your friendly neighborhood developer." startAt={1.7} perLetter={0.035} />
    </motion.p>
  </motion.div>
);

// a spider hanging off the degree, Peter Parker was a student first. with great power comes great responsibility
export { SpiderFace };
export const Spider = ({ className }) => {
  const [isFound, find, caption] = useSecret("spider");
  const [isSwinging, swing] = useFlourish(WEB_MS);

  const thwip = () => {
    find({ countAfterMs: WEB_MS });
    swing();
  };

  return (
    <>
      <SecretButton id="spider" isFound={isFound} label="A tiny spider" caption={caption} className={className} onClick={thwip}>
        <motion.svg
          viewBox="0 0 16 16"
          className="size-4"
          aria-hidden="true"
          initial={false}
          animate={isFound ? { y: [-6, 1, 0] } : { y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        >
          <SpiderGlyph fill={isFound ? SPIDER_RED : "currentColor"} />
        </motion.svg>
      </SecretButton>
      <Flourish isShown={isSwinging}>
        <WebSwing />
      </Flourish>
    </>
  );
};

// the bat from the 1966 show's logo, sized for a 100 by 50 box
const BAT_PATH =
  "M47 8 L48.6 13.5 L51.4 13.5 L53 8 L54.6 16 C59 16 63 13 64 8 C75 11 88 18 93 30 C87 26 81 27 77 31 C74 26 68 26 65 32 C61 29 54 31 50 41 C46 31 39 29 35 32 C32 26 26 26 23 31 C19 27 13 26 7 30 C12 18 25 11 36 8 C37 13 41 16 45.4 16 Z";

const BatEmblem = ({ className, oval = BAT_YELLOW, bat = "#111111", style }) => (
  <svg viewBox="0 0 100 50" className={className} style={style} aria-hidden="true">
    <ellipse cx="50" cy="25" rx="48" ry="23" fill={oval} stroke={bat} strokeWidth="2" />
    <path d={BAT_PATH} fill={bat} />
  </svg>
);

// sixteen points around a center, the jagged balloon every "POW!" in the old show came in
const BURST_POINTS = Array.from({ length: 32 }, (_, index) => {
  const angle = (index * Math.PI) / 16;
  const radius = index % 2 === 0 ? 48 : 32;
  return `${(50 + radius * Math.cos(angle)).toFixed(1)},${(50 + radius * Math.sin(angle)).toFixed(1)}`;
}).join(" ");

// each one lands on a syllable of "Bat-man!" in the jingle
const BAT_BURSTS = [
  { word: "POW!", at: 2.35, className: "top-[18%] left-[8%]", color: "#e23636", tilt: -14 },
  { word: "BAM!", at: 2.65, className: "right-[8%] bottom-[18%]", color: "#2f6fdf", tilt: 10 },
];

const Burst = ({ word, at, className, color, tilt }) => (
  <motion.div
    initial={{ scale: 0, rotate: tilt - 30 }}
    animate={{ scale: [0, 1.25, 1], rotate: tilt }}
    transition={{ duration: 0.35, delay: at, ease: easeOutExpo }}
    className={`absolute grid size-[min(34vw,10rem)] place-items-center ${className}`}
  >
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
      <polygon points={BURST_POINTS} fill={BAT_YELLOW} stroke="#111111" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
    <span className="relative font-sans text-[clamp(1.25rem,5vw,2.5rem)] font-black italic" style={{ color, WebkitTextStroke: "1.5px #111" }}>
      {word}
    </span>
  </motion.div>
);

// the 1966 scene change: the bat logo spins out of nowhere to fill the screen, then the fight words land on the beat
const BatTransition = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[radial-gradient(circle,#1d2a5c_0%,#05060d_75%)]"
    aria-hidden="true"
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="absolute h-[min(60vw,22rem)] w-[min(100vw,40rem)] rounded-full"
      style={{ background: `radial-gradient(closest-side, ${BAT_YELLOW}44, transparent)` }}
    />
    <motion.div
      initial={{ scale: 0.02, rotate: 0 }}
      animate={{ scale: 1, rotate: 1080 }}
      transition={{ duration: 1.8, ease: [0.3, 0, 0.2, 1] }}
    >
      <BatEmblem className="w-[min(80vw,30rem)]" />
    </motion.div>
    {BAT_BURSTS.map((burst) => (
      <Burst key={burst.word} {...burst} />
    ))}
  </motion.div>
);

// a bat next to the email, the closest thing to a Bat-Signal. on call at 3 a.m.
export const Bat = ({ className }) => {
  const [isFound, find, caption] = useSecret("bat");
  const [isSpinning, spin] = useFlourish(BAT_TRANSITION_MS);

  const signal = () => {
    find({ countAfterMs: BAT_TRANSITION_MS });
    spin();
  };

  return (
    <>
      <SecretButton id="bat" isFound={isFound} label="A small bat" caption={caption} className={className} onClick={signal}>
        <motion.span
          className="block"
          initial={false}
          animate={{ rotate: isFound ? 360 : 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
        >
          {isFound ? (
            <BatEmblem className="w-5" />
          ) : (
            <svg viewBox="0 0 100 50" className="w-5" aria-hidden="true">
              <path d={BAT_PATH} fill="currentColor" />
            </svg>
          )}
        </motion.span>
      </SecretButton>
      <Flourish isShown={isSpinning}>
        <BatTransition />
      </Flourish>
    </>
  );
};

const D20_GOLD = "#d8b25a";
const D20_CRIMSON = "#c8443c";
// how long the die tumbles before it may settle, and how long the verdict stays up after it does
const D20_TUMBLE_MS = 1300;
const D20_VERDICT_MS = 3800;
// the API gets this long to answer before the page rolls the check itself
const D20_PATIENCE_MS = 1200;

// a d20 seen face on: the hexagon outline, the front triangle, and the edges running out to the rim
const D20_OUTLINE = "M50 4 L90 27 L90 73 L50 96 L10 73 L10 27 Z";
const D20_FACE = "M50 30 L72 66 L28 66 Z";
const D20_EDGES = "M50 30 L50 4 M50 30 L90 27 M50 30 L10 27 M72 66 L90 27 M72 66 L90 73 M72 66 L50 96 M28 66 L10 27 M28 66 L10 73 M28 66 L50 96";

const VERDICT_COLORS = { critical: D20_GOLD, success: D20_GOLD, failure: D20_CRIMSON, fumble: D20_CRIMSON };

const D20Shape = ({ className, children, fill = "none" }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <path d={D20_OUTLINE} fill={fill} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    <path d={D20_EDGES} fill="none" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.6" />
    <path d={D20_FACE} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    {children}
  </svg>
);

// numbers flicker across the face while the die tumbles, like the real roll in camp
const useFlicker = (isRolling) => {
  const [face, setFace] = useState(20);
  useEffect(() => {
    if (!isRolling) return undefined;
    const timer = setInterval(() => setFace(Math.floor(Math.random() * 20) + 1), 70);
    return () => clearInterval(timer);
  }, [isRolling]);
  return face;
};

// gold sparks thrown off a natural 20
const CRIT_SPARKS = Array.from({ length: 14 }, (_, index) => (index / 14) * Math.PI * 2);

// Baldur's Gate's ability check: the DC up top, the die tumbling in the middle, and the verdict stamped under it
const AbilityCheck = ({ result }) => {
  const isRolling = !result;
  const flicker = useFlicker(isRolling);
  const verdict = result ? verdictFor(result) : null;
  const color = verdict ? VERDICT_COLORS[verdict.tone] : D20_GOLD;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 px-4 text-[#efe3c4]"
      style={{ background: "radial-gradient(ellipse at center, rgba(28,22,14,0.94), rgba(5,4,3,0.97) 70%)" }}
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: easeOutExpo }}
        className="flex flex-col items-center gap-3 font-serif"
      >
        <p className="flex items-center gap-3 text-[11px] tracking-[0.45em] uppercase" style={{ color: D20_GOLD }}>
          <span className="h-px w-10 bg-current opacity-60" />◆ Perception Check ◆<span className="h-px w-10 bg-current opacity-60" />
        </p>
        <p className="text-xs tracking-[0.3em] text-[#b9ab8a] uppercase">Difficulty Class</p>
        <p className="text-5xl leading-none" style={{ color: D20_GOLD, textShadow: `0 0 24px ${D20_GOLD}66` }}>
          {PERCEPTION_DC}
        </p>
      </motion.div>

      <div className="relative grid size-[min(52vw,15rem)] place-items-center">
        {verdict?.tone === "critical" &&
          CRIT_SPARKS.map((angle) => (
            <motion.span
              key={angle}
              className="absolute top-1/2 left-1/2 h-0.5 w-10 origin-left rounded-full"
              style={{ background: D20_GOLD, rotate: `${(angle * 180) / Math.PI}deg`, boxShadow: `0 0 10px ${D20_GOLD}` }}
              initial={{ opacity: 0, x: 40, scaleX: 0.2 }}
              animate={{ opacity: [0, 1, 0], x: 150, scaleX: 1 }}
              transition={{ duration: 1, ease: easeOutExpo }}
            />
          ))}
        <motion.div
          className="size-full"
          style={{ color, filter: `drop-shadow(0 0 ${result ? 28 : 12}px ${color}88)` }}
          initial={{ rotate: -540, scale: 0.4, y: -80 }}
          animate={
            result
              ? { rotate: 0, scale: [1.12, 1], y: 0, x: verdict.tone === "fumble" ? [0, -10, 9, -6, 4, 0] : 0 }
              : { rotate: [-540, 30], scale: [0.4, 1.05, 0.95], y: [-80, 12, -6] }
          }
          transition={result ? { duration: 0.6, ease: easeOutExpo } : { duration: D20_TUMBLE_MS / 1000, ease: "easeOut" }}
        >
          <D20Shape className="size-full" fill="rgba(20,16,10,0.85)">
            <text x="50" y="59" textAnchor="middle" fontSize="20" fontFamily="Georgia, serif" fill="currentColor" stroke="none">
              {result ? result.roll : flicker}
            </text>
          </D20Shape>
        </motion.div>
      </div>

      <div className="flex min-h-24 flex-col items-center gap-3 text-center font-serif">
        {verdict && (
          <>
            <motion.p
              initial={{ opacity: 0, scale: 1.4, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, scale: 1, letterSpacing: "0.25em" }}
              transition={{ duration: 0.7, ease: easeOutExpo }}
              className="text-[clamp(1.6rem,6vw,3rem)] uppercase"
              style={{ color, textShadow: `0 0 30px ${color}88` }}
            >
              {verdict.label}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm text-[#b9ab8a] italic"
            >
              {result.roll} vs DC {result.dc}. {result.message}
            </motion.p>
          </>
        )}
      </div>
    </motion.div>
  );
};

// the API's roll if it answers in time, the page's own if it doesn't
const rollPerception = async (requestRoll) => {
  const fallback = new Promise((resolve) => setTimeout(() => resolve(null), D20_PATIENCE_MS));
  const fromApi = requestRoll().unwrap().catch(() => null);
  return (await Promise.race([fromApi, fallback])) ?? localRoll();
};

// a d20 at the very end of the page, under the logout. throw it and the camp rolls a perception check
export const D20 = ({ className }) => {
  const [isFound, find, caption] = useSecret("d20");
  const [requestRoll] = useLazyGetRollQuery();
  const [isShown, setIsShown] = useState(false);
  const [result, setResult] = useState(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (run, ms) => timers.current.push(setTimeout(run, ms));

  const roll = async () => {
    if (isShown) return;
    const startedAt = Date.now();
    setResult(null);
    setIsShown(true);
    find({ countAfterMs: D20_TUMBLE_MS + D20_VERDICT_MS + 400 });
    const rolled = await rollPerception(() => requestRoll(undefined, false));
    later(() => {
      setResult(rolled);
      later(() => setIsShown(false), D20_VERDICT_MS);
    }, Math.max(0, D20_TUMBLE_MS - (Date.now() - startedAt)));
  };

  return (
    <>
      <SecretButton id="d20" isFound={isFound} label="A twenty sided die" caption={caption} className={className} onClick={roll}>
        <motion.span
          className="block"
          initial={false}
          animate={{ rotate: isFound ? 360 : 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
          style={isFound ? { color: D20_GOLD } : undefined}
        >
          <D20Shape className="size-4" fill={isFound ? `${D20_GOLD}33` : "none"} />
        </motion.span>
      </SecretButton>
      <Flourish isShown={isShown}>
        <AbilityCheck result={result} />
      </Flourish>
    </>
  );
};
