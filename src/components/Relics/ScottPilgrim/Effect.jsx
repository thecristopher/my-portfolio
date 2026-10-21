import { motion, useReducedMotion } from "framer-motion";
import { EffectLayer, Shockwave, Sparks, TypedText } from "../shared";
import { useMomentLength, veil } from "../moment";
import { easeOutExpo } from "../../../lib/motion";
import { PIXEL_HEART, SCOTT_PINK, burstPoints, coinSpray, rowsToPath, textToPixelPath } from "./helpers";

const INK = "#140812";
const COMIC_YELLOW = "#ffe14d";
const BACKLOG_BLUE = "#3a4fd8";
const COIN_GOLD = "#e8b830";

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
const HEART_PATH = rowsToPath(PIXEL_HEART);
// snaps motion to a few frames, the way an 8 bit sprite moves
const steppy = (frames) => (progress) => Math.round(progress * frames) / frames;

/** The white flash where a hit connects. Reduced motion keeps it a soft glow instead of a strobe. */
const ImpactFlash = ({ at, strength, isGentle }) => (
  <motion.div
    className="absolute inset-0 bg-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: [0, isGentle ? 0.2 : strength, 0] }}
    transition={{ duration: 0.28, delay: at, times: [0, 0.15, 1] }}
  />
);

/** Big comic lettering: thick ink outline, a hard offset shadow and halftone dots printed inside the letters. */
const ComicWord = ({ text, fill, dots = SCOTT_PINK }) => (
  <span className="relative inline-block font-sans leading-none font-black tracking-tight italic">
    <span
      style={{
        color: fill,
        WebkitTextStroke: `0.06em ${INK}`,
        paintOrder: "stroke fill",
        textShadow: `0.06em 0.06em 0 ${INK}, 0.11em 0.11em 0 ${dots}`,
      }}
    >
      {text}
    </span>
    <span
      className="absolute inset-0 text-transparent"
      style={{
        backgroundImage: `radial-gradient(circle, ${dots} 0 28%, transparent 31%)`,
        backgroundSize: "0.1em 0.1em",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        opacity: 0.55,
      }}
    >
      {text}
    </span>
  </span>
);

/** An onomatopoeia burst: a spiky ink star with the sound word stamped on it, slammed in on its hit. */
const ImpactBurst = ({ word, at, className, tilt, fill, star }) => (
  <motion.div
    className={`absolute grid size-[min(46vw,15rem)] place-items-center ${className}`}
    initial={{ scale: 0, rotate: tilt - 30, opacity: 0 }}
    animate={{ scale: [0, 1.25, 1, 1, 0.9], rotate: tilt, opacity: [0, 1, 1, 1, 0] }}
    transition={{ duration: 2.3, delay: at, times: [0, 0.05, 0.12, 0.85, 1], ease: easeOutExpo }}
  >
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible">
      <polygon points={burstPoints(12, 50, 30)} fill={INK} transform="translate(3 3)" />
      <polygon points={burstPoints(12, 48, 30)} fill={star} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </svg>
    <span className="relative text-[min(12vw,4rem)]">
      <ComicWord text={word} fill={fill} />
    </span>
  </motion.div>
);

/** The fight card: Cristopher on the left, the backlog on the right, and the backlog greys out on the K.O. */
const VersusCard = () => (
  <div className="absolute inset-x-4 top-[11vh] mx-auto flex max-w-xl items-stretch justify-center">
    <motion.div
      className="flex flex-1 items-center justify-end border-y-4 border-l-4 py-2 pr-6 pl-3 [clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]"
      style={{ background: SCOTT_PINK, borderColor: INK }}
      initial={{ x: "-120%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: easeOutExpo }}
    >
      <span className="font-sans text-[min(4.2vw,1.5rem)] whitespace-nowrap font-black text-white italic">CRISTOPHER</span>
    </motion.div>
    <motion.div
      className="flex flex-1 items-center border-y-4 border-r-4 py-2 pr-3 pl-6 [clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)]"
      style={{ background: BACKLOG_BLUE, borderColor: INK }}
      initial={{ x: "120%", filter: "grayscale(0)" }}
      animate={{ x: 0, filter: ["grayscale(0)", "grayscale(0)", "grayscale(1)"] }}
      transition={{ x: { duration: 0.35, delay: 0.1, ease: easeOutExpo }, filter: { duration: KO_AT + 0.2, times: [0, 0.75, 1] } }}
    >
      <span className="font-sans text-[min(4.2vw,1.5rem)] whitespace-nowrap font-black text-white italic">THE BACKLOG</span>
    </motion.div>
    <motion.span
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[min(11vw,3.5rem)]"
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: [0, 1.4, 1], rotate: -8 }}
      transition={{ duration: 0.4, delay: 0.35, ease: easeOutExpo }}
    >
      <ComicWord text="VS" fill={COMIC_YELLOW} />
    </motion.span>
  </div>
);

