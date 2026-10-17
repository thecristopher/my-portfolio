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
const WEB_MS = 5200;
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
// detective mode paints the world in this blue, and whatever the scan locks on to in orange
const DETECTIVE_BLUE = "#4fb6ff";
const ARKHAM_ORANGE = "#ff9a3c";

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

// our friendly neighbor's mask, traced from the classic comic mask: an egg shaped head narrowing to the chin, a web
// fanning out from the bridge of the nose, and the big angular lenses in thick black frames sweeping up to the temples
const MASK_HEAD = "M50.0 5.0 C73.2 5.0 88.8 23.9 89.6 55.9 C90.0 79.7 77.3 101.9 63.3 110.1 C57.6 113.4 53.4 113.9 50.0 113.9 C46.6 113.9 42.4 113.4 36.7 110.1 C22.7 101.9 10.0 79.7 10.4 55.9 C11.2 23.9 26.8 5.0 50.0 5.0 Z";
const MASK_EYE_FRAME = "M53.0 77.7 L84.5 42.8 C87.5 47.7 89.2 59.2 86.1 68.2 C83.0 76.4 74.8 81.2 66.6 81.2 C61.7 81.2 57.6 79.9 53.0 77.7 Z";
const MASK_EYE_LENS = "M60.8 78.2 L83.3 54.1 C85.0 59.6 84.5 66.6 80.9 71.5 C77.3 76.0 70.7 78.2 60.8 78.2 Z";
const MASK_CENTER = [50, 77.7];
const MASK_SPOKES = Array.from({ length: 12 }, (_, index) => ((index + 0.5) * Math.PI) / 6);
// the web stretches a little taller than wide, the way it wraps around a head
const maskPoint = (angle, radius) => [MASK_CENTER[0] + radius * Math.cos(angle), MASK_CENTER[1] + radius * Math.sin(angle) * 1.12];
const MASK_RINGS = [4.5, 11, 19, 28, 38, 49, 61, 74].map((radius) =>
  [...MASK_SPOKES, MASK_SPOKES[0] + 2 * Math.PI]
    .map((angle, index) => {
      const [x, y] = maskPoint(angle, radius).map((value) => value.toFixed(1));
      if (index === 0) return `M${x} ${y}`;
      const [sagX, sagY] = maskPoint(angle - Math.PI / 12, radius * 0.84).map((value) => value.toFixed(1));
      return `Q${sagX} ${sagY} ${x} ${y}`;
    })
    .join(" ")
);

// Peter's classic red, and the black suit the symbiote grows over it in Spider-Man 2
const SUITS = {
  classic: { light: "#f0202a", dark: "#b3101a", webbing: "#111111" },
  symbiote: { light: "#2b2f3a", dark: "#050608", webbing: "#5a6070" },
};

const SpiderFace = ({ className, style, suit = "classic" }) => (
  <svg viewBox="0 0 100 120" className={className} style={style}>
    <defs>
      <clipPath id={`spider-mask-head-${suit}`}>
        <path d={MASK_HEAD} />
      </clipPath>
      <radialGradient id={`spider-mask-shade-${suit}`} cx="40%" cy="35%" r="75%">
        <stop offset="0%" stopColor={SUITS[suit].light} />
        <stop offset="100%" stopColor={SUITS[suit].dark} />
      </radialGradient>
    </defs>
    <path d={MASK_HEAD} fill={`url(#spider-mask-shade-${suit})`} />
    <g clipPath={`url(#spider-mask-head-${suit})`} fill="none" stroke={SUITS[suit].webbing} strokeWidth="0.7">
      {MASK_SPOKES.map((angle) => {
        const [x, y] = maskPoint(angle, 120).map((value) => value.toFixed(1));
        return <path key={angle} d={`M${MASK_CENTER[0]} ${MASK_CENTER[1]} L${x} ${y}`} />;
      })}
      {MASK_RINGS.map((ring) => (
        <path key={ring} d={ring} />
      ))}
    </g>
    <path d={MASK_HEAD} fill="none" stroke="#111111" strokeWidth="1.4" />
    {[undefined, "translate(100 0) scale(-1 1)"].map((mirror) => (
      <g key={mirror ?? "right"} transform={mirror}>
        <path d={MASK_EYE_FRAME} fill="#111111" />
        <path d={MASK_EYE_LENS} fill="#f4f1ea" />
      </g>
    ))}
  </svg>
);

// the symbiote's tendrils, reaching up the mask from the chin before the black suit swallows it
const TENDRILS = [
  "M50 118 C44 100 30 96 24 80",
  "M50 118 C56 98 72 94 78 76",
  "M50 118 C48 96 40 80 42 58",
  "M50 118 C54 94 62 78 60 56",
  "M50 118 C38 108 20 104 14 92",
  "M50 118 C64 108 82 104 88 90",
];

