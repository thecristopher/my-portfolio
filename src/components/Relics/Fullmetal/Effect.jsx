import { motion } from "framer-motion";
import { Bloom, DrawnPath, MomentCopy, MomentLayer } from "../shared";
import { useMomentLength } from "../moment";
import { FLAMEL_RED, FLAMEL_STROKES } from "../artwork";
import { polygonPoints } from "../actions";
import { pointOnCircle } from "../../../lib/geometry";
import { easeOutExpo } from "../../../lib/motion";
import { BEATS, crackleTimes, lightningBolt, seededRandom, toPolyline } from "./helpers";

const ALCHEMY_BLUE = "#4fa8ff";
const CENTER = { x: 100, y: 100 };

// the circle as strokes: two rings, a hexagram and six small glyph rings around it
const RING = (radius) => `M${100 - radius} 100a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0`;
const TRIANGLES = [polygonPoints(3, 62, CENTER), polygonPoints(3, 62, CENTER, 180)].map((points) => `M${points.replaceAll(" ", "L")}Z`);
const GLYPHS = Array.from({ length: 6 }, (_, index) => pointOnCircle(index * 60 + 30, 80, CENTER));

// blue lightning crawling around the rim, a fresh bolt on every crackle in the jingle
const random = seededRandom(7);
const BOLTS = crackleTimes(BEATS.crackleFrom, BEATS.crackleTo, 12).map((at, index) => {
  const from = pointOnCircle(index * 47, 92, CENTER);
  const to = pointOnCircle(index * 47 + 38, 92, CENTER);
  return { at, points: toPolyline(lightningBolt(from, to, { segments: 6, jitter: 9, random })) };
});

// the clap: two streaks of light meet in the middle and flash
const Clap = () =>
  [-1, 1].map((side) => (
    <motion.span
      key={side}
      className="absolute top-[34%] left-1/2 h-px w-[40vw]"
      style={{ background: `linear-gradient(${side < 0 ? "90deg" : "270deg"}, transparent, #ffffff)`, originX: side < 0 ? 1 : 0 }}
      initial={{ x: side < 0 ? "-140%" : "40%", opacity: 0 }}
      animate={{ x: side < 0 ? "-100%" : "0%", opacity: [0, 1, 0] }}
      transition={{ duration: 0.4, delay: BEATS.clap - 0.2, ease: easeOutExpo }}
    />
  ));

const Circle = () => (
  <svg viewBox="0 0 200 200" className="absolute top-[34%] left-1/2 size-[min(56vmin,30rem)] -translate-x-1/2 -translate-y-1/2 overflow-visible">
    <motion.g initial={{ rotate: -40 }} animate={{ rotate: 0 }} transition={{ duration: 4, delay: BEATS.drawCircle, ease: easeOutExpo }} style={{ originX: "100px", originY: "100px" }}>
      <DrawnPath d={RING(92)} color={ALCHEMY_BLUE} at={BEATS.drawCircle} duration={1.1} width={1.2} />
      <DrawnPath d={RING(70)} color={ALCHEMY_BLUE} at={BEATS.drawCircle + 0.15} duration={1.1} width={0.8} />
      {TRIANGLES.map((d, index) => (
        <DrawnPath key={d} d={d} color={ALCHEMY_BLUE} at={BEATS.drawCircle + 0.3 + index * 0.15} duration={0.9} width={0.9} />
      ))}
      {GLYPHS.map((glyph, index) => (
        <DrawnPath key={index} d={`M${glyph.x - 8} ${glyph.y}a8 8 0 1 0 16 0a8 8 0 1 0-16 0`} color={ALCHEMY_BLUE} at={BEATS.drawCircle + 0.6 + index * 0.06} duration={0.5} width={0.8} />
      ))}
    </motion.g>
    {BOLTS.map((bolt) => (
      <motion.polyline
        key={bolt.at}
        points={bolt.points}
        fill="none"
        stroke="#d6ecff"
        strokeWidth="1.2"
        style={{ filter: `drop-shadow(0 0 4px ${ALCHEMY_BLUE})` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.18, delay: bolt.at }}
      />
    ))}
    {/* the cross stamps in the middle in red, drawn in one breath */}
    <g transform="translate(68 68)">
      {FLAMEL_STROKES.map((d, index) => (
        <DrawnPath key={d} d={d} color={FLAMEL_RED} at={BEATS.stamp + index * 0.08} duration={0.6} width={3.5} />
      ))}
    </g>
  </svg>
);

/** Fullmetal Alchemist: a clap, a transmutation circle drawn in blue light and crackling, and the Flamel cross stamped red. */
const TransmutationMoment = ({ onDone }) => {
  useMomentLength(BEATS.lastsMs, onDone);
  return (
    <MomentLayer color={ALCHEMY_BLUE} glowAt="50% 40%">
      <Clap />
      <Bloom color={ALCHEMY_BLUE} at={BEATS.clap} size="min(60vmin,28rem)" className="top-[34%]" />
      <Circle />
      <Bloom color={FLAMEL_RED} at={BEATS.stamp} size="min(40vmin,18rem)" className="top-[34%]" />
      <MomentCopy
        color={ALCHEMY_BLUE}
        eyebrow="Fullmetal Alchemist"
        title="Equivalent Exchange."
        lines={["To obtain, something of equal value must be lost.", "One React codebase in, three FirstWord brands out."]}
        at={BEATS.title}
      />
    </MomentLayer>
  );
};

export default TransmutationMoment;