/** K.O.! slammed down from huge, with comic speed lines spinning out behind it. */
const KnockOut = ({ isGentle }) => (
  <div className="absolute inset-0 grid place-items-center">
    <motion.div
      className="absolute top-1/2 left-1/2 size-[180vmax] -translate-x-1/2 -translate-y-1/2"
      style={{ background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,0.13) 0deg 2.5deg, transparent 2.5deg 11deg)" }}
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], rotate: isGentle ? 0 : 25 }}
      transition={{ duration: 2.2, delay: KO_AT, times: [0, 0.05, 0.8, 1], ease: "linear" }}
    />
    <motion.span
      className="relative text-[min(32vw,14rem)]"
      initial={{ scale: isGentle ? 1 : 3.2, opacity: 0, rotate: -6 }}
      animate={{ scale: 1, opacity: 1, rotate: -6 }}
      transition={{ duration: 0.22, delay: KO_AT, ease: "easeIn" }}
    >
      <ComicWord text="K.O.!" fill={COMIC_YELLOW} />
    </motion.span>
  </div>
);

/** Text in the 8 bit pixel font, with a hard one pixel shadow like an old score counter. */
const PixelText = ({ text, className = "" }) => {
  const { d, width, height } = textToPixelPath(text);
  return (
    <svg viewBox={`0 0 ${width + 1} ${height + 1}`} shapeRendering="crispEdges" className={`w-auto overflow-visible ${className}`}>
      <path d={d} fill={INK} transform="translate(1 1)" />
      <path d={d} fill="currentColor" />
    </svg>
  );
};

/** A chunky pixel coin that spins by squashing flat and back, the way sprite coins fake a turn. */
const PixelCoin = () => (
  <svg viewBox="0 0 5 5" shapeRendering="crispEdges" className="size-full">
    <path d="M1 0h3v1h1v3h-1v1h-3v-1h-1v-3h1z" fill={COIN_GOLD} />
    <path d="M2 1h1v3h-1z" fill="#fff3b0" />
  </svg>
);

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
          ease: "linear",
          // up fast and slowing, then down speeding up, the way anything thrown falls
          y: { duration: 1.3, delay: COINS_AT + delay, times: [0, 0.4, 1], ease: ["easeOut", "easeIn"] },
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
          transition={{ duration: 0.9, delay: COINS_AT + delay + 0.45, ease: "easeOut" }}
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
      x: { duration: 1.1, times: [0, 0.55, 0.62, 0.7, 0.78, 0.86, 0.93, 1] },
      opacity: { duration: LEVEL_UP_AT, times: [0, 0.94, 1] },
    }}
  >
    <KnockOut isGentle={isGentle} />
    <ImpactBurst word="POW!" at={POW_AT} className="top-[24vh] left-[2vw]" tilt={-12} fill="white" star={SCOTT_PINK} />
    <ImpactBurst word="BAM!" at={BAM_AT} className="right-[2vw] bottom-[16vh]" tilt={10} fill={SCOTT_PINK} star={COMIC_YELLOW} />
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
    transition={{ duration: 0.4, delay: EXP_AT, ease: steppy(4) }}
  >
    <motion.svg
      viewBox="0 0 8 7"
      shapeRendering="crispEdges"
      className="h-[min(8vw,2.5rem)] w-auto"
      animate={{ scale: [1, 1.18, 1] }}
      transition={{ duration: 0.5, delay: EXP_AT + 0.4, repeat: Infinity, ease: steppy(3) }}
    >
      <path d={HEART_PATH} fill={INK} transform="translate(1 1)" />
      <path d={HEART_PATH} fill="#ff3b6b" />
      <path d="M1 1h1v1h-1z" fill="#ffd0dc" />
    </motion.svg>
    <PixelText text="+9 YEARS EXP" className="h-[min(6vw,2rem)]" />
  </motion.div>
);

/** The promotion, typed out like a character's new class on the stats screen. */
const RankUp = () => (
  <motion.p
    className="font-mono text-[clamp(0.85rem,3.6vw,1.25rem)] font-bold tracking-wider text-white [text-shadow:2px_2px_0_#140812]"
    initial={{ opacity: 0, scale: 0.6 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3, delay: RANK_AT, ease: steppy(3) }}
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
          y: { duration: 0.35, delay: LEVEL_UP_AT, ease: steppy(6) },
          opacity: { duration: 0.05, delay: LEVEL_UP_AT },
          color: { duration: 0.6, delay: LEVEL_UP_AT + 0.35, repeat: Infinity, ease: steppy(3) },
        }}
      >
        <PixelText text="LEVEL UP!" className="h-[min(13vw,5rem)]" />
      </motion.div>
    </div>
    <RankUp />
    <ExperienceGained />
    <motion.p
      className="max-w-sm font-mono text-sm leading-relaxed text-pretty text-white sm:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01, delay: EARNED_AT }}
    >
      <TypedText text={EARNED} startAt={EARNED_AT} perLetter={PER_LETTER} />
      <span className="font-bold" style={{ color: SCOTT_PINK }}>
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
