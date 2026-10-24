import { motion } from "framer-motion";
import { pixelSteps } from "../../../lib/motion";
import { FLOOR, floorCircleLines, floorGlyphPixels, haloPixels, pixelPath, splitRuns } from "./helpers";

const HALO_BLUE = "#1d4f96";
// each line traces itself in this many chunks, a few frames instead of a smooth pen
const TRACE_FRAMES = 4;
const TRACE_SECONDS = 0.55;

const LINES = floorCircleLines(FLOOR);
const GLYPHS = floorGlyphPixels(FLOOR);
const HALO = haloPixels([...LINES.flat(), ...GLYPHS]);

const HALO_PATH = pixelPath(HALO);
const GLYPH_PATH = pixelPath(GLYPHS);
// every line as the few chunks it traces itself in, worked out once at import
const TRACES = LINES.map((line) => splitRuns(line, TRACE_FRAMES).map(pixelPath));

/** One line of the circle appearing in chunks, the way an old game draws a spell circle frame by frame. */
const TracedLine = ({ runs, color, startAt }) =>
  runs.map((d, index) => (
    <motion.path
      key={d}
      d={d}
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.01, delay: startAt + (index * TRACE_SECONDS) / runs.length, ease: pixelSteps(1) }}
    />
  ));

/**
 * The transmutation circle lying on the floor, drawn on the same 100 by 60 pixel grid as the crackle around it.
 * Every line traces itself in turn from drawAt, then the glyphs and the hard edged halo light up.
 * @param {{ color: string, drawAt: number }} props
 */
export const FloorPixelCircle = ({ color, drawAt }) => (
  <g>
    <motion.path
      d={HALO_PATH}
      fill={HALO_BLUE}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.8 }}
      transition={{ duration: 0.3, delay: drawAt + 0.5, ease: pixelSteps(3) }}
    />
    {TRACES.map((runs, index) => (
      <TracedLine key={index} runs={runs} color={color} startAt={drawAt + index * 0.09} />
    ))}
    <motion.path d={GLYPH_PATH} fill="#ffffff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: drawAt + 0.5, ease: pixelSteps(3) }} />
  </g>
);
