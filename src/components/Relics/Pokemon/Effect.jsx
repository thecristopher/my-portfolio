import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import PixelArt from "../../PixelArt";
import { pixelRingRows, spriteToPixels } from "../../../actions";
import { AVATAR_PALETTE, AVATAR_ROWS } from "../../../lib/avatarSprite";
import { pixelSteps } from "../../../lib/motion";
import { frameAt, pixelsToPaths, spinSchedule, spritePaths, typingEnds, wobbleKeyframes, wobbleSchedule } from "./helpers";
import { PixelPaths, Platform, PokeBallSprite } from "./pieces";
import { CATCH_STAR, POKE_RED, STAR_PALETTE, TRAINER_BACK, TRAINER_PALETTE } from "./sprites";

const INK = "#202020";
const HP_GREEN = "#58d080";

// every beat lines up with its note in sound.js
const BARS_AT = 0.4;
const SCENE_AT = 0.9;
const APPEARED_AT = 1.35;
const THROW_AT = 2.3;
const ZAP_AT = 2.75;
const WOBBLE_AT = 3.4;
const CAUGHT_AT = 4.65;
const DEX_AT = 5.05;
const PER_LETTER = 0.025;
const DEX_PER_LETTER = 0.005;

const APPEARED = "A wild CRISTOPHER appeared!";
const GO = "Go! POKé BALL!";
const GOTCHA = "Gotcha! CRISTOPHER was caught!";
// the next line waits for the first to finish printing, like a real text box
const GO_AT = typingEnds(APPEARED, APPEARED_AT, PER_LETTER) + 0.05;
const EVOLVED = "Evolved: INTERN, DEVELOPER, SENIOR, TECH LEAD, MANAGER.";
const MOVES = "Known moves: TypeScript, AWS Bedrock, Code Review, 1:1.";
const MOVES_AT = typingEnds(EVOLVED, DEX_AT + 0.1, DEX_PER_LETTER) + 0.05;
// the battle screen and the Pokédex card hold once the last move is printed
const MOMENT_MS = Math.round(typingEnds(MOVES, MOVES_AT, DEX_PER_LETTER) * 1000) + 150;
const WIPE_BANDS = 8;

const ENEMY_PIXELS = spriteToPixels(AVATAR_ROWS, AVATAR_PALETTE);
const ENEMY_PATHS = pixelsToPaths(ENEMY_PIXELS);
// the same sprite in one solid color, for the red flash as he's pulled into the ball
const ENEMY_RED = pixelsToPaths(ENEMY_PIXELS.map((pixel) => ({ ...pixel, color: "#ff5040" })));
const TRAINER_PATHS = spritePaths(TRAINER_BACK, TRAINER_PALETTE);
// the ball spins two full turns on the way up, sits still, then rocks three times before it locks
const BALL_SCHEDULE = [
  ...spinSchedule(THROW_AT, (CAUGHT_AT - THROW_AT) * 0.19, 2),
  ...wobbleSchedule(WOBBLE_AT, CAUGHT_AT - WOBBLE_AT, wobbleKeyframes(3)),
];
// the white pop is a red disc with a white heart, both drawn as filled pixel rings
const BURST_RED = pixelRingRows(16, 8, "r");
const BURST_WHITE = pixelRingRows(16, 5, "w");
const BURST_PALETTE = { r: "#ff5040", w: "#ffffff" };

/** The screen flashes white twice, the instant you know something jumped out of the grass. */
const EncounterFlash = () => (
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0, 1, 0] }}
    transition={{ duration: BARS_AT, ease: pixelSteps(2) }}
  />
);

/** Black bands slide in from alternating sides until the screen is dark, then the battle shows up underneath. */
const BattleWipe = ({ isGentle }) => (
  <motion.div
    className="absolute inset-0 flex flex-col"
    animate={{ opacity: [1, 1, 0] }}
    transition={{ duration: SCENE_AT + 0.25, times: [0, 0.8, 1] }}
  >
    {Array.from({ length: WIPE_BANDS }, (_, band) => (
      <motion.div
        key={band}
        className="flex-1 bg-black"
        style={{ originX: band % 2 === 0 ? 0 : 1 }}
        initial={isGentle ? { opacity: 0 } : { scaleX: 0 }}
        animate={isGentle ? { opacity: 1 } : { scaleX: 1 }}
        transition={{ duration: 0.25, delay: BARS_AT + band * 0.03, ease: pixelSteps(5) }}
      />
    ))}
  </motion.div>
);

