import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSecret } from "../../lib/secrets";
import { easedGlow, softBeams, softRing } from "../../actions";
import { MAGIC_BLUE, MAGIC_PINK, castMagic } from "../../lib/magic";
import { playSound } from "../../lib/sound";
import { easeOutExpo } from "../../lib/motion";
import { scrollToSection } from "../../lib/smoothScroll";
import { PERCEPTION_DC, localRoll, verdictFor } from "../../lib/dice";
import { useLazyGetRollQuery } from "../../api/rollApi";
import darkMagicianGirl from "../../assets/images/dark-magician-girl.png";

const GOLD = "#e8c35a";
const UMBRELLA_RED = "#d62828";
const POKEBALL_RED = "#e3350d";

// how long each full screen effect stays up, the secret count pops in once it clears
const ITEM_GET_MS = 4000;
const SAVE_ROOM_MS = 4600;
const TRANSMUTATION_MS = 3600;
const GUSTS_MS = 3800;
const WATER_SLASH_MS = 2800;
const GOTCHA_MS = 3400;
const GRACE_BANNER_MS = 3800;
const WEB_MS = 4500;
const BAT_TRANSITION_MS = 4400;

// the button each secret hides behind. the effect it sets off does all the talking
const SecretButton = ({ label, onClick, className = "", children }) => (
  <span className={`relative inline-block ${className}`}>
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 touch-manipulation place-items-center rounded-md text-faint/40 transition-colors hover:text-faint"
    >
      {children}
    </button>
  </span>
);

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

// the dark the effects play over: tinted with the egg's color in the middle, deep enough that the page never reads through
const veil = (color, strength = 0.82) => `${easedGlow(color, { strength: 0.2, shape: "ellipse", reach: 80 })}, rgba(5,5,12,${strength})`;

// a ring of light rolling out from the middle of the screen, the beat where an effect lands
const Shockwave = ({ color, delay = 0, size = "min(80vw,30rem)" }) => (
  <motion.span
    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
    style={{ width: size, height: size, background: softRing(color), mixBlendMode: "screen" }}
    initial={{ scale: 0.15, opacity: 0 }}
    animate={{ scale: 2.2, opacity: [0, 0.9, 0] }}
    transition={{ duration: 1.1, delay, ease: easeOutExpo }}
  />
);

// motes thrown out evenly around the middle of the screen, cycling through the effect's colors
const Sparks = ({ colors, count = 14, reach = 40, delay = 0, round = false }) =>
  Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const far = index % 2 === 0 ? reach : reach * 0.72;
    const color = colors[index % colors.length];
    return (
      <motion.span
        key={angle}
        className="absolute top-1/2 left-1/2 -mt-2 -ml-2 size-4"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
        animate={{ x: `${Math.cos(angle) * far}vmin`, y: `${Math.sin(angle) * far}vmin`, opacity: [0, 1, 0], scale: [0.4, 1.3, 0.6] }}
        transition={{ duration: 1.3, delay, ease: easeOutExpo }}
      >
        {round ? (
          <span className="block size-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        ) : (
          <svg viewBox="0 0 8 8" className="size-full" style={{ filter: `drop-shadow(0 0 5px ${color})` }}>
            <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={color} />
          </svg>
        )}
      </motion.span>
    );
  });

// the line that says what just happened, big enough to read at a glance on a phone
const Payoff = ({ title, subtitle, color = "#fff", delay = 0, className = "font-mono", children }) => (
  <motion.div
    className={`relative flex flex-col items-center gap-2 text-center ${className}`}
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: easeOutExpo }}
  >
    {children ?? (
      <p className="text-[clamp(1.6rem,6.5vw,3.25rem)] leading-tight font-medium tracking-tight" style={{ color, textShadow: `0 0 26px ${color}88` }}>
        {title}
      </p>
    )}
    {subtitle && <p className="max-w-md text-[11px] tracking-[0.25em] text-white/75 uppercase text-balance">{subtitle}</p>}
  </motion.div>
);

