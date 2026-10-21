import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { easedGlow } from "../../../actions";
import { easeOutExpo } from "../../../lib/motion";
import { AangArrow, NationEmblem } from "./Emblems";
import { NATIONS } from "./nations";
import { BEATS, diamondSpots, elementBeat, flameRow, gustArc, rockRow, wavePath } from "./helpers";

const ARROW_BLUE = "#4aa8ff";
const SCROLL_GOLD = "#f3d9a4";
// each element holds the screen for its beat plus a little overlap, so one line hands off to the next
const SCENE_S = BEATS.elementGap + 0.25;
const ROCKS = rockRow(7);
const FLAMES = flameRow(9);
const WAVE = wavePath({ width: 200, height: 40, level: 14, swell: 7, wavelength: 25 });
const GUSTS = [
  { radius: 30, from: 0, sweep: 200 },
  { radius: 38, from: 120, sweep: 160 },
  { radius: 46, from: 240, sweep: 220 },
  { radius: 22, from: 60, sweep: 140 },
];

// how long a backdrop plays: in fast, held, out with its scene
const sceneTiming = (index) => ({ duration: SCENE_S, delay: elementBeat(index), times: [0, 0.15, 0.8, 1] });

const WaveRoll = ({ color, isCalm }) => (
  <div className="absolute inset-x-0 bottom-0 h-[34vh] overflow-hidden">
    {[0.45, 1].map((strength, layer) => (
      <motion.svg
        key={strength}
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute bottom-0 left-0 h-full w-[200%]"
        style={{ bottom: `${-layer * 4}vh`, opacity: strength }}
        initial={{ x: "0%", y: isCalm ? "0%" : "70%" }}
        animate={{ x: isCalm ? "0%" : `-${25 + layer * 25}%`, y: "0%" }}
        transition={{ x: { duration: SCENE_S, delay: elementBeat(0), ease: "linear" }, y: { duration: 0.5, delay: elementBeat(0), ease: easeOutExpo } }}
      >
        <path d={WAVE} fill={color} />
      </motion.svg>
    ))}
  </div>
);

const RocksRise = ({ color }) =>
  ROCKS.map(({ left, width, height, delay, outline }) => (
    <motion.svg
      key={left}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute bottom-0"
      style={{ left: `${left}%`, width: `${width}%`, height: `${height}vh` }}
      initial={{ y: "110%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.5, delay: elementBeat(1) + delay, ease: easeOutExpo }}
    >
      <polygon points={outline} fill="#5c4a36" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </motion.svg>
  ));

const FlamesRise = ({ isCalm }) =>
  FLAMES.map(({ left, height, flicker }) => (
    <motion.svg
      key={left}
      viewBox="0 0 20 32"
      preserveAspectRatio="none"
      className="absolute bottom-0 w-[16%] -translate-x-1/2"
      style={{ left: `${left}%`, height: `${height}vh`, transformOrigin: "50% 100%", filter: "drop-shadow(0 0 12px #ff6a1a)" }}
      initial={{ scaleY: 0 }}
      animate={isCalm ? { scaleY: 1 } : { scaleY: [0, 1.15, 0.9, 1.1, 0.95] }}
      transition={{ duration: flicker * 4, delay: elementBeat(2), ease: "easeInOut" }}
    >
      <path d="M10 0 C14 8 20 14 20 22 C20 28 15 32 10 32 C5 32 0 28 0 22 C0 14 6 8 10 0 Z" fill="url(#avatar-flame)" />
    </motion.svg>
  ));

const GustsSwirl = ({ color, isCalm }) => (
  <motion.svg
    viewBox="-50 -50 100 100"
    className="absolute top-[42%] left-1/2 size-[min(96vw,34rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible"
    initial={{ rotate: 0 }}
    animate={isCalm ? undefined : { rotate: 160 }}
    transition={{ duration: SCENE_S, delay: elementBeat(3), ease: "easeOut" }}
  >
    <g fill="none" strokeLinecap="round">
      {GUSTS.map(({ radius, from, sweep }, index) => (
        <motion.path
          key={radius}
          d={gustArc(radius, from, sweep)}
          stroke={index % 2 === 0 ? "#fff3dc" : color}
          strokeWidth={index % 2 === 0 ? 1.2 : 2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: SCENE_S, delay: elementBeat(3) + index * 0.05, ease: "easeOut" }}
        />
      ))}
    </g>
  </motion.svg>
);

const BACKDROPS = {
  water: WaveRoll,
  earth: RocksRise,
  fire: FlamesRise,
  air: GustsSwirl,
};

// one line of the narration: the element's backdrop, its emblem big in the middle, and its name
const ElementScene = ({ nation, index, isCalm }) => {
  const Backdrop = BACKDROPS[nation.id];
  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={sceneTiming(index)}>
      <Backdrop color={nation.color} isCalm={isCalm} />
      <div className="absolute inset-x-4 top-[42%] flex -translate-y-1/2 flex-col items-center gap-5">
        <motion.span
          className="block"
          initial={{ scale: isCalm ? 1 : 0.6 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: elementBeat(index), ease: easeOutExpo }}
        >
          <NationEmblem nation={nation} className="block size-[min(40vw,10rem)]" style={{ filter: `drop-shadow(0 0 18px ${nation.color})` }} />
        </motion.span>
        <p className="font-display text-4xl tracking-[0.12em] text-white sm:text-5xl" style={{ textShadow: `0 0 18px ${nation.color}` }}>
          {nation.word}
        </p>
      </div>
    </motion.div>
  );
};