/** The enemy's box: name, gender, level and a full green HP bar. */
const EnemyStatus = () => (
  <motion.div
    className="absolute top-[7%] left-[4%] w-[46%] border-4 bg-[#f8f8d8] px-[3%] py-[2%] font-pixel text-[clamp(9px,2.6vw,15px)] leading-tight text-[#404040] shadow-[4px_4px_0_#404040]"
    style={{ borderColor: INK }}
    initial={{ x: "-130%" }}
    animate={{ x: 0 }}
    transition={{ duration: 0.3, delay: SCENE_AT + 0.4, ease: pixelSteps(5) }}
  >
    <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
      <span>
        CRISTOPHER<span className="text-[#4080f0]">♂</span>
      </span>
      <span>Lv9</span>
    </div>
    <div className="mt-[4%] flex items-center gap-1">
      <span className="bg-[#404040] px-1 text-[0.7em] text-[#f8c040]">HP</span>
      <span className="h-[0.6em] flex-1 border-2 border-[#404040] bg-[#404040]">
        <span className="block h-full border-t-2 border-[#a0f0b8]" style={{ background: HP_GREEN }} />
      </span>
    </div>
  </motion.div>
);

/** Wild Cristopher on his platform. Hit by the ball he flashes red and gets pulled inside it. */
const WildCristopher = () => (
  <motion.div
    className="absolute bottom-[50%] left-[72%] h-[40%] -translate-x-1/2"
    initial={{ x: "-180%" }}
    animate={{ x: 0, scale: [1, 1, 0], opacity: [1, 1, 0] }}
    transition={{
      x: { duration: 0.4, delay: SCENE_AT, ease: pixelSteps(8) },
      scale: { duration: 0.35, delay: ZAP_AT, times: [0, 0.3, 1], ease: pixelSteps(4) },
      opacity: { duration: 0.35, delay: ZAP_AT, times: [0, 0.8, 1], ease: pixelSteps(2) },
    }}
  >
    {/* mirrored so he faces the trainer, the way every wild Pokémon squares up */}
    <svg viewBox="0 0 44 63" shapeRendering="crispEdges" className="h-full w-auto -scale-x-100 overflow-visible">
      <PixelPaths paths={ENEMY_PATHS} />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.08, delay: ZAP_AT }}>
        <PixelPaths paths={ENEMY_RED} />
      </motion.g>
    </svg>
  </motion.div>
);

/** The trainer seen from behind, sliding in from the right. */
const Trainer = () => (
  <motion.svg
    viewBox="0 0 16 16"
    shapeRendering="crispEdges"
    className="absolute bottom-[29%] left-[12%] h-[34%] w-auto"
    initial={{ x: "160%" }}
    animate={{ x: 0 }}
    transition={{ duration: 0.4, delay: SCENE_AT, ease: pixelSteps(8) }}
  >
    <PixelPaths paths={TRAINER_PATHS} />
  </motion.svg>
);

// plays a flipbook from the moment it mounts, checking the clock often enough that no pose gets skipped
const useFlipbook = (schedule) => {
  const [frame, setFrame] = useState(schedule[0][1]);

  useEffect(() => {
    const startedAt = performance.now();
    const lastAt = schedule.at(-1)[0];
    const tick = setInterval(() => {
      const seconds = (performance.now() - startedAt) / 1000;
      setFrame(frameAt(schedule, seconds));
      if (seconds > lastAt) clearInterval(tick);
    }, 30);
    return () => clearInterval(tick);
  }, [schedule]);

  return frame;
};

/** The ball: thrown in an arc, swallows the target, drops, wobbles three times and clicks shut. */
const ThrownBall = () => {
  const frame = useFlipbook(BALL_SCHEDULE);

  return (
    <motion.div
      className="absolute aspect-[22/16] w-[9.6%] -translate-x-1/2 -translate-y-1/2"
      initial={{ left: "14%", top: "70%", opacity: 0 }}
      animate={{ left: ["14%", "45%", "72%", "72%", "72%"], top: ["70%", "4%", "30%", "30%", "42%"], opacity: 1 }}
      transition={{
        duration: WOBBLE_AT - THROW_AT,
        delay: THROW_AT,
        times: [0, 0.23, 0.41, 0.73, 0.86],
        ease: [pixelSteps(6), pixelSteps(5), pixelSteps(1), pixelSteps(3)],
        opacity: { duration: 0.01, delay: THROW_AT },
      }}
    >
      <motion.div
        className="size-full"
        animate={{ filter: ["brightness(1)", "brightness(0.6)", "brightness(1)"] }}
        transition={{ duration: 0.3, delay: CAUGHT_AT, ease: pixelSteps(2) }}
      >
        <PokeBallSprite frame={frame} className="block size-full" />
      </motion.div>
      <CatchStars />
    </motion.div>
  );
};

/** The white pop where the ball opens and pulls him in. */
const CaptureBurst = () => (
  <motion.div
    className="absolute top-[30%] left-[72%] size-[22%] -translate-x-1/2 -translate-y-1/2"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
    transition={{ duration: 0.45, delay: ZAP_AT, ease: pixelSteps(4) }}
  >
    <PixelArt rows={BURST_RED} palette={BURST_PALETTE} className="absolute inset-0 size-full" />
    <PixelArt rows={BURST_WHITE} palette={BURST_PALETTE} className="absolute inset-[20%] size-[60%]" />
  </motion.div>
);

