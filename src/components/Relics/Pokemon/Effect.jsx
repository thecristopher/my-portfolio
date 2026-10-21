import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, TypedText } from "../shared";
import { useMomentLength } from "../moment";
import { spriteToPixels } from "../../../actions";
import { AVATAR_PALETTE, AVATAR_ROWS } from "../../../lib/avatarSprite";
import { easeOutExpo } from "../../../lib/motion";
import { pixelsToPaths, spritePaths, typingEnds, wobbleKeyframes } from "./helpers";
import { PixelPaths, PokeBallSprite } from "./pieces";
import { POKE_RED, TRAINER_BACK, TRAINER_PALETTE } from "./sprites";

const INK = "#202020";
const HP_GREEN = "#58d080";
const STAR_YELLOW = "#ffd84a";

// every beat lines up with its note in sound.js
const BARS_AT = 0.4;
const SCENE_AT = 0.9;
const APPEARED_AT = 1.35;
const THROW_AT = 2.3;
const ZAP_AT = 2.75;
const WOBBLE_AT = 3.4;
const CAUGHT_AT = 4.65;
const DEX_AT = 5.05;
const MOMENT_MS = 6000;
const PER_LETTER = 0.025;

const APPEARED = "A wild CRISTOPHER appeared!";
const GO = "Go! POKé BALL!";
const GOTCHA = "Gotcha! CRISTOPHER was caught!";
// the next line waits for the first to finish printing, like a real text box
const GO_AT = typingEnds(APPEARED, APPEARED_AT, PER_LETTER) + 0.05;
const WIPE_BANDS = 8;

const ENEMY_PIXELS = spriteToPixels(AVATAR_ROWS, AVATAR_PALETTE);
const ENEMY_PATHS = pixelsToPaths(ENEMY_PIXELS);
// the same sprite in one solid color, for the red flash as he's pulled into the ball
const ENEMY_RED = pixelsToPaths(ENEMY_PIXELS.map((pixel) => ({ ...pixel, color: "#ff5040" })));
const TRAINER_PATHS = spritePaths(TRAINER_BACK, TRAINER_PALETTE);
const WOBBLE = wobbleKeyframes(3);

/** The screen flashes white twice, the instant you know something jumped out of the grass. */
const EncounterFlash = () => (
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, 1, 0, 1, 0] }}
    transition={{ duration: BARS_AT, ease: "linear" }}
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
        transition={{ duration: 0.25, delay: BARS_AT + band * 0.03, ease: "easeIn" }}
      />
    ))}
  </motion.div>
);

/** A grass battle platform, the flat oval every Gen 3 Pokémon stands on. */
const Platform = ({ className }) => (
  <div className={`absolute rounded-[50%] border-b-4 border-[#5aa040] bg-[#a8e070] ${className}`} />
);

/** The enemy's box: name, gender, level and a full green HP bar. */
const EnemyStatus = () => (
  <motion.div
    className="absolute top-[7%] left-[4%] w-[46%] rounded-md rounded-br-2xl border-2 bg-[#f8f8d8] px-[3%] py-[2%] font-mono text-[clamp(9px,2.6vw,15px)] leading-tight font-bold text-[#404040] shadow-[3px_3px_0_#404040]"
    style={{ borderColor: INK }}
    initial={{ x: "-130%" }}
    animate={{ x: 0 }}
    transition={{ duration: 0.3, delay: SCENE_AT + 0.4, ease: easeOutExpo }}
  >
    <div className="flex items-baseline justify-between gap-1 whitespace-nowrap">
      <span>
        CRISTOPHER<span className="text-[#4080f0]">♂</span>
      </span>
      <span>Lv9</span>
    </div>
    <div className="mt-[4%] flex items-center gap-1">
      <span className="rounded-sm bg-[#404040] px-1 text-[0.7em] text-[#f8c040]">HP</span>
      <span className="h-[0.55em] flex-1 rounded-full border-2 border-[#404040] bg-[#404040]">
        <span className="block h-full rounded-full" style={{ background: HP_GREEN }} />
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
      x: { duration: 0.4, delay: SCENE_AT, ease: "linear" },
      scale: { duration: 0.35, delay: ZAP_AT, times: [0, 0.3, 1], ease: "easeIn" },
      opacity: { duration: 0.35, delay: ZAP_AT, times: [0, 0.8, 1] },
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
    transition={{ duration: 0.4, delay: SCENE_AT, ease: "linear" }}
  >
    <PixelPaths paths={TRAINER_PATHS} />
  </motion.svg>
);