// all four nations around Aang's arrow, then the narration and what it means here
const Harmony = ({ isCalm }) => {
  const spots = diamondSpots(36);
  return (
    <div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 flex-col items-center gap-8">
      <div className="relative size-[min(68vw,17rem)]">
        <Shockwave color={SCROLL_GOLD} delay={BEATS.together} size="100%" />
        {NATIONS.map((nation, index) => (
          <motion.span
            key={nation.id}
            className="absolute top-1/2 left-1/2 block size-[26%] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, left: "50%", top: "50%", scale: 0.3 }}
            animate={{ opacity: 1, left: `${50 + spots[index].x}%`, top: `${50 + spots[index].y}%`, scale: 1 }}
            transition={{ duration: 0.7, delay: BEATS.together + index * 0.05, ease: easeOutExpo }}
          >
            <NationEmblem nation={nation} className="block size-full" style={{ filter: `drop-shadow(0 0 10px ${nation.color})` }} />
          </motion.span>
        ))}
        <motion.span
          className="absolute top-1/2 left-1/2 block h-[34%] -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, y: isCalm ? 0 : "-45vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: BEATS.together + 0.1, ease: easeOutExpo }}
        >
          <AangArrow color={ARROW_BLUE} className="h-full w-auto" style={{ filter: `drop-shadow(0 0 14px ${ARROW_BLUE})` }} />
        </motion.span>
      </div>
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <p className="font-serif text-base text-[#f3e6c8] italic sm:text-lg">
          <TypedText text="Long ago, the four nations lived together in harmony." startAt={BEATS.harmony} perLetter={0.022} />
        </p>
        <p className="flex flex-wrap justify-center gap-x-3 font-display text-sm tracking-[0.18em] uppercase sm:text-base">
          {["Frontend.", "Backend.", "Cloud.", "People."].map((role, index) => (
            <motion.span
              key={role}
              style={{ color: NATIONS[index].color }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: BEATS.roles + index * 0.18, ease: easeOutExpo }}
            >
              {role}
            </motion.span>
          ))}
        </p>
      </div>
    </div>
  );
};

/** Avatar: the opening narration. Water, Earth, Fire, Air, one beat apart, then the four nations join around Aang's arrow. */
const FourNations = ({ onDone }) => {
  const isCalm = useReducedMotion();
  useMomentLength(BEATS.lastsMs, onDone);

  return (
    <EffectLayer background={`${easedGlow(SCROLL_GOLD, { strength: 0.08, shape: "ellipse", reach: 80 })}, rgba(2,2,4,0.97)`}>
      <svg className="absolute size-0" aria-hidden="true">
        <linearGradient id="avatar-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#c81e0f" />
          <stop offset="0.55" stopColor="#ff6a1a" />
          <stop offset="1" stopColor="#ffd34d" />
        </linearGradient>
      </svg>
      {NATIONS.map((nation, index) => (
        <ElementScene key={nation.id} nation={nation} index={index} isCalm={isCalm} />
      ))}
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: BEATS.together - 0.1 }}>
        <Harmony isCalm={isCalm} />
      </motion.div>
    </EffectLayer>
  );
};

export default FourNations;
