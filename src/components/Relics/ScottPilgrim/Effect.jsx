import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength, veil } from "../moment";
import PixelArt from "../../PixelArt";
import { pixelSteps } from "../../../lib/motion";
import { SCOTT_PINK, burstRows, coinSpray, textToPixelPath } from "./helpers";
import { COIN_PALETTE, COIN_ROWS, HEART_PALETTE, HEART_ROWS, INK } from "./sprites";

const COMIC_YELLOW = "#ffe14d";
const BACKLOG_BLUE = "#3a4fd8";

// every beat lines up with its hit in sound.js, so the panel lands on the punch you hear
const POW_AT = 0;
const BAM_AT = 0.3;
const KO_AT = 0.6;
const COINS_AT = 1.5;
const LEVEL_UP_AT = 2.6;
const RANK_AT = 3.2;
const EXP_AT = 3.85;
const EARNED_AT = 4.25;
const PER_LETTER = 0.02;
const EARNED = "Cristopher earned the ";
const POWER = "POWER OF LEADERSHIP";
const PAYOFF = ": FirstWord, DGPL, MEC, AMI, one team.";
// the last letter of the payoff lands here, after that the level up screen just holds
const MOMENT_MS = Math.ceil((EARNED_AT + (EARNED.length + POWER.length + PAYOFF.length) * PER_LETTER) * 1000) + 100;

const COINS = coinSpray(9);
const BURST_ROWS = burstRows(36, 10);
// thrown coins slow down on the way up and speed up on the way down, still in chunky frames
const RISE = (progress) => pixelSteps(5)(1 - (1 - progress) ** 2);
const FALL = (progress) => pixelSteps(6)(progress ** 2);
// the ink outline goes all the way around a pixel word, then the hard shadows stack down and to the right
const OUTLINE_OFFSETS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** The white flash where a hit connects. Reduced motion keeps it a soft glow instead of a strobe. */
const ImpactFlash = ({ at, strength, isGentle }) => (
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, isGentle ? 0.2 : strength, 0] }}
    transition={{ duration: 0.28, delay: at, times: [0, 0.15, 1], ease: pixelSteps(3) }}
  />
);

/** Text in the pixel font: an optional ink outline, then hard one pixel shadows like an old score counter. */
const PixelText = ({ text, className = "", fill = "currentColor", shadows = [INK], isOutlined = false }) => {
  const { d, width, height } = textToPixelPath(text);
  const pad = isOutlined ? 1 : 0;
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${width + shadows.length + pad * 2} ${height + shadows.length + pad * 2}`}
      shapeRendering="crispEdges"
      className={`w-auto overflow-visible ${className}`}
    >
      {shadows.map((color, index) => (
        <path key={color} d={d} fill={color} transform={`translate(${shadows.length - index} ${shadows.length - index})`} />
      ))}
      {isOutlined && OUTLINE_OFFSETS.map(([x, y]) => <path key={`${x}${y}`} d={d} fill={INK} transform={`translate(${x} ${y})`} />)}
      <path d={d} fill={fill} />
    </svg>
  );
};

/** Big comic lettering on the pixel grid: ink outlined, with an ink shadow and a colored one under it. */
const ComicWord = ({ text, fill, dots = SCOTT_PINK, className }) => (
  <PixelText text={text} fill={fill} shadows={[dots, INK]} isOutlined className={className} />
);

/** An onomatopoeia burst: a spiky pixel star with the sound word stamped on it, slammed in on its hit. */
const ImpactBurst = ({ word, at, className, fill, star, shade }) => (
  <motion.div
    className={`absolute grid size-[min(46vw,15rem)] place-items-center ${className}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.25, 1, 1, 0.9], opacity: [0, 1, 1, 1, 0] }}
    transition={{ duration: 2.3, delay: at, times: [0, 0.05, 0.12, 0.85, 1], ease: pixelSteps(3) }}
  >
    <PixelArt rows={BURST_ROWS} palette={{ K: INK, S: star, s: shade }} className="absolute inset-0 size-full" style={{ filter: `drop-shadow(6px 6px 0 ${INK})` }} />
    <ComicWord text={word} fill={fill} className="relative h-[min(9vw,3rem)]" />
  </motion.div>
);