/** The ball: thrown in an arc, swallows the target, drops, wobbles three times and clicks shut. */
const ThrownBall = () => (
  <motion.div
    className="absolute aspect-square w-[7%] -translate-x-1/2 -translate-y-1/2"
    initial={{ left: "14%", top: "70%", opacity: 0 }}
    animate={{ left: ["14%", "45%", "72%", "72%", "72%"], top: ["70%", "4%", "30%", "30%", "42%"], opacity: 1 }}
    transition={{
      duration: WOBBLE_AT - THROW_AT,
      delay: THROW_AT,
      times: [0, 0.23, 0.41, 0.73, 0.86],
      ease: ["easeOut", "easeIn", "linear", "easeIn"],
      opacity: { duration: 0.01, delay: THROW_AT },
    }}
  >
    <motion.div
      className="size-full"
      style={{ originY: 0.85 }}
      animate={{ rotate: [0, 720, 720, ...WOBBLE.rotate.slice(1).map((angle) => angle + 720)] }}
      transition={{
        duration: CAUGHT_AT - THROW_AT,
        delay: THROW_AT,
        times: [0, 0.19, (WOBBLE_AT - THROW_AT) / (CAUGHT_AT - THROW_AT), ...WOBBLE.times.slice(1).map(wobbleTime)],
      }}
    >
      <motion.div
        className="size-full"
        animate={{ filter: ["brightness(1)", "brightness(0.7)", "brightness(1)"] }}
        transition={{ duration: 0.3, delay: CAUGHT_AT }}
      >
        <PokeBallSprite className="block size-full" />
      </motion.div>
    </motion.div>
    <CatchStars />
  </motion.div>
);

// maps a wobble keyframe time onto the ball's whole spin and wobble timeline
function wobbleTime(time) {
  const wobbleStarts = (WOBBLE_AT - THROW_AT) / (CAUGHT_AT - THROW_AT);
  return Math.round((wobbleStarts + time * (1 - wobbleStarts)) * 1000) / 1000;
}

/** The white pop where the ball opens and pulls him in. */
const CaptureBurst = () => (
  <motion.div
    className="absolute top-[30%] left-[72%] size-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full"
    style={{ background: "radial-gradient(closest-side, #fff 0 40%, rgba(255,80,64,0.6) 60%, transparent)" }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
    transition={{ duration: 0.45, delay: ZAP_AT }}
  />
);

// three stars pop off the ball the moment it locks
const STAR_DRIFT = [-1, 0, 1];
const CatchStars = () =>
  STAR_DRIFT.map((side) => (
    <motion.svg
      key={side}
      viewBox="0 0 8 8"
      className="absolute top-0 left-1/2 size-[60%] -translate-x-1/2"
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{ x: `${side * 120}%`, y: ["0%", "-160%", "-110%"], opacity: [0, 1, 0], scale: [0, 1.2, 0.8] }}
      transition={{ duration: 0.8, delay: CAUGHT_AT + 0.05, ease: "easeOut" }}
    >
      <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill={STAR_YELLOW} stroke={INK} strokeWidth="0.5" />
    </motion.svg>
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
    <div className="relative size-full rounded-md border-2 border-[#f8f8f8]/80 bg-[#3a5068] font-mono text-[clamp(11px,3.4vw,19px)] leading-snug font-bold text-white [text-shadow:2px_2px_0_#202020]">
      <BattleLine text={APPEARED} from={APPEARED_AT} until={GO_AT} />
      <BattleLine text={GO} from={GO_AT} until={CAUGHT_AT} />
      <BattleLine text={GOTCHA} from={CAUGHT_AT + 0.05} />
    </div>
  </div>
);

/** The whole Gen 3 battle screen, in the GBA's 3 by 2 shape. */
const BattleScreen = () => (
  <motion.div
    className="relative aspect-[3/2] w-full max-w-xl overflow-hidden rounded-lg border-4 bg-gradient-to-b from-[#f8f8e0] via-[#e0f0c0] to-[#b8e090]"
    style={{ borderColor: INK }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.01, delay: SCENE_AT }}
  >
    <Platform className="top-[41%] left-[50%] h-[13%] w-[44%]" />
    <Platform className="top-[64%] left-[2%] h-[14%] w-[52%]" />
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
    className="w-full max-w-xl rounded-lg border-4 p-1"
    style={{ borderColor: INK, background: POKE_RED }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: DEX_AT, ease: easeOutExpo }}
  >
    <div className="rounded-md bg-[#f8f8f0] px-3 py-2 font-mono text-[#202020]">
      <p className="text-[10px] font-bold tracking-widest text-[#c02a08] uppercase">Pokédex No. 009 · Cristopher</p>
      <p className="mt-1 text-xs leading-snug sm:text-sm">
        <TypedText text="The Engineering Manager Pokémon. Leads teams and still writes the code." startAt={DEX_AT + 0.15} perLetter={0.008} />
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
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4">
        <BattleScreen />
        <DexEntry />
      </div>
      <BattleWipe isGentle={isGentle} />
      {!isGentle && <EncounterFlash />}
    </EffectLayer>
  );
};

export default WildEncounter;