// two sets of beams at uneven angles. the broad ones carry the glow, the thin ones give it the shafts of light
const BROAD_BEAMS = [
  { at: 8, width: 9, strength: 0.32 },
  { at: 61, width: 12, strength: 0.22 },
  { at: 104, width: 7, strength: 0.3 },
  { at: 158, width: 13, strength: 0.2 },
  { at: 207, width: 8, strength: 0.34 },
  { at: 251, width: 11, strength: 0.24 },
  { at: 302, width: 9, strength: 0.28 },
  { at: 339, width: 6, strength: 0.18 },
];
const THIN_BEAMS = [
  { at: 27, width: 3.6, strength: 0.3 },
  { at: 83, width: 3, strength: 0.22 },
  { at: 131, width: 4.2, strength: 0.28 },
  { at: 186, width: 2.8, strength: 0.2 },
  { at: 229, width: 4, strength: 0.3 },
  { at: 278, width: 3.2, strength: 0.24 },
  { at: 321, width: 3.6, strength: 0.26 },
];

// the beams are brightest at the source and thin out toward the edge, the way real light falls off
const BEAM_FALLOFF = easedGlow("black", { reach: 78 });

const BeamLayer = ({ beams, color, turn, duration, delay }) => (
  <motion.div
    className="absolute inset-0 rounded-full"
    style={{ background: softBeams(beams, color), maskImage: BEAM_FALLOFF, mixBlendMode: "screen" }}
    initial={{ rotate: 0, opacity: 0 }}
    animate={{ rotate: turn, opacity: 1 }}
    transition={{ rotate: { duration, ease: "linear" }, opacity: { duration: 1.2, delay, ease: "easeOut" } }}
  />
);

// god rays behind a "you got it" moment: broad glow and thin shafts turning against each other, a bloom at the core
// and a slow breath, so the light feels alive instead of spinning like a pinwheel
const LightRays = ({ color, delay = 0 }) => (
  <motion.div
    className="absolute top-1/2 left-1/2 size-[min(160vmax,72rem)] -translate-x-1/2 -translate-y-1/2"
    initial={{ scale: 0.7, opacity: 0 }}
    animate={{ scale: [0.7, 1.04, 1], opacity: 1 }}
    transition={{ duration: 1.6, delay, ease: easeOutExpo }}
  >
    <BeamLayer beams={BROAD_BEAMS} color={color} turn={24} duration={6} delay={delay} />
    {/* the shafts are the item's own color washed toward white, so they glow instead of cutting like lasers */}
    <BeamLayer beams={THIN_BEAMS} color={`color-mix(in oklab, ${color} 45%, #fffbe8)`} turn={-40} duration={6} delay={delay + 0.15} />
    <motion.div
      className="absolute inset-[30%] rounded-full"
      style={{ background: `${easedGlow("#fffbe8", { strength: 0.75, reach: 45 })}, ${easedGlow(color, { strength: 0.45 })}`, mixBlendMode: "screen" }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: [0, 1, 0.75], scale: [0.6, 1.1, 1] }}
      transition={{ duration: 1.4, delay: delay + 0.1, ease: easeOutExpo }}
    />
  </motion.div>
);

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
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 overflow-hidden px-4"
    style={{ background: veil(GOLD) }}
    aria-hidden="true"
  >
    <div className="relative grid size-[min(60vw,16rem)] place-items-center">
      {/* the light lives with the relic, so it pours out of the triforce and not the middle of the screen */}
      <LightRays color={GOLD} delay={0.7} />
      <Shockwave color={GOLD} delay={0.85} />
      <Sparks colors={[GOLD, "#fff6c8"]} count={16} reach={42} delay={0.9} />
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
      <span className="mt-2 block text-sm text-white/70">
        <TypedText text="Courage, wisdom and a clean merge." startAt={2.3} perLetter={0.03} />
      </span>
    </motion.p>
  </motion.div>
);

