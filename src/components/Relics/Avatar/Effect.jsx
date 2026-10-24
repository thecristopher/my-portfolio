import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { bandedGlow } from "../../../actions";
import { pixelSteps } from "../../../lib/motion";
import PixelArt from "../../PixelArt";
import { AangArrow, NationEmblem } from "./Emblems";
import { NATIONS } from "./nations";
import { FLAME_PALETTE, FLAME_ROWS } from "./sprites";
import { BEATS, diamondSpots, elementBeat, flameRow, gustRows, mirrorRows, rockRows, waveRows } from "./helpers";

const SCROLL_GOLD = "#f3d9a4";
const OUTLINE = "#0b1622";
// each element holds the screen for its beat plus a little overlap, so one line hands off to the next
const SCENE_S = BEATS.elementGap + 0.25;
const WAVE_ROWS = waveRows({ width: 160, height: 20, level: 7, swell: 4, wavelength: 20 });
const ROCKS = Array.from({ length: 7 }, (_, index) => ({ index, rows: rockRows(index), left: (index / 7) * 100 - 1 }));
const FLAMES = flameRow(9);
const FLAME_FLICKER = mirrorRows(FLAME_ROWS);
const GUST_ARCS = [
  { radius: 14, from: 0, sweep: 200, fill: "w" },
  { radius: 18, from: 120, sweep: 160, fill: "#" },
  { radius: 22, from: 240, sweep: 220, fill: "w" },
  { radius: 10, from: 60, sweep: 140, fill: "#" },
];
// the gusts spin by being redrawn a few degrees on, frame after frame, so their pixels never leave the grid
const GUST_FRAMES = [0, 32, 64, 96, 128, 160].map((turn) => gustRows(48, GUST_ARCS, turn));
// the hard shadow every pixel title wears, a 16 bit drop shadow instead of a blurred glow
const pixelShadow = (color) => `2px 2px 0 ${color}, 4px 4px 0 ${OUTLINE}`;

// how long a backdrop plays: in fast, held, out with its scene
const sceneTiming = (index) => ({ duration: SCENE_S, delay: elementBeat(index), times: [0, 0.15, 0.8, 1], ease: pixelSteps(3) });

const WaveRoll = ({ nation, isCalm }) => (
  <div className="absolute inset-x-0 bottom-0 h-[40vh] overflow-hidden">
    {[0.45, 1].map((strength, layer) => (
      <motion.div
        key={strength}
        className="absolute left-0 w-[max(200%,160vh)]"
        style={{ bottom: `${-layer * 4}vh`, opacity: strength }}
        initial={{ x: "0%", y: isCalm ? "0%" : "70%" }}
        animate={{ x: isCalm ? "0%" : `-${25 + layer * 25}%`, y: "0%" }}
        transition={{
          x: { duration: SCENE_S, delay: elementBeat(0), ease: pixelSteps(10) },
          y: { duration: 0.5, delay: elementBeat(0), ease: pixelSteps(4) },
        }}
      >
        <PixelArt rows={WAVE_ROWS} palette={{ K: OUTLINE, "+": nation.light, "#": nation.color, "-": nation.dark }} className="block h-auto w-full" />
      </motion.div>
    ))}
  </div>
);

const ROCK_PALETTE = { K: OUTLINE, "+": "#8a7458", "#": "#5c4a36", "-": "#3a2e22" };

const RocksRise = ({ nation }) =>
  ROCKS.map(({ index, rows, left }) => (
    <motion.div
      key={index}
      className="absolute bottom-0 w-[16%]"
      style={{ left: `${left}%`, filter: `drop-shadow(0 -3px 0 ${nation.color})` }}
      initial={{ y: "110%" }}
      animate={{ y: index % 2 === 0 ? "0%" : "18%" }}
      transition={{ duration: 0.5, delay: elementBeat(1) + Math.abs(index - 3) * 0.04, ease: pixelSteps(5) }}
    >
      <PixelArt rows={rows} palette={ROCK_PALETTE} className="block h-auto w-full" />
    </motion.div>
  ));

// a tongue of fire flickers by swapping to its mirror image, the two frame loop old games used for every torch
const Flame = ({ height, flicker, isCalm }) => (
  <div className="relative" style={{ height: `${height}vh`, aspectRatio: "10 / 16" }}>
    <PixelArt rows={FLAME_ROWS} palette={FLAME_PALETTE} className="absolute inset-0 size-full" />
    {!isCalm && (
      <motion.span
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: flicker * 2, repeat: Infinity, ease: pixelSteps(1) }}
      >
        <PixelArt rows={FLAME_FLICKER} palette={FLAME_PALETTE} className="size-full" />
      </motion.span>
    )}
  </div>
);

const FlamesRise = ({ isCalm }) =>
  FLAMES.map(({ left, height, flicker }) => (
    <motion.div
      key={left}
      className="absolute bottom-0 -translate-x-1/2"
      style={{ left: `${left}%` }}
      initial={{ y: "100%" }}
      animate={{ y: "0%" }}
      transition={{ duration: 0.4, delay: elementBeat(2), ease: pixelSteps(4) }}
    >
      <Flame height={height} flicker={flicker} isCalm={isCalm} />
    </motion.div>
  ));

