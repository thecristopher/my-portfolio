import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import TechIcon from "../../components/TechIcon";
import { useScrollRange } from "../../hooks/useScrollRange";
import { countUsing, usesTech } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { pointOnCircle } from "../../lib/geometry";
import Hunter from "./Hunter";
import Metroid from "./Metroid";
import { useHunt, useWinLine } from "./useHunt";
import LevelMeter from "./LevelMeter";
import Planet from "./Planet";
import Starfield from "./Starfield";
import Trails from "./Trails";
import { MAX_LEVEL, cometPass, cometWait, coreRadiusIn, diveCamera, jobsLine, jobsWith, orbitLayout, pointerTilt } from "./actions";

const RING_SIZES = ["52%", "77%", "100%"];
// the deeper I've gone with a tool, the closer its ring floats to you, and the core closest of all
const RING_DEPTHS = [90, 45, 0];
const DEPTH = { core: 140, glow: -80 };
const MAX_TILT = 18;
// the orbit leans back as it comes up the page, sits nearly flat in the middle and tips forward on the way out
const SCROLL_LEAN = [30, 14, -10];
const TILT_SPRING = { stiffness: 90, damping: 18 };
const ZOOM = 3.4;
const TRAIL_WIDTH = 0.7;
const CORE_SHARE = 0.36;
const CENTER = { x: 50, y: 50 };
// about 2px on the widest orbit, in the outer ring's units. smaller rings scale it back up so every beam looks the same
const BEAM_WIDTH = 0.3;

// one tool on its ring: its logo in a round chip that stays upright while the ring turns under it. the name shows in
// the core, so the rings never crowd
const Satellite = ({ tool, counterTurn, isPicked, onFocus, onDive }) => {
  const spot = pointOnCircle(tool.angle, 50, CENTER);
  return (
    <motion.button
      type="button"
      onClick={(event) => onDive(tool, event.currentTarget)}
      onPointerEnter={(event) => onFocus(tool, event.currentTarget)}
      onFocus={(event) => onFocus(tool, event.currentTarget)}
      aria-label={`${tool.name}, level ${tool.level} of ${MAX_LEVEL}. Open it`}
      style={{ left: `${spot.x}%`, top: `${spot.y}%`, rotate: counterTurn }}
      className={`card absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-[scale,box-shadow] duration-300 hover:z-10 hover:scale-125 focus-visible:scale-125 sm:size-12 ${isPicked ? "ring-2 ring-accent" : ""}`}
    >
      <TechIcon tech={tool.name} className="size-4 sm:size-6" fallback={<span className="text-xs font-semibold">{tool.name.slice(0, 2)}</span>} />
    </motion.button>
  );
};

// a line of sunset from the hovered tool to the core, drawn inside the ring so it turns with it and never lets go
const Beam = ({ ringIndex, angle }) => {
  const outer = pointOnCircle(angle, 50, CENTER);
  const inner = pointOnCircle(angle, coreRadiusIn(RING_SIZES[ringIndex], CORE_SHARE), CENTER);
  const id = `beam-${ringIndex}`;
  return (
    <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}>
          <stop offset="0" style={{ stopColor: "var(--color-sunset-3)", stopOpacity: 0 }} />
          <stop offset="1" style={{ stopColor: "var(--color-sunset-1)" }} />
        </linearGradient>
      </defs>
      <motion.line
        x1={outer.x}
        y1={outer.y}
        x2={inner.x}
        y2={inner.y}
        stroke={`url(#${id})`}
        strokeWidth={BEAM_WIDTH / (parseFloat(RING_SIZES[ringIndex]) / 100)}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease: easeOutExpo }}
      />
    </svg>
  );
};

const Ring = ({ ring, progress, pickedTech, focusedName, hideout, isDefeated, onPeek, onFocus, onDive }) => {
  const direction = ring.ring % 2 === 0 ? 1 : -1;
  const turn = useScrollRange(progress, [0, 1], [-40 * direction, 50 * direction]);
  const counterTurn = useTransform(turn, (degrees) => -degrees);
  const focusedTool = ring.tools.find((tool) => tool.name === focusedName);
  const hidingSpot = ring.tools.find((tool) => tool.name === hideout);
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line-strong"
      style={{ width: RING_SIZES[ring.ring], height: RING_SIZES[ring.ring], rotate: turn, z: RING_DEPTHS[ring.ring] }}
    >
      <Trails tools={ring.tools} turn={turn} strokeWidth={TRAIL_WIDTH / (parseFloat(RING_SIZES[ring.ring]) / 100)} />
      {focusedTool && <Beam key={focusedTool.name} ringIndex={ring.ring} angle={focusedTool.angle} />}
      {/* drawn before the tools so the larva hides behind its tool and only peeks out */}
      {/* custom reaches the larva as it leaves, so it knows whether it was hit or defeated */}
      <AnimatePresence custom={{ isDefeated }}>
        {hidingSpot && <Metroid key={hidingSpot.name} angle={hidingSpot.angle} counterTurn={counterTurn} onPeek={onPeek} />}
      </AnimatePresence>
      {ring.tools.map((tool) => (
        <Satellite key={tool.name} tool={tool} counterTurn={counterTurn} isPicked={pickedTech === tool.name} onFocus={onFocus} onDive={onDive} />
      ))}
    </motion.div>
  );
};