export const Triforce = ({ className }) => {
  const [isFound, find] = useSecret("triforce");
  const [isHeldUp, holdUp] = useFlourish(ITEM_GET_MS);

  const open = () => {
    find();
    holdUp();
  };

  return (
    <>
      <SecretButton label="A small golden relic"
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
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 overflow-hidden px-4"
    // solid black under the red glow, the save room cuts the game away entirely so the typewriter line reads clean
    style={{ background: `${easedGlow(UMBRELLA_RED, { strength: 0.24, shape: "ellipse", reach: 75 })}, #000` }}
    aria-hidden="true"
  >
    <Shockwave color={UMBRELLA_RED} delay={0.7} size="min(70vw,24rem)" />
    <svg viewBox="0 0 16 16" className="relative size-[min(50vw,13rem)] overflow-visible" style={{ filter: `drop-shadow(0 0 24px ${UMBRELLA_RED}88)` }}>
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
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0.6, 1] }}
      transition={{ duration: 0.8, delay: 2.6 }}
      className="font-mono text-xs tracking-[0.3em] text-[#e9e2d0]/60 uppercase"
    >
      ink ribbon used · 1 left
    </motion.p>
  </motion.div>
);

export const Umbrella = ({ className }) => {
  const [isFound, find] = useSecret("umbrella");
  const [isSaving, save] = useFlourish(SAVE_ROOM_MS);

  const saveGame = () => {
    find();
    save();
  };

  return (
    <>
      <SecretButton label="A corporate logo"
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
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden px-4"
    // darker than the rest, the philosophy behind it is set huge and would read through the title
    style={{ background: veil(ALCHEMY_BLUE, 0.92) }}
    aria-hidden="true"
  >
    <Shockwave color={ALCHEMY_BLUE} delay={1.1} />
    <Sparks colors={[ALCHEMY_BLUE, "#e6f6ff"]} count={12} reach={38} delay={1.15} />
    {/* the glow is a still gradient behind the circle. a glow filter on the turning circle would repaint every
        frame, and phones can't keep up with that */}
    <div
      className="absolute top-1/2 left-1/2 size-[min(95vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ background: easedGlow(ALCHEMY_BLUE, { strength: 0.22 }) }}
    />
    <motion.svg
      viewBox="0 0 100 100"
      className="relative size-[min(80vw,26rem,52vh)]"
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
    <Payoff title="Equivalent Exchange" subtitle="hard problems in, readable code out" color={ALCHEMY_BLUE} delay={1.4} className="font-serif" />
  </motion.div>
);

// a tiny transmutation circle tucked into the philosophy line. equivalent exchange, like the line says: hard problems in, readable code out
export const Alchemy = ({ className }) => {
  const [isFound, find] = useSecret("alchemy");
  const [isFlashing, flash] = useFlourish(TRANSMUTATION_MS);

  const transmute = () => {
    find();
    flash();
  };

  const ink = isFound ? ALCHEMY_BLUE : "currentColor";

  return (
    <>
      <SecretButton label="A chalk circle" className={className} onClick={transmute}>
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

const NATIONS = [
  { name: "Water", color: "#4aa8ff" },
  { name: "Earth", color: "#5fbf5a" },
  { name: "Fire", color: "#ff5a3c" },
  { name: "Air", color: AIR_ORANGE },
];

// the four nations sweep across the screen as wind, then the air nomad spiral spins up in the middle and names them
const ElementGusts = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden px-4"
    style={{ background: veil(AIR_ORANGE) }}
    aria-hidden="true"
  >
    {GUSTS.map((gust) => (
      <Gust key={gust.top} {...gust} />
    ))}
    <Shockwave color={AIR_ORANGE} delay={1.5} />
    <motion.svg
      viewBox="0 0 16 16"
      className="relative size-[min(42vw,11rem)]"
      initial={{ scale: 0, rotate: -360, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ duration: 1.4, delay: 0.9, ease: easeOutExpo }}
      style={{ filter: `drop-shadow(0 0 14px ${AIR_ORANGE})` }}
    >
      {[0, 120, 240].map((turn) => (
        <path
          key={turn}
          d="M8 8 C8 5 11 3.5 13 5 C14.5 6.2 13.5 8.5 11.5 8"
          fill="none"
          stroke={AIR_ORANGE}
          strokeWidth="0.9"
          strokeLinecap="round"
          transform={`rotate(${turn} 8 8)`}
        />
      ))}
    </motion.svg>
    <Payoff subtitle="every element, every stack" delay={1.6} className="font-serif">
      <p className="flex flex-wrap justify-center gap-x-3 text-[clamp(1.4rem,6vw,3rem)] leading-tight tracking-wide">
        {NATIONS.map(({ name, color }, index) => (
          <motion.span
            key={name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.7 + index * 0.2, ease: easeOutExpo }}
            style={{ color, textShadow: `0 0 20px ${color}88` }}
          >
            {name}
            {index < NATIONS.length - 1 && <span className="text-white/40">.</span>}
          </motion.span>
        ))}
      </p>
    </Payoff>
  </motion.div>
);

// the air nomad swirl under profile.json, from the editor to the org chart. every element, every stack
export const Airbender = ({ className }) => {
  const [isFound, find] = useSecret("airbender");
  const [isBlowing, blow] = useFlourish(GUSTS_MS);

  const bend = () => {
    find();
    blow();
  };

  return (
    <>
      <SecretButton label="A spiral of wind" className={className} onClick={bend}>
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

const SLASH_LAYERS = [
  { color: WATER_BLUE, width: 3.2, opacity: 0.7 },
  { color: "#bfe6ff", width: 1.4, opacity: 0.9 },
  { color: "#ffffff", width: 0.4, opacity: 1 },
];

// one blade stroke drawn as three layered curves, deep water outside and a white edge where it cut
const Slash = ({ path, delay }) =>
  SLASH_LAYERS.map(({ color, width, opacity }) => (
    <motion.path
      key={color}
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    />
  ));

// spray thrown off the blade, flung along the slash and falling away
const DROPLETS = Array.from({ length: 12 }, (_, index) => ({ left: 8 + index * 7.5, rise: 6 + (index % 4) * 5, delay: 0.15 + index * 0.025 }));

// two curved slashes of water cross the screen, spray flies off the blade and the form is named like the anime does
const WaterSlash = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-end overflow-hidden px-4 pb-[18vh]"
    style={{ background: veil(WATER_BLUE) }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible">
      <Slash path="M-5 48 C20 20 55 10 105 18" delay={0} />
      <Slash path="M-5 14 C30 24 60 40 105 36" delay={0.45} />
    </svg>
    {DROPLETS.map(({ left, rise, delay }) => (
      <motion.span
        key={left}
        className="absolute top-[42%] size-2 rounded-full bg-[#bfe6ff]"
        style={{ left: `${left}%`, boxShadow: `0 0 8px ${WATER_BLUE}` }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: [`0vh`, `-${rise}vh`, `${rise * 2}vh`], opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
      />
    ))}
    <Payoff subtitle="first form · water surface slash" delay={0.8} className="font-serif">
      <p className="text-[clamp(1.75rem,8vw,4rem)] leading-none tracking-[0.2em]" style={{ color: "#e8f6ff", textShadow: `0 0 26px ${WATER_BLUE}` }}>
        水の呼吸
      </p>
      <p className="text-[clamp(0.9rem,3.5vw,1.4rem)] tracking-[0.3em] uppercase" style={{ color: WATER_BLUE }}>
        Water Breathing
      </p>
    </Payoff>
  </motion.div>
);

// Tanjiro's sun earring, a little hanafuda card. flip it and he answers with Water Breathing
export const Hanafuda = ({ className }) => {
  const [isFound, find] = useSecret("hanafuda");
  const [isSlashing, slash] = useFlourish(WATER_SLASH_MS);

  const breathe = () => {
    find();
    slash();
  };

  return (
    <>
      <SecretButton label="A small card earring"
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

// specks of gold rising up the whole screen, the way the air above a grace shimmers
const GRACE_EMBERS = Array.from({ length: 18 }, (_, index) => ({ left: 4 + ((index * 37) % 92), delay: (index % 6) * 0.25, size: 3 + (index % 3) * 2 }));

// the gold banner Elden Ring rolls across the screen the first time you touch a grace, over the golden light it gives off
const GraceDiscovered = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.2 }}
    className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden"
    style={{ background: veil(GRACE_GOLD, 0.78) }}
    aria-hidden="true"
  >
    {GRACE_EMBERS.map(({ left, delay, size }) => (
      <motion.span
        key={left}
        className="absolute bottom-0 rounded-full"
        style={{ left: `${left}%`, width: size, height: size, background: GRACE_GOLD, boxShadow: `0 0 10px ${GRACE_GOLD}` }}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: "-85vh", opacity: [0, 1, 0] }}
        transition={{ duration: 3, delay, ease: "easeOut" }}
      />
    ))}
    {/* the sigil itself, drawn huge and faint behind the banner */}
    <svg viewBox="0 0 16 16" className="absolute size-[min(80vw,30rem,70vh)] overflow-visible" style={{ opacity: 0.35 }}>
      {["M8 1 V15", "M10.6 5 A2.6 2.6 0 1 1 10.59 4.99", "M3.2 6.5 A4.8 4.8 0 0 0 12.8 6.5", "M5 11.5 A3 3 0 0 1 11 11.5"].map((path, index) => (
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke={GRACE_GOLD}
          strokeWidth="0.25"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.2 + index * 0.2, ease: "easeInOut" }}
        />
      ))}
    </svg>
    <Shockwave color={GRACE_GOLD} delay={0.4} />
    <div className="relative w-full bg-gradient-to-r from-transparent via-black/85 to-transparent px-4 py-8 text-center">
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
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="mt-4 font-serif text-xs tracking-[0.3em] text-[#e9dcb0]/70 uppercase"
      >
        Contact · Inbox of the Tarnished
      </motion.p>
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
  const [isLit, find] = useSecret("grace");
  const [isBannerShown, setIsBannerShown] = useState(false);
  const bannerTimer = useRef(null);

  useEffect(() => () => clearTimeout(bannerTimer.current), []);

  const touch = () => {
    find();
    setIsBannerShown(true);
    clearTimeout(bannerTimer.current);
    bannerTimer.current = setTimeout(() => setIsBannerShown(false), GRACE_BANNER_MS);
  };

  const ink = isLit ? GRACE_GOLD : "currentColor";

  return (
    <>
      <SecretButton label="A faded golden sigil" className={className} onClick={touch}>
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

const FLIGHT_S = 4.6;
// flies in, hovers in the middle of the screen while she casts, then shoots off the top right
const FLIGHT_TIMES = [0, 0.22, 0.78, 1];
const CAST_AT_MS = 1300;
const CAST_AT_S = CAST_AT_MS / 1000;

// stars thrown out from her wand when the spell goes off, spread evenly around a circle
const SPELL_STARS = Array.from({ length: 16 }, (_, index) => ({
  angle: (index / 16) * Math.PI * 2,
  reach: index % 2 === 0 ? 46 : 34,
  color: index % 3 === 0 ? GOLD : index % 2 === 0 ? MAGIC_PINK : MAGIC_BLUE,
}));

const Star4 = ({ color, className = "", style }) => (
  <svg viewBox="0 0 8 8" className={className} style={style} aria-hidden="true">
    <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={color} />
  </svg>
);

// the magic circle she casts: two rings and a hexagram drawing themselves, then a shockwave rolling out
const SpellCircle = () => (
  <div className="absolute top-1/2 left-1/2 size-[min(90vw,34rem)] -translate-x-1/2 -translate-y-1/2">
    <motion.svg
      viewBox="0 0 100 100"
      className="size-full"
      initial={{ rotate: -40, opacity: 0 }}
      animate={{ rotate: 20, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.6, delay: CAST_AT_S - 0.3, times: [0, 0.15, 0.7, 1], ease: "easeOut" }}
      style={{ filter: `drop-shadow(0 0 6px ${MAGIC_PINK})` }}
    >
      {["M50 3 A47 47 0 1 1 49.9 3", "M50 11 A39 39 0 1 1 49.9 11", "M50 11 L83.8 69.5 L16.2 69.5 Z", "M50 89 L16.2 30.5 L83.8 30.5 Z"].map((path, index) => (
        <motion.path
          key={path}
          d={path}
          fill="none"
          stroke={index % 2 === 0 ? MAGIC_PINK : MAGIC_BLUE}
          strokeWidth="0.7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, delay: CAST_AT_S - 0.3 + index * 0.1, ease: "easeInOut" }}
        />
      ))}
    </motion.svg>
    <motion.span
      className="absolute inset-0 rounded-full"
      style={{ background: `${softRing(MAGIC_PINK)}, ${softRing(MAGIC_BLUE, { strength: 0.5, at: 62 })}`, mixBlendMode: "screen" }}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: 2.4, opacity: [0, 0.9, 0] }}
      transition={{ duration: 1.1, delay: CAST_AT_S, ease: easeOutExpo }}
    />
    {SPELL_STARS.map(({ angle, reach, color }) => (
      <motion.span
        key={angle}
        className="absolute top-1/2 left-1/2 -mt-2 -ml-2"
        initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
        animate={{ x: `${Math.cos(angle) * reach}vmin`, y: `${Math.sin(angle) * reach}vmin`, opacity: [0, 1, 0], scale: [0.4, 1.4, 0.6] }}
        transition={{ duration: 1.4, delay: CAST_AT_S, ease: easeOutExpo }}
      >
        <Star4 color={color} className="size-4" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </motion.span>
    ))}
  </div>
);