// Spider-Man 2: a "THWIP!", Peter drops in on his thread and the web spins itself, then the symbiote climbs up
// the mask and the black suit takes over. the caption box closes on the game's own tagline
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
    <Shockwave color="#f4f1ea" delay={2} />
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
        className="absolute top-1/2 left-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2"
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
          <svg viewBox="0 0 100 120" className="absolute inset-0 size-full overflow-visible">
            {TENDRILS.map((tendril, index) => (
              <motion.path
                key={tendril}
                d={tendril}
                fill="none"
                stroke="#050608"
                strokeWidth="5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.9, delay: 1.5 + index * 0.05, ease: "easeIn" }}
              />
            ))}
          </svg>
          {/* the black suit rises from the chin and swallows the red */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: "circle(0% at 50% 100%)" }}
            animate={{ clipPath: "circle(140% at 50% 100%)" }}
            transition={{ duration: 0.9, delay: 1.9, ease: [0.7, 0, 0.3, 1] }}
          >
            <SpiderFace className="w-full" suit="symbiote" />
          </motion.div>
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
      transition={{ duration: 0.3, delay: 2.7 }}
      className="w-full max-w-md -rotate-1 border-2 border-black bg-[#ffe14d] px-5 py-3 text-center font-sans text-sm font-bold tracking-wide text-black uppercase shadow-[4px_4px_0_#000]"
    >
      <TypedText text="Be greater. Together." startAt={2.9} perLetter={0.05} />
    </motion.p>
  </motion.div>
);

// a spider hanging off the degree, Peter Parker was a student first. Spider-Man 2 is about him learning to share the load
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

// the Arkham bat: wide wings that hook up into horns, short square ears and two scallops a side, sized for a 100 by 50 box
const BAT_PATH =
  "M50.0 46.3 C53.1 39.7 58.9 34.3 65.1 33.2 C69.7 32.7 73.8 33.9 75.9 35.6 C75.9 29.8 82.1 26.3 88.7 26.1 C92.9 26.0 97.0 26.6 100.0 27.3 C99.5 22.3 95.4 16.5 91.2 13.0 C85.4 8.2 79.6 4.9 74.5 3.7 C76.7 5.9 77.6 7.0 77.4 9.1 C77.2 14.0 72.2 16.9 69.3 17.6 C64.7 19.0 59.8 19.2 56.0 19.2 L54.2 9.2 L52.1 14.2 L47.9 14.2 L45.8 9.2 L44.0 19.2 C40.2 19.2 35.3 19.0 30.7 17.6 C27.8 16.9 22.8 14.0 22.6 9.1 C22.4 7.0 23.3 5.9 25.5 3.7 C20.4 4.9 14.6 8.2 8.8 13.0 C4.6 16.5 0.5 22.3 0 27.3 C3.0 26.6 7.1 26.0 11.3 26.1 C17.9 26.3 24.1 29.8 24.1 35.6 C26.2 33.9 30.3 32.7 34.9 33.2 C41.1 34.3 46.9 39.7 50.0 46.3 Z";

const BatEmblem = ({ className, fill = "url(#arkham-steel)", style }) => (
  <svg viewBox="0 0 100 50" className={className} style={style} aria-hidden="true">
    <defs>
      <linearGradient id="arkham-steel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3a4250" />
        <stop offset="55%" stopColor="#14171d" />
        <stop offset="100%" stopColor="#07080b" />
      </linearGradient>
    </defs>
    <path d={BAT_PATH} fill={fill} stroke={DETECTIVE_BLUE} strokeWidth="0.6" strokeLinejoin="miter" />
  </svg>
);

// rain over Gotham, each streak with its own lane and pace so it never falls in rows
const RAIN = Array.from({ length: 36 }, (_, index) => ({
  left: (index * 37) % 100,
  delay: (index * 0.13) % 0.9,
  duration: 0.55 + ((index * 7) % 5) * 0.08,
}));

// the four corners of the scanner's lock on box
const RETICLE_CORNERS = ["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"];

// the HUD readout that types out while the scan runs, the way the case files fill in
const SCAN_LOG = [
  { text: "DETECTIVE MODE", at: 0.45 },
  { text: "SCANNING EVIDENCE...", at: 1.05 },
  { text: "SUBJECT LOCATED: contact.sh", at: 1.9 },
];