const FocusedTool = ({ tool, jobs }) => (
  <>
    <TechIcon tech={tool.name} className="size-9 sm:size-12" fallback={null} />
    <p className="text-lg leading-tight font-semibold tracking-tight sm:text-2xl">{tool.name}</p>
    <LevelMeter level={tool.level} className="size-8" />
    {jobs && <p className="text-xs text-muted sm:text-sm">{jobs}</p>}
  </>
);

// the middle of the orbit names whatever tool the cursor is on and where it shipped, or counts them all
const Core = ({ focused, total, projects }) => (
  <div
    className="pointer-events-none absolute top-1/2 left-1/2 flex w-[36%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 text-center"
    style={{ transform: `translateZ(${DEPTH.core}px)` }}
  >
    <AnimatePresence mode="wait">
      <motion.div
        key={focused?.name ?? "all"}
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        transition={{ duration: 0.35, ease: easeOutExpo }}
        className="flex flex-col items-center gap-2"
      >
        {focused ? (
          <FocusedTool tool={focused} jobs={jobsLine(countUsing(projects, focused.name), projects.length)} />
        ) : (
          <>
            <p className="text-sunset text-5xl leading-none font-semibold tracking-tight sm:text-7xl">{total}</p>
            <p className="hidden text-sm text-muted sm:block">tools in orbit. The deeper I've gone, the closer in. Open one.</p>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  </div>
);

// now and then a comet streaks across the orbit, rare enough that catching one feels like luck
const Comet = () => {
  const prefersReducedMotion = useReducedMotion();
  const [pass, setPass] = useState(null);

  useEffect(() => {
    if (prefersReducedMotion || pass) return undefined;
    const timer = setTimeout(() => setPass({ ...cometPass(), key: Date.now() }), cometWait());
    return () => clearTimeout(timer);
  }, [pass, prefersReducedMotion]);

  if (!pass) return null;
  const { from, to, angle } = pass;
  return (
    <motion.span
      key={pass.key}
      className="pointer-events-none absolute size-0"
      style={{ rotate: angle }}
      initial={{ left: `${from.x}%`, top: `${from.y}%`, opacity: 0 }}
      animate={{ left: `${to.x}%`, top: `${to.y}%`, opacity: [0, 1, 1, 0] }}
      transition={{ duration: 1.8, ease: "easeIn", opacity: { duration: 1.8, times: [0, 0.15, 0.75, 1] } }}
      onAnimationComplete={() => setPass(null)}
      aria-hidden="true"
    >
      <span className="absolute top-[-1px] right-0 h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-sunset-3/50 to-sunset-1 sm:w-40" />
      <span className="absolute -top-[3px] -right-[3px] size-1.5 rounded-full bg-sunset-1 shadow-[0_0_10px_3px_var(--color-sunset-1)]" />
    </motion.span>
  );
};

// the orbit leans with the scroll on every screen, and toward the cursor on top of that when there's a mouse
const useTilt = (progress, isStill) => {
  const leanX = useSpring(0, TILT_SPRING);
  const leanY = useSpring(0, TILT_SPRING);
  const scrollLean = useScrollRange(progress, [0, 0.5, 1], SCROLL_LEAN);
  const rotateX = useTransform([scrollLean, leanX], ([base, lean]) => (isStill ? 0 : base + lean));
  const rotateY = useTransform(leanY, (lean) => (isStill ? 0 : lean));

  const follow = (event) => {
    if (event.pointerType !== "mouse" || isStill) return;
    const tilt = pointerTilt(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect(), MAX_TILT);
    leanX.set(tilt.rotateX);
    leanY.set(tilt.rotateY);
  };
  const settle = () => {
    leanX.set(0);
    leanY.set(0);
  };
  return { rotateX, rotateY, follow, settle };
};

// opening a tool: remembers which satellite it came from and where it sat, so the camera can fly there and focus can
// land back on it once the camera flies out. it carries the fight with the larva too, when the larva hid there
const useDive = (orbitRef) => {
  const [dive, setDive] = useState(null);
  const returnTo = useRef(null);

  const open = (tool, satellite, encounter = null) => {
    const orbit = orbitRef.current.getBoundingClientRect();
    const spot = satellite.getBoundingClientRect();
    returnTo.current = satellite;
    setDive({
      tool,
      encounter,
      offset: { x: spot.left + spot.width / 2 - (orbit.left + orbit.width / 2), y: spot.top + spot.height / 2 - (orbit.top + orbit.height / 2) },
    });
  };
  const close = useCallback(() => setDive(null), []);
  const leave = () => {
    returnTo.current = null;
    setDive(null);
  };

  useEffect(() => {
    if (dive || !returnTo.current) return;
    returnTo.current.focus();
    returnTo.current = null;
  }, [dive]);

  return { dive, open, close, leave };
};

// true from the moment a condition first holds, and for good after
const useLatch = (condition) => {
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    if (condition) setIsOn(true);
  }, [condition]);

  return isOn;
};