// what the spell did, stamped big enough to read while she's still on screen
const BuffBanner = () => (
  <motion.div
    className="absolute inset-x-4 bottom-[12vh] flex flex-col items-center gap-2 text-center font-mono"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -8] }}
    transition={{ duration: 3, delay: CAST_AT_S + 0.2, times: [0, 0.12, 0.8, 1], ease: easeOutExpo }}
  >
    <p
      className="text-[clamp(2.5rem,9vw,5rem)] leading-none font-medium tracking-tight"
      style={{
        backgroundImage: `linear-gradient(to right, ${MAGIC_PINK}, ${MAGIC_BLUE})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: `drop-shadow(0 0 18px ${MAGIC_PINK}aa)`,
      }}
    >
      +500 ATK
    </p>
    <p className="text-xs tracking-[0.25em] text-white/80 uppercase">every skill is a duel monster now</p>
  </motion.div>
);

const MagicianFlyby = () => {
  const prefersReducedMotion = useReducedMotion();
  // she flies relative to the middle of the screen, so wherever the screen ends she hovers fully inside it
  const flight = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: [0, 1, 1, 0] } }
    : {
        initial: { x: "-75vw", y: "35vh", rotate: -16, opacity: 0 },
        animate: {
          x: ["-75vw", "0vw", "0vw", "80vw"],
          y: ["35vh", "0vh", "-2vh", "-85vh"],
          rotate: [-16, 0, 0, 14],
          opacity: [0, 1, 1, 1],
        },
      };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{ background: `${easedGlow(MAGIC_BLUE, { strength: 0.18, shape: "ellipse", reach: 85 })}, rgba(10,6,20,0.6)` }}
      aria-hidden="true"
    >
      {!prefersReducedMotion && <SpellCircle />}
      <motion.div
        {...flight}
        transition={{ duration: FLIGHT_S, times: FLIGHT_TIMES, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2"
      >
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, -12, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="-translate-x-1/2 -translate-y-1/2"
        >
          <img
            src={darkMagicianGirl}
            alt=""
            className="h-[min(42vh,18rem)] w-auto max-w-none [image-rendering:pixelated]"
            style={{ filter: `drop-shadow(0 0 22px ${MAGIC_PINK}aa)` }}
          />
        </motion.div>
      </motion.div>
      <BuffBanner />
      <p className="absolute right-4 bottom-12 font-mono text-[11px] text-white/60">pixel art by TeykioArts</p>
    </motion.div>
  );
};

// a little wizard hat on top of the skills. tap it and a magician flies in and turns every skill into a duel monster for good
export const Magician = ({ className }) => {
  const [isFound, find] = useSecret("magician");
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
    if (isFlying) return;
    find();
    setIsFlying(true);
    clearTimeout(flightTimer.current);
    clearTimeout(castTimer.current);
    // the page glides up to the cards as the spell lands, so the flip plays right where you're looking
    castTimer.current = setTimeout(() => {
      castMagic();
      scrollToSection("skill-cards");
    }, CAST_AT_MS);
    flightTimer.current = setTimeout(() => setIsFlying(false), FLIGHT_S * 1000 + 100);
  };

  return (
    <>
      <SecretButton label="A pointy wizard hat" className={className} onClick={summon}>
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true">
          <path d="M9 1 L4 13 H13 Z" fill={isFound ? MAGIC_BLUE : "currentColor"} />
          <path d="M2 13 H14 V14.5 H2 Z" fill={isFound ? MAGIC_PINK : "currentColor"} />
          {isFound && <path d="M6.5 8 H11" stroke={MAGIC_PINK} strokeWidth="1.2" />}
        </svg>
      </SecretButton>
      <Flourish isShown={isFlying}>
        <MagicianFlyby />
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
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-12 overflow-hidden px-4"
    style={{ background: veil(POKEBALL_RED) }}
    aria-hidden="true"
  >
    <div className="relative">
      {/* the light lives with the ball, so the catch glows from the ball itself */}
      <LightRays color="#ffd84a" delay={0.9} />
      <Shockwave color="#fff" delay={0.95} size="min(50vw,16rem)" />
      <Sparks colors={["#ffd84a", "#fff", POKEBALL_RED]} count={12} reach={30} delay={1} />
      {/* it drops in, rocks three times like the real catch, then clicks still */}
      <motion.svg
        viewBox="0 0 16 16"
        className="relative size-[min(40vw,9rem)]"
        initial={{ scale: 0.4, y: -120, rotate: 0 }}
        animate={{ scale: [0.4, 1.1, 1], y: [-120, 0, 0], rotate: [0, 0, -18, 14, -10, 6, 0] }}
        transition={{ duration: 1, times: [0, 0.25, 1], rotate: { duration: 0.9, delay: 0.1, times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1] }, ease: easeOutExpo }}
        style={{ originY: 0.9 }}
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
          transition={{ duration: 0.9, delay: 1 + index * 0.05, ease: "easeOut" }}
        >
          <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#ffd84a" />
        </motion.svg>
      ))}
    </div>
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 1.1 }}
      className="relative w-full max-w-md rounded-xl border-4 border-[#3b5ba7] bg-[#f8f8f0] px-5 py-4 font-mono text-base text-[#202020] shadow-[inset_0_0_0_3px_#c8d8f0]"
    >
      <TypedText text="Gotcha! Cristopher was caught!" startAt={1.25} />
    </motion.p>
  </motion.div>
);

// grey until caught. it wobbles three times, then clicks shut like it should
export const Pokeball = ({ className }) => {
  const [isFound, find] = useSecret("pokeball");
  const wobbleControls = useAnimationControls();
  const [isCelebrating, celebrate] = useFlourish(GOTCHA_MS);

  const isWobbling = useRef(false);

  // the sound starts on the click so it never feels laggy
  const throwBall = async () => {
    if (isWobbling.current) return;
    isWobbling.current = true;
    playSound("pokeball");
    await wobbleControls.start({
      rotate: [0, -22, 18, 0, -22, 18, 0, -22, 18, 0],
      transition: { duration: 0.9, times: [0, 0.06, 0.18, 0.3, 0.4, 0.52, 0.64, 0.74, 0.86, 1] },
    });
    find({ withSound: false });
    celebrate();
    isWobbling.current = false;
  };

  return (
    <>
      <SecretButton label="A red and white ball" className={className} onClick={throwBall}>
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
    className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 overflow-hidden px-4"
    style={{ background: `${easedGlow(SPIDER_RED, { strength: 0.16, shape: "ellipse", at: "50% 40%", reach: 75 })}, rgba(8,10,26,0.95)` }}
    aria-hidden="true"
  >
    <Shockwave color={SPIDER_RED} delay={0.6} />
    <div className="relative size-[min(70vw,20rem,48vh)]">
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
          style={{ background: easedGlow(SPIDER_RED, { strength: 0.33 }) }}
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
  const [isFound, find] = useSecret("spider");
  const [isSwinging, swing] = useFlourish(WEB_MS);

  const thwip = () => {
    find();
    swing();
  };

  return (
    <>
      <SecretButton label="A tiny spider" className={className} onClick={thwip}>
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
    className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden"
    style={{ background: `${easedGlow("#1d2a5c", { shape: "ellipse", reach: 95 })}, #05060d` }}
    aria-hidden="true"
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1 }}
      className="absolute h-[min(60vw,22rem)] w-[min(100vw,40rem)] rounded-full"
      style={{ background: easedGlow(BAT_YELLOW, { strength: 0.27 }) }}
    />
    {/* two searchlights sweeping the night sky behind the logo */}
    {[-1, 1].map((side) => (
      <motion.span
        key={side}
        className="absolute bottom-0 left-1/2 h-[140vh] w-[30vmax] origin-bottom -translate-x-1/2"
        style={{ background: `linear-gradient(to top, ${BAT_YELLOW}40, transparent 80%)`, clipPath: "polygon(45% 100%, 55% 100%, 100% 0, 0 0)" }}
        initial={{ rotate: side * 40, opacity: 0 }}
        animate={{ rotate: [side * 40, side * -10, side * 20], opacity: [0, 1, 1] }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
    ))}
    <motion.div
      initial={{ scale: 0.02, rotate: 0 }}
      animate={{ scale: 1, rotate: 1080 }}
      transition={{ duration: 1.8, ease: [0.3, 0, 0.2, 1] }}
    >
      <BatEmblem className="w-[min(80vw,30rem)]" />
    </motion.div>
    <Shockwave color={BAT_YELLOW} delay={1.75} />
    {BAT_BURSTS.map((burst) => (
      <Burst key={burst.word} {...burst} />
    ))}
    <div className="absolute inset-x-4 bottom-[9vh]">
      <Payoff subtitle="same bat time, same bat channel" delay={3} className="font-sans">
        <p className="text-[clamp(1.4rem,6vw,2.75rem)] font-black tracking-tight italic" style={{ color: BAT_YELLOW, WebkitTextStroke: "1px #111" }}>
          TO THE BAT INBOX!
        </p>
      </Payoff>
    </div>
  </motion.div>
);