// Arkham's detective mode: the night goes blue under the rain, a scan line sweeps the screen, the lock on box snaps
// around the emblem as it traces itself in, then the case closes
const DetectiveMode = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
    className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-hidden"
    style={{ background: `${easedGlow(DETECTIVE_BLUE, { strength: 0.18, shape: "ellipse", reach: 90 })}, #04070c` }}
    aria-hidden="true"
  >
    {RAIN.map((drop) => (
      <motion.span
        key={drop.left}
        className="absolute top-0 h-[14vh] w-px bg-gradient-to-b from-transparent to-white/30"
        style={{ left: `${drop.left}%`, rotate: 12 }}
        initial={{ y: "-20vh" }}
        animate={{ y: "120vh" }}
        transition={{ duration: drop.duration, delay: drop.delay, repeat: Infinity, ease: "linear" }}
      />
    ))}
    {/* the blue wash and scanlines detective mode lays over the whole world */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute inset-0"
      style={{
        background: `repeating-linear-gradient(to bottom, ${DETECTIVE_BLUE}14 0 1px, transparent 1px 4px)`,
        mixBlendMode: "screen",
      }}
    />
    <motion.span
      className="absolute inset-x-0 h-24"
      style={{ background: `linear-gradient(to bottom, transparent, ${DETECTIVE_BLUE}55, transparent)` }}
      initial={{ top: "-10%" }}
      animate={{ top: "110%" }}
      transition={{ duration: 1.4, delay: 0.4, ease: "easeInOut" }}
    />

    <div className="relative flex flex-col items-center gap-8 px-4">
      <div className="relative px-6 py-8 sm:px-10 sm:py-12">
        {/* the lock on box starts wide and snaps tight once the scan finds him */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.6, opacity: 0 }}
          animate={{ scale: 1, opacity: [0, 1, 1] }}
          transition={{ duration: 0.6, delay: 1.6, ease: easeOutExpo }}
        >
          {RETICLE_CORNERS.map((corner) => (
            <span key={corner} className={`absolute size-6 ${corner}`} style={{ borderColor: ARKHAM_ORANGE }} />
          ))}
        </motion.div>
        <svg viewBox="0 0 100 50" className="w-[min(78vw,28rem)] overflow-visible">
          <motion.path
            d={BAT_PATH}
            fill="none"
            stroke={DETECTIVE_BLUE}
            strokeWidth="0.7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.3, delay: 0.5, ease: "easeInOut" }}
            style={{ filter: `drop-shadow(0 0 4px ${DETECTIVE_BLUE})` }}
          />
        </svg>
        <motion.div
          className="absolute inset-0 grid place-items-center px-6 sm:px-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.8 }}
        >
          <BatEmblem className="w-[min(78vw,28rem)]" style={{ filter: `drop-shadow(0 0 18px ${DETECTIVE_BLUE}88)` }} />
        </motion.div>
      </div>

      <div className="flex min-h-16 flex-col items-center gap-1 font-mono text-[11px] tracking-[0.3em] uppercase">
        {SCAN_LOG.map((line, index) => (
          <p key={line.text} style={{ color: index === SCAN_LOG.length - 1 ? ARKHAM_ORANGE : DETECTIVE_BLUE }}>
            <TypedText text={line.text} startAt={line.at} perLetter={0.025} />
          </p>
        ))}
      </div>
    </div>
    <Shockwave color={DETECTIVE_BLUE} delay={1.8} />

    <div className="absolute inset-x-4 bottom-[8vh]">
      <Payoff subtitle="case closed · the inbox is watched" delay={2.7} className="font-sans">
        <p className="text-[clamp(1.5rem,6.5vw,3rem)] font-black tracking-[0.12em] text-white uppercase" style={{ textShadow: `0 0 28px ${DETECTIVE_BLUE}` }}>
          Be the Batman
        </p>
      </Payoff>
    </div>
  </motion.div>
);

// a bat perched by the email, watching it from the rooftops. on call at 3 a.m.
export const Bat = ({ className }) => {
  const [isFound, find] = useSecret("bat");
  const [isScanning, scan] = useFlourish(BAT_TRANSITION_MS);

  const signal = () => {
    find();
    scan();
  };

  return (
    <>
      <SecretButton label="A small bat" className={className} onClick={signal}>
        <motion.span
          className="block"
          initial={false}
          animate={isFound ? { scaleX: [1, -1, 1] } : { scaleX: 1 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
        >
          <svg viewBox="0 0 100 50" className="w-5" aria-hidden="true" style={isFound ? { filter: `drop-shadow(0 0 3px ${DETECTIVE_BLUE})` } : undefined}>
            <path d={BAT_PATH} fill="currentColor" stroke={isFound ? DETECTIVE_BLUE : "none"} strokeWidth="3" />
          </svg>
        </motion.span>
      </SecretButton>
      <Flourish isShown={isScanning}>
        <DetectiveMode />
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