/** The fight card: Cristopher on the left, the backlog on the right, and the backlog greys out on the K.O. */
const VersusCard = () => (
  <div className="absolute inset-x-4 top-[11vh] mx-auto flex max-w-xl items-stretch justify-center">
    <motion.div
      className="flex flex-1 items-center justify-end border-4 border-r-0 py-2 pr-6 pl-3 shadow-[inset_0_-4px_0_#c23a7c]"
      style={{ background: SCOTT_PINK, borderColor: INK }}
      initial={{ x: "-120%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: pixelSteps(5) }}
    >
      <span className="font-pixel text-[min(4.2vw,1.5rem)] whitespace-nowrap text-white [text-shadow:2px_2px_0_#140812]">CRISTOPHER</span>
    </motion.div>
    <motion.div
      className="flex flex-1 items-center border-4 border-l-0 py-2 pr-3 pl-6 shadow-[inset_0_-4px_0_#25339a]"
      style={{ background: BACKLOG_BLUE, borderColor: INK }}
      initial={{ x: "120%", filter: "grayscale(0)" }}
      animate={{ x: 0, filter: ["grayscale(0)", "grayscale(0)", "grayscale(1)"] }}
      transition={{ x: { duration: 0.35, delay: 0.1, ease: pixelSteps(5) }, filter: { duration: KO_AT + 0.2, times: [0, 0.75, 1], ease: pixelSteps(2) } }}
    >
      <span className="font-pixel text-[min(4.2vw,1.5rem)] whitespace-nowrap text-white [text-shadow:2px_2px_0_#140812]">THE BACKLOG</span>
    </motion.div>
    <motion.span
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ scale: 0 }}
      animate={{ scale: [0, 1.4, 1] }}
      transition={{ duration: 0.4, delay: 0.35, ease: pixelSteps(4) }}
    >
      <ComicWord text="VS" fill={COMIC_YELLOW} className="block h-[min(9vw,2.75rem)]" />
    </motion.span>
  </div>
);

/** K.O.! slammed down from huge, with comic speed lines spinning out behind it. */
const KnockOut = ({ isGentle }) => (
  <div className="absolute inset-0 grid place-items-center">
    <motion.div
      className="absolute top-1/2 left-1/2 size-[180vmax] -translate-x-1/2 -translate-y-1/2"
      // hard edged speed lines that tick around a few degrees at a time instead of gliding
      style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.13) 0deg 2.5deg, transparent 2.5deg 11deg)" }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], rotate: isGentle ? 0 : 25 }}
      transition={{ duration: 2.2, delay: KO_AT, times: [0, 0.05, 0.8, 1], ease: pixelSteps(10) }}
    />
    <motion.span
      className="relative"
      initial={{ scale: isGentle ? 1 : 3.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.22, delay: KO_AT, ease: pixelSteps(4) }}
    >
      <ComicWord text="K.O.!" fill={COMIC_YELLOW} className="block h-[min(22vw,9rem)]" />
    </motion.span>
  </div>
);

/** A chunky pixel coin that spins by squashing flat and back, the way sprite coins fake a turn. */
const PixelCoin = () => <PixelArt rows={COIN_ROWS} palette={COIN_PALETTE} className="block size-full" />;

/** The beaten backlog pays out: coins fly up and rain down, every other one flashing a +1000. */
const CoinShower = () =>
  COINS.map(({ x, peak, delay }, index) => (
    <div key={x} className="absolute top-1/2 left-1/2">
      <motion.div
        className="-mt-[3vmin] -ml-[3vmin] size-[6vmin]"
        initial={{ x: 0, y: 0, opacity: 0 }}
        animate={{ x: `${x}vmin`, y: ["0vmin", `-${peak}vmin`, "50vmin"], opacity: [0, 1, 1, 0], scaleX: [1, 0.2, 1, 0.2, 1, 0.2, 1] }}
        transition={{
          duration: 1.3,
          delay: COINS_AT + delay,
          ease: pixelSteps(8),
          // up in big steps that shrink, then down in steps that grow, the way anything thrown falls
          y: { duration: 1.3, delay: COINS_AT + delay, times: [0, 0.4, 1], ease: [RISE, FALL] },
        }}
      >
        <PixelCoin />
      </motion.div>
      {index % 2 === 0 && (
        <motion.div
          className="absolute -translate-x-1/2"
          style={{ color: COMIC_YELLOW }}
          initial={{ x: `${x}vmin`, y: `-${peak}vmin`, opacity: 0 }}
          animate={{ y: `-${peak + 12}vmin`, opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.9, delay: COINS_AT + delay + 0.45, ease: pixelSteps(5) }}
        >
          <PixelText text="+1000" className="h-[min(4vw,1.25rem)]" />
        </motion.div>
      )}
    </div>
  ));

/** Everything from the first punch to the payout, shaken as one panel when the K.O. lands. */
const Fight = ({ isGentle }) => (
  <motion.div
    className="absolute inset-0"
    animate={{
      x: isGentle ? 0 : [0, 0, -14, 12, -8, 6, -3, 0],
      opacity: [1, 1, 0],
    }}
    transition={{
      x: { duration: 1.1, times: [0, 0.55, 0.62, 0.7, 0.78, 0.86, 0.93, 1], ease: pixelSteps(1) },
      opacity: { duration: LEVEL_UP_AT, times: [0, 0.94, 1], ease: pixelSteps(3) },
    }}
  >
    <KnockOut isGentle={isGentle} />
    <ImpactBurst word="POW!" at={POW_AT} className="top-[24vh] left-[2vw]" fill="white" star={SCOTT_PINK} shade="#c23a7c" />
    <ImpactBurst word="BAM!" at={BAM_AT} className="right-[2vw] bottom-[16vh]" fill={SCOTT_PINK} star={COMIC_YELLOW} shade="#d9a520" />
    <VersusCard />
    <CoinShower />
  </motion.div>
);