// a bat next to the email, the closest thing to a Bat-Signal. on call at 3 a.m.
export const Bat = ({ className }) => {
  const [isFound, find] = useSecret("bat");
  const [isSpinning, spin] = useFlourish(BAT_TRANSITION_MS);

  const signal = () => {
    find();
    spin();
  };

  return (
    <>
      <SecretButton label="A small bat" className={className} onClick={signal}>
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
      style={{ background: `${easedGlow("rgb(40 31 18)", { strength: 0.9, shape: "ellipse", reach: 90 })}, rgba(5,4,3,0.97)` }}
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

      <div className="relative grid size-[min(52vw,15rem,32vh)] place-items-center">
        {/* a ring of runes turning behind the die, like the check circle in camp */}
        <motion.svg
          viewBox="0 0 100 100"
          className="absolute -inset-[30%] size-[160%] opacity-50"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke={D20_GOLD} strokeWidth="0.4" />
          <circle cx="50" cy="50" r="43" fill="none" stroke={D20_GOLD} strokeWidth="0.25" strokeDasharray="1 2.5" />
          {Array.from({ length: 12 }, (_, index) => (
            <path key={index} d="M50 2.5 L51.2 6 L50 9.5 L48.8 6 Z" fill={D20_GOLD} transform={`rotate(${index * 30} 50 50)`} />
          ))}
        </motion.svg>
        {result && <Shockwave key="landed" color={color} size="100%" />}
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
  const [isFound, find] = useSecret("d20");
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
    find();
    const rolled = await rollPerception(() => requestRoll(undefined, false));
    later(() => {
      setResult(rolled);
      later(() => setIsShown(false), D20_VERDICT_MS);
    }, Math.max(0, D20_TUMBLE_MS - (Date.now() - startedAt)));
  };

  return (
    <>
      <SecretButton label="A twenty sided die" className={className} onClick={roll}>
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