// three stars pop off the ball the moment it locks
const STAR_DRIFT = [-1, 0, 1];
const CatchStars = () =>
  STAR_DRIFT.map((side) => (
    <motion.div
      key={side}
      className="absolute top-0 left-1/2 size-[50%] -translate-x-1/2"
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{ x: `${side * 140}%`, y: ["0%", "-180%", "-130%"], opacity: [0, 1, 0], scale: [0, 1.2, 0.8] }}
      transition={{ duration: 0.8, delay: CAUGHT_AT + 0.05, ease: pixelSteps(6) }}
    >
      <PixelArt rows={CATCH_STAR} palette={STAR_PALETTE} className="block size-full" />
    </motion.div>
  ));

/** One line of battle text, typed out and then cleared for the next one. */
const BattleLine = ({ text, from, until }) => (
  <motion.p
    className="absolute inset-0 px-[5%] py-[4%]"
    initial={{ opacity: 0 }}
    animate={{ opacity: until ? [0, 1, 1, 0] : [0, 1] }}
    transition={until ? { duration: until - from, delay: from, times: [0, 0.01, 0.97, 1] } : { duration: 0.01, delay: from }}
  >
    <TypedText text={text} startAt={from} perLetter={PER_LETTER} />
  </motion.p>
);

/** The text box along the bottom of the battle screen. */
const TextBox = () => (
  <div className="absolute inset-x-0 bottom-0 h-[30%] border-t-4 border-[#c84830] bg-[#283850] p-[1.5%]">
    <div className="relative size-full border-4 border-double border-[#f8f8f8] bg-[#3a5068] font-pixel text-[clamp(11px,3.4vw,19px)] leading-snug text-white [text-shadow:2px_2px_0_#202020]">
      <BattleLine text={APPEARED} from={APPEARED_AT} until={GO_AT} />
      <BattleLine text={GO} from={GO_AT} until={CAUGHT_AT} />
      <BattleLine text={GOTCHA} from={CAUGHT_AT + 0.05} />
    </div>
  </div>
);

/** The whole Gen 3 battle screen, in the GBA's 3 by 2 shape. */
const BattleScreen = () => (
  <motion.div
    className="relative aspect-[3/2] w-full max-w-xl overflow-hidden border-4"
    // the sky to grass fade in three flat bands, the most a 16 bit palette spends on it
    style={{ borderColor: INK, background: "linear-gradient(#f8f8e0 0 34%, #e0f0c0 34% 62%, #b8e090 62%)" }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.01, delay: SCENE_AT }}
  >
    <Platform className="top-[41%] left-[50%] w-[44%]" />
    <Platform className="top-[64%] left-[2%] w-[52%]" />
    <WildCristopher />
    <Trainer />
    <EnemyStatus />
    <CaptureBurst />
    <ThrownBall />
    <TextBox />
  </motion.div>
);

/** The Pokédex entry that registers right after the catch. */
const DexEntry = () => (
  <motion.div
    className="w-full max-w-xl border-4 p-1 shadow-[4px_4px_0_#000]"
    style={{ borderColor: INK, background: POKE_RED }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: DEX_AT, ease: pixelSteps(4) }}
  >
    <div className="border-2 border-[#a8240a] bg-[#f8f8f0] px-3 py-2 font-pixel text-[#202020]">
      <p className="text-[10px] tracking-widest text-[#c02a08] uppercase sm:text-xs">
        No. 009 Cristopher <span className="text-[#202020]/60 normal-case">· The Engineering Manager Pokémon</span>
      </p>
      <p className="mt-1 text-xs leading-snug text-pretty sm:text-sm">
        <TypedText text={EVOLVED} startAt={DEX_AT + 0.1} perLetter={DEX_PER_LETTER} />
      </p>
      <p className="mt-1 text-xs leading-snug text-pretty sm:text-sm">
        <TypedText text={MOVES} startAt={MOVES_AT} perLetter={DEX_PER_LETTER} />
      </p>
    </div>
  </motion.div>
);

/** A wild encounter: the screen flashes and wipes, Cristopher appears, gets caught and lands in the Pokédex. */
const WildEncounter = ({ onDone }) => {
  const isGentle = useReducedMotion();
  useMomentLength(MOMENT_MS, onDone);

  return (
    <EffectLayer background="rgba(6,8,14,0.9)" fade={0.3}>
      {/* nudged up so the Pokédex card clears the continue button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 pb-16">
        <BattleScreen />
        <DexEntry />
      </div>
      <BattleWipe isGentle={isGentle} />
      {!isGentle && <EncounterFlash />}
    </EffectLayer>
  );
};

export default WildEncounter;

