import { motion } from "framer-motion";
import { Bloom, Burst, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { pointOnCircle } from "../../../lib/geometry";
import { RELICS } from "../../../lib/relics";
import { easeOutExpo } from "../../../lib/motion";

const PINK = RELICS.scott.color;
const COIN_GOLD = "#ffd23f";

// every hit lands on its beat in sound.js: two hits, then the K.O. crash
const HITS = [
  { word: "POW", at: 0, x: "-34vw", y: "-26vh", turn: -10 },
  { word: "BAM", at: 0.3, x: "22vw", y: "6vh", turn: 8 },
];
const KO_AT = 0.6;
const COINS_AT = 1.5;
const LEVEL_AT = 2.6;
const COPY_AT = 3.1;
const MOMENT_MS = 4600;

// the coins the beaten backlog drops, fanned out above the K.O.
const COINS = Array.from({ length: 10 }, (_, index) => ({ index, ...pointOnCircle(-70 + index * 15.5, 34) }));

// a hit word slams in oversized and skewed, then hangs there like a comic panel
const HitWord = ({ word, at, x, y, turn }) => (
  <motion.p
    className="absolute top-[38%] left-1/2 text-[clamp(3rem,10vw,7rem)] font-black tracking-tighter italic"
    style={{ x, y, color: PINK, WebkitTextStroke: "2px white" }}
    initial={{ scale: 3, opacity: 0, rotate: turn * 2 }}
    animate={{ scale: [3, 0.9, 1], opacity: [0, 1, 0.35], rotate: turn }}
    transition={{ duration: 0.9, delay: at, ease: easeOutExpo }}
  >
    {word}
  </motion.p>
);

const KnockOut = () => (
  <motion.p
    className="absolute top-[34%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(6rem,22vw,16rem)] leading-none font-black tracking-[-0.08em] italic"
    style={{ backgroundImage: `linear-gradient(180deg, #ffffff 0%, ${PINK} 70%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
    initial={{ scale: 4, opacity: 0, filter: "blur(20px)" }}
    animate={{ scale: 1, opacity: 1, filter: "blur(0px)", x: [0, -14, 12, -6, 0] }}
    transition={{ duration: 0.7, delay: KO_AT, ease: easeOutExpo, x: { duration: 0.4, delay: KO_AT + 0.3 } }}
  >
    K.O.
  </motion.p>
);

const Coins = () =>
  COINS.map((coin) => (
    <motion.span
      key={coin.index}
      className="absolute top-[34%] left-1/2 size-5 rounded-full border-2 border-[#b8860b]"
      style={{ background: `radial-gradient(circle at 35% 35%, #fff6c2, ${COIN_GOLD} 60%)` }}
      initial={{ x: 0, y: 0, opacity: 0, rotateY: 0 }}
      animate={{ x: `${coin.x}vmin`, y: [`0vmin`, `${coin.y - 10}vmin`, `${coin.y + 30}vmin`], opacity: [0, 1, 0], rotateY: 720 }}
      transition={{ duration: 1.6, delay: COINS_AT + coin.index * 0.04, ease: "easeOut" }}
    />
  ));

// the level up bar filling under the K.O., the way a fighting game pays out at the end of a round
const LevelUp = () => (
  <motion.div
    className="absolute top-[55%] left-1/2 flex w-[min(80vw,26rem)] -translate-x-1/2 flex-col gap-2"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: LEVEL_AT, ease: easeOutExpo }}
  >
    <span className="flex justify-between text-xs font-semibold tracking-wider text-white/70 uppercase">
      <span>Level up</span>
      <span style={{ color: PINK }}>+ Power of leadership</span>
    </span>
    <span className="h-2 overflow-hidden rounded-full bg-white/15">
      <motion.span
        className="block h-full origin-left rounded-full"
        style={{ background: `linear-gradient(90deg, ${PINK}, ${COIN_GOLD})` }}
        initial={{ scaleX: 0.15 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: LEVEL_AT + 0.2, ease: easeOutExpo }}
      />
    </span>
  </motion.div>
);

/** Scott Pilgrim: two hits, a K.O. that shakes the screen, the coins of the beaten backlog and a level up. */
const KnockOutMoment = ({ onDone }) => {
  useMomentLength(MOMENT_MS, onDone);
  return (
    <MomentLayer color={PINK} glowAt="50% 34%">
      {HITS.map((hit) => (
        <HitWord key={hit.word} {...hit} />
      ))}
      <Bloom color={PINK} at={KO_AT} className="top-[34%]" />
      <Burst color="#ffffff" at={KO_AT} count={20} className="top-[34%]" />
      <KnockOut />
      <Coins />
      <LevelUp />
      <MomentCopy
        color={PINK}
        eyebrow="Scott Pilgrim"
        title="The backlog is down."
        lines={["Cristopher earned the Power of Leadership: FirstWord, DGPL, MEC and AMI, one team."]}
        at={COPY_AT}
        className="bottom-[8vh]"
      />
    </MomentLayer>
  );
};

export default KnockOutMoment;
