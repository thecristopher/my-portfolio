import { motion } from "framer-motion";
import { circlePath, glyphMarks, hexagramPaths } from "./helpers";

// the circle on a 100 unit grid: two rings, glyphs between them, the hexagram and a small core ring
const RINGS = [circlePath(50, 50, 47), circlePath(50, 50, 39), circlePath(50, 50, 13)];
const HEXAGRAM = hexagramPaths(50, 50, 39);
const GLYPHS = glyphMarks(50, 50, 43, 12);
const LINES = [RINGS[0], RINGS[1], ...HEXAGRAM, RINGS[2]];

const Glyph = ({ kind }) => {
  if (kind === "dot") return <circle r="1.4" />;
  if (kind === "bar") return <path d="M-2.2 0 H2.2" />;
  return <path d="M0 -2 V2 M-1.4 -0.6 H1.4" />;
};

/**
 * A transmutation circle. Still, it's chalk on the page. Given a draw delay, every line traces itself in turn.
 * @param {{ color: string, strokeWidth?: number, drawAt?: number | null, className?: string, style?: object, filter?: string }} props
 */
export const TransmutationCircle = ({ color, strokeWidth = 1.6, drawAt = null, className = "", style, filter }) => {
  const isDrawing = drawAt !== null;

  return (
    <svg viewBox="0 0 100 100" className={`overflow-visible ${className}`} style={style} aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" filter={filter}>
        {LINES.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            initial={isDrawing ? { pathLength: 0 } : false}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.55, delay: (drawAt ?? 0) + index * 0.09, ease: "easeInOut" }}
          />
        ))}
        <motion.g
          initial={isDrawing ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: (drawAt ?? 0) + 0.5 }}
        >
          {GLYPHS.map(({ x, y, rotate, kind }) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rotate})`} fill={kind === "dot" ? color : "none"}>
              <Glyph kind={kind} />
            </g>
          ))}
        </motion.g>
      </g>
    </svg>
  );
};