const AT_REST = { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" };

// the camera: flies into a satellite until it fills the screen, leaving the orbit as a blur of light behind the card
const cameraFor = (dive) => {
  if (!dive) return { ...AT_REST, transition: { duration: 0.9, ease: easeOutExpo } };
  return { ...diveCamera(dive.offset, ZOOM), opacity: 0.22, filter: "blur(10px)", transition: { duration: 0.9, ease: [0.65, 0, 0.35, 1] } };
};

/**
 * Every tool around a core, by how deep I've gone, in 3D: the rings float at their own depths over a field of stars,
 * lean with the scroll and the cursor, turn against each other as the section scrolls by and leave trails of light.
 * Opening a tool flies the camera into it and turns it into a planet with its level and the jobs it shipped at.
 * @param {{ tools: object[], projects: object[], pickedTech: string | null, onPick: (tool: string) => void }} props
 */
const Orbit = ({ tools, projects, pickedTech, onPick }) => {
  const ref = useRef(null);
  const [focused, setFocused] = useState(null);
  // the satellite Samus has in her sights, and the larva while it peeks out
  const [target, setTarget] = useState(null);
  const [sighting, setSighting] = useState(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { rotateX, rotateY, follow, settle } = useTilt(scrollYProgress, prefersReducedMotion);
  const { dive, open, close, leave } = useDive(ref);
  const rings = orbitLayout(tools);
  const { hunt, strike } = useHunt(tools.map((tool) => tool.name));
  // her ending waits for the card that defeated the larva to close, so it plays out where it can be seen
  const isEnding = useLatch(hunt.isDefeated && !dive);
  useWinLine(hunt, isEnding);

  // opening a tool is Samus shooting at it, so the card knows whether the larva was there and how it fared
  const openTool = (tool, satellite) => open(tool, satellite, strike(tool.name));

  const focus = (tool, satellite) => {
    setFocused(tool);
    setTarget(tool ? { name: tool.name, element: satellite } : null);
  };

  const seeJobs = () => {
    const name = dive.tool.name;
    leave();
    onPick(name);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      // it starts arriving as soon as its top edge shows, so the heading is never left alone over an empty gap
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 1.4, ease: easeOutExpo }}
      onPointerMove={follow}
      onPointerLeave={() => {
        focus(null, null);
        settle();
      }}
      // an open planet rises over the grid below it, which otherwise sits above the orbit to keep the stars off the cards
      className={`relative mx-auto aspect-square w-full max-w-[44rem] ${dive ? "z-20" : ""}`}
    >
      <motion.div animate={cameraFor(dive)} inert={Boolean(dive)} className="absolute inset-0 [perspective:1400px]">
        <motion.div style={{ rotateX, rotateY }} className="absolute inset-0 [transform-style:preserve-3d]">
          <Starfield />
          <span
            className="bg-sunset absolute top-1/2 left-1/2 size-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
            style={{ transform: `translateZ(${DEPTH.glow}px)` }}
            aria-hidden="true"
          />
          <Comet />
          {rings.map((ring) => (
            <Ring
              key={ring.ring}
              ring={ring}
              progress={scrollYProgress}
              pickedTech={pickedTech}
              focusedName={focused?.name}
              hideout={hunt.hideout}
              isDefeated={hunt.isDefeated}
              onPeek={setSighting}
              onFocus={focus}
              onDive={openTool}
            />
          ))}
          <Core focused={focused} total={tools.length} projects={projects} />
        </motion.div>
      </motion.div>
      <Hunter target={target} sighting={sighting} orbitRef={ref} isHidden={Boolean(dive)} isEnding={isEnding} />
      <AnimatePresence>
        {dive && (
          <Planet
            key={dive.tool.name}
            tool={dive.tool}
            origin={dive.offset}
            jobs={jobsWith(projects, usesTech, dive.tool.name)}
            total={projects.length}
            encounter={dive.encounter}
            onClose={close}
            onSeeJobs={seeJobs}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orbit;