/** The experience gained: a pixel heart beating next to +9 YEARS EXP. */
const ExperienceGained = () => (
  <motion.div
    className="flex items-center gap-3"
    style={{ color: SCOTT_PINK }}
    initial={{ opacity: 0, scale: 0.4 }}
    animate={{ opacity: 1, scale: [0.4, 1.2, 1] }}
    transition={{ duration: 0.4, delay: EXP_AT, ease: pixelSteps(4) }}
  >
    <motion.span
      className="block h-[min(8vw,2.5rem)] aspect-[9/8]"
      animate={{ scale: [1, 1.18, 1] }}
      transition={{ duration: 0.5, delay: EXP_AT + 0.4, repeat: Infinity, ease: pixelSteps(3) }}
    >
      <PixelArt rows={HEART_ROWS} palette={HEART_PALETTE} className="block size-full" />
    </motion.span>
    <PixelText text="+9 YEARS EXP" className="h-[min(6vw,2rem)]" />
  </motion.div>
);

/** The promotion, typed out like a character's new class on the stats screen. */
const RankUp = () => (
  <motion.p
    className="font-pixel text-[clamp(0.85rem,3.6vw,1.25rem)] tracking-wider text-white [text-shadow:2px_2px_0_#140812]"
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: RANK_AT, ease: pixelSteps(3) }}
  >
    INTERN <span style={{ color: COMIC_YELLOW }}>→</span> <span style={{ color: SCOTT_PINK }}>ENGINEERING MANAGER</span>
  </motion.p>
);

/** LEVEL UP! drops in pixel by pixel, the promotion and the experience pop in, and the reward line types out last. */
const LevelUp = ({ isGentle }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 pb-16 text-center">
    <div className="relative grid place-items-center">
      <Shockwave color={SCOTT_PINK} delay={LEVEL_UP_AT + 0.1} />
      <Sparks colors={[SCOTT_PINK, COMIC_YELLOW, "#7ee8ff"]} count={14} reach={36} delay={LEVEL_UP_AT + 0.15} />
      <motion.div
        initial={{ y: isGentle ? 0 : "-60vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1, color: [COMIC_YELLOW, SCOTT_PINK, "#7ee8ff", COMIC_YELLOW] }}
        transition={{
          y: { duration: 0.35, delay: LEVEL_UP_AT, ease: pixelSteps(6) },
          opacity: { duration: 0.05, delay: LEVEL_UP_AT },
          color: { duration: 0.6, delay: LEVEL_UP_AT + 0.35, repeat: Infinity, ease: pixelSteps(3) },
        }}
      >
        <PixelText text="LEVEL UP!" className="h-[min(13vw,5rem)]" />
      </motion.div>
    </div>
    <RankUp />
    <ExperienceGained />
    <motion.p
      className="max-w-sm font-pixel text-sm leading-relaxed text-pretty text-white [text-shadow:2px_2px_0_#140812] sm:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01, delay: EARNED_AT }}
    >
      <TypedText text={EARNED} startAt={EARNED_AT} perLetter={PER_LETTER} />
      <span style={{ color: SCOTT_PINK }}>
        <TypedText text={POWER} startAt={EARNED_AT + EARNED.length * PER_LETTER} perLetter={PER_LETTER} />
      </span>
      <TypedText text={PAYOFF} startAt={EARNED_AT + (EARNED.length + POWER.length) * PER_LETTER} perLetter={PER_LETTER} />
    </motion.p>
  </div>
);

/** Scott Pilgrim K.O.: two hits flash white, the backlog gets knocked out, pays out in coins and Cristopher levels up and stays there. */
const KnockOutMoment = ({ onDone }) => {
  const isGentle = useReducedMotion();
  useMomentLength(MOMENT_MS, onDone);

  return (
    <EffectLayer background={veil(SCOTT_PINK, 0.88)} fade={0.3}>
      <Fight isGentle={isGentle} />
      <LevelUp isGentle={isGentle} />
      <ImpactFlash at={POW_AT} strength={1} isGentle={isGentle} />
      <ImpactFlash at={BAM_AT} strength={0.7} isGentle={isGentle} />
      <ImpactFlash at={KO_AT} strength={0.85} isGentle={isGentle} />
    </EffectLayer>
  );
};

export default KnockOutMoment;