const GustsSwirl = ({ nation, isCalm }) => {
  const frames = isCalm ? GUST_FRAMES.slice(0, 1) : GUST_FRAMES;
  const frameS = SCENE_S / frames.length;
  return (
    <div className="absolute top-[42%] left-1/2 size-[min(96vw,34rem)] -translate-x-1/2 -translate-y-1/2">
      {frames.map((rows, index) => (
        <motion.span
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          // each frame blinks on for its slice of the scene and the last one holds until the scene fades
          animate={{ opacity: index === frames.length - 1 ? [0, 1, 1, 1] : [0, 1, 1, 0] }}
          transition={{ duration: frameS, delay: elementBeat(3) + index * frameS, times: [0, 0.01, 0.99, 1], ease: pixelSteps(1) }}
        >
          <PixelArt rows={rows} palette={{ w: "#fff3dc", "#": nation.color }} className="size-full" />
        </motion.span>
      ))}
    </div>
  );
};

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
      <Backdrop nation={nation} isCalm={isCalm} />
      <div className="absolute inset-x-4 top-[42%] flex -translate-y-1/2 flex-col items-center gap-5">
        <motion.span
          className="relative block"
          initial={{ scale: isCalm ? 1 : 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: elementBeat(index), ease: pixelSteps(4) }}
        >
          <span className="absolute -inset-1/2" style={{ background: bandedGlow(nation.color, { strength: 0.35, bands: 4 }) }} />
          <NationEmblem nation={nation} className="relative block size-[min(40vw,10rem)]" />
        </motion.span>
        <p className="font-pixel text-4xl tracking-[0.12em] text-white sm:text-5xl" style={{ textShadow: pixelShadow(nation.color) }}>
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
    <div className="absolute inset-x-4 top-[46%] flex -translate-y-1/2 flex-col items-center gap-6 sm:gap-8">
      <div className="relative size-[min(68vw,17rem)]">
        <Shockwave color={SCROLL_GOLD} delay={BEATS.together} size="100%" />
        {NATIONS.map((nation, index) => (
          <motion.span
            key={nation.id}
            className="absolute top-1/2 left-1/2 block size-[26%] -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, left: "50%", top: "50%", scale: 0.3 }}
            animate={{ opacity: 1, left: `${50 + spots[index].x}%`, top: `${50 + spots[index].y}%`, scale: 1 }}
            transition={{ duration: 0.6, delay: BEATS.together + index * 0.05, ease: pixelSteps(6) }}
          >
            <NationEmblem nation={nation} className="block size-full" />
          </motion.span>
        ))}
        <motion.span
          className="absolute top-1/2 left-1/2 block h-[34%] -translate-x-1/2 -translate-y-1/2"
          initial={{ opacity: 0, y: isCalm ? 0 : "-45vh" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: BEATS.together + 0.1, ease: pixelSteps(6) }}
        >
          <AangArrow className="h-full w-auto" />
        </motion.span>
      </div>
      <div className="flex max-w-md flex-col items-center gap-3 text-center text-balance font-pixel">
        <p className="text-[clamp(0.95rem,4vw,1.125rem)] text-[#f3e6c8]" style={{ textShadow: `2px 2px 0 ${OUTLINE}` }}>
          <TypedText text="Long ago, the four stacks lived together in harmony." startAt={BEATS.harmony} perLetter={0.022} />
        </p>
        <p className="flex flex-wrap justify-center gap-x-3 text-[clamp(0.875rem,3.6vw,1rem)] tracking-[0.18em] uppercase">
          {["Frontend.", "Backend.", "Cloud.", "People."].map((role, index) => (
            <motion.span
              key={role}
              style={{ color: NATIONS[index].color, textShadow: `2px 2px 0 ${OUTLINE}` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: BEATS.roles + index * 0.18, ease: pixelSteps(3) }}
            >
              {role}
            </motion.span>
          ))}
        </p>
        <motion.p
          className="text-[clamp(0.95rem,4vw,1.125rem)] text-white"
          style={{ textShadow: pixelShadow(SCROLL_GOLD) }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: BEATS.master, ease: pixelSteps(3) }}
        >
          Only an Engineering Manager can master all four.
        </motion.p>
      </div>
    </div>
  );
};

/** Avatar: the opening narration. Water, Earth, Fire, Air, one beat apart, then the four nations join around Aang's arrow and stay. */
const FourNations = ({ onDone }) => {
  const isCalm = useReducedMotion();
  useMomentLength(BEATS.lastsMs, onDone);

  return (
    <EffectLayer background={`${bandedGlow(SCROLL_GOLD, { strength: 0.08, reach: 80, bands: 4 })}, rgba(2,2,4,0.97)`}>
      {NATIONS.map((nation, index) => (
        <ElementScene key={nation.id} nation={nation} index={index} isCalm={isCalm} />
      ))}
      <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: BEATS.together - 0.1, ease: pixelSteps(3) }}>
        <Harmony isCalm={isCalm} />
      </motion.div>
    </EffectLayer>
  );
};

export default FourNations;
